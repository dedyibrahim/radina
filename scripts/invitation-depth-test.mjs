import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const base = process.env.TEST_URL
assert(
  base &&
    new URL(base).hostname === '127.0.0.1' &&
    new URL(base).port === '8001',
)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 900 },
  reducedMotion: 'no-preference',
  isMobile: true,
  hasTouch: true,
})
const page = await context.newPage(),
  errors = [],
  dir = 'test-results/invitation-depth'
await mkdir(dir, { recursive: true })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.text().includes('[Vue warn]')) errors.push(m.text())
})
try {
  const templates = []
  for (let p = 1, last = 1; p <= last; p++) {
    const response = await context.request.get(
      `${base}/api/templates?page=${p}`,
    )
    assert.equal(response.status(), 200)
    const result = await response.json()
    last = result.meta.last_page
    templates.push(...result.data)
  }
  assert(templates.length > 0, 'No templates were discovered')
  for (const [index, template] of templates.entries()) {
    console.log(`Checking ${index + 1}/${templates.length}: ${template.slug}`)
    await page.goto(`${base}/templates/${template.slug}/preview`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('.wedding-page')).toHaveAttribute(
      'data-depth-enabled',
      'true',
    )
    await expect
      .poll(() => page.locator('.design-cover .depth-card').count())
      .toBeGreaterThan(0)
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Cover overflow: ${template.slug}`,
    )
    const depthTarget = page
      .locator('.design-cover .depth-card:not(.depth-typography)')
      .first()
    const depth = await (
      (await depthTarget.count())
        ? depthTarget
        : page.locator('.depth-card').first()
    ).evaluate((el) => ({
      translate: getComputedStyle(el).translate,
      perspective: getComputedStyle(el.parentElement).perspective,
    }))
    assert.notEqual(depth.perspective, 'none', template.slug)
    if (await depthTarget.count())
      assert.notEqual(depth.translate, 'none', template.slug)
    await page
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(page.locator('.invitation-content')).toBeVisible()
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Content overflow: ${template.slug}`,
    )
    await expect
      .poll(() => page.locator('.invitation-content .depth-card').count())
      .toBeGreaterThan(0)
    if ((index + 1) % 15 === 0)
      console.log(
        `${index + 1}/${templates.length} template covers and content passed`,
      )
  }
  // Motion preferences and the existing toggle control 3D as well as particles.
  await page
    .getByRole('button', { name: 'Matikan animasi', exact: true })
    .click()
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'false',
  )
  assert.equal(
    await page
      .locator('.depth-card')
      .first()
      .evaluate((el) => getComputedStyle(el).rotate),
    'none',
  )
  await page
    .getByRole('button', { name: 'Aktifkan animasi', exact: true })
    .click()
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'true',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'false',
  )
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'true',
  )
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  })
  const d = await desktop.newPage()
  d.on('pageerror', (e) => errors.push(e.message))
  await d.goto(`${base}/templates/rosalia-arch/preview`, {
    waitUntil: 'networkidle',
  })
  await expect(d.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'true',
  )
  const card = d.locator('.floral-cover-photo'),
    box = await card.boundingBox()
  await d.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.6)
  await expect(card).toHaveClass(/depth-live/)
  assert.notEqual(
    await card.evaluate((el) => el.style.getPropertyValue('--depth-angle')),
    '',
  )
  await d.screenshot({ path: `${dir}/depth-desktop.png` })
  await d.mouse.move(0, 0)
  await expect(card).not.toHaveClass(/depth-live/)
  for (const type of ['office', 'khitanan', 'birthday', 'aqiqah', 'other']) {
    await page.goto(
      `${base}/templates/romantic-floral/preview?event_type=${type}`,
      { waitUntil: 'domcontentloaded' },
    )
    await expect(page.locator('.wedding-page')).toHaveAttribute(
      'data-depth-enabled',
      'true',
    )
    await expect
      .poll(() => page.locator('.design-cover .depth-card').count())
      .toBeGreaterThan(0)
  }
  assert.deepEqual(errors, [])
  console.log(
    `PASS: all ${templates.length} template covers/content with real CSS 3D depth, mobile layout, five other event types, desktop pointer parallax, motion toggle and reduced motion.`,
  )
} finally {
  await browser.close()
}
