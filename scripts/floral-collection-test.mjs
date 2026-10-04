import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

// Asset generation runs only on the isolated database/server, never production.
const base = process.env.TEST_URL
assert(
  base &&
    new URL(base).hostname === '127.0.0.1' &&
    new URL(base).port === '8001',
)
const capture = process.env.CAPTURE_FLORAL_COVERS === '1'
const collection = JSON.parse(
  await readFile('config/floral-collection.json', 'utf8'),
)
const dir = 'test-results/floral-collection'
await mkdir(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 900 },
  reducedMotion: 'reduce',
})
const page = await context.newPage(),
  errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.text().includes('[Vue warn]')) errors.push(m.text())
})
async function fits(label) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Overflow: ${label}`,
  )
  await page.locator('img').evaluateAll((images) =>
    Promise.all(
      images.map((img) => {
        img.loading = 'eager'
        return img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true })
              img.addEventListener('error', resolve, { once: true })
            })
      }),
    ),
  )
  assert.deepEqual(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.filter((img) => !img.naturalWidth).map((img) => img.src),
      ),
    [],
    `Broken photo: ${label}`,
  )
}
try {
  for (const [index, [key, design]] of Object.entries(collection).entries()) {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto(`${base}/templates/${key}/preview`, {
      waitUntil: 'networkidle',
    })
    await expect(page.locator('.floral-cover')).toHaveAttribute(
      'data-layout',
      design.family,
    )
    await expect(page.locator('.floral-cover .atelier-corner')).toHaveCount(4)
    const quadrants = await page
      .locator('.floral-cover .atelier-corner')
      .evaluateAll((corners) =>
        corners.map((el) => {
          const r = el.getBoundingClientRect(),
            cover = el.closest('.floral-cover').getBoundingClientRect()
          return `${r.x + r.width / 2 < cover.x + cover.width / 2 ? 'left' : 'right'}-${r.y + r.height / 2 < cover.y + cover.height / 2 ? 'top' : 'bottom'}`
        }),
      )
    assert.equal(
      new Set(quadrants).size,
      4,
      `Flowers do not occupy four corners: ${key}`,
    )
    await expect(
      page.getByRole('button', { name: 'Buka Undangan', exact: true }),
    ).toBeVisible()
    await expect(page.locator('.scene-motion')).toHaveAttribute(
      'data-effects',
      design.motion.join(','),
    )
    await fits(`${key} cover`)
    await page.evaluate(() => document.fonts.ready)
    if (capture) {
      await page.addStyleTag({
        content:
          '.motion-toggle,.wedding-preview-tools{display:none!important}',
      })
      const png = `${dir}/${key}-cover.png`
      await page.locator('.floral-cover').screenshot({ path: png })
      execFileSync('php', [
        'scripts/convert-demo-image.php',
        png,
        `frontend/public/images/templates/previews/${key}.webp`,
      ])
    }
    await page.setViewportSize({ width: 320, height: 900 })
    await fits(`${key} narrow cover`)
    await page
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(page.locator('#event')).toBeVisible()
    await expect(page.locator('#couple')).toBeVisible()
    await expect(
      page.locator('[data-section="event"] .atelier-corner'),
    ).toHaveCount(4)
    await fits(`${key} narrow content`)
    await page.setViewportSize({ width: 1440, height: 900 })
    await fits(`${key} desktop`)
    if ((index + 1) % 5 === 0) console.log(`Floral previews: ${index + 1}/55`)
  }
  for (const [family, key] of [
    'rosalia-arch',
    'peony-love-letter',
    'magnolia-muse',
    'rosewood-nocturne',
    'sakura-serenade',
  ].entries()) {
    const type = ['khitanan', 'office', 'birthday', 'aqiqah', 'other'][family]
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto(`${base}/templates/${key}/preview?event_type=${type}`, {
      waitUntil: 'networkidle',
    })
    const title = await page.locator('.floral-cover h1').innerText()
    assert(title.trim().length)
    await page
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(page.locator('.floral-hero h1')).toHaveText(title)
    await expect(page.locator('#couple .floral-host')).toBeVisible()
    await expect(page.locator('#couple .floral-people-grid')).toHaveCount(0)
    await fits(`${family} ${type}`)
  }
  const moving = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: 'no-preference',
  })
  const m = await moving.newPage()
  m.on('pageerror', (e) => errors.push(e.message))
  for (const key of [
    'rosalia-arch',
    'peony-love-letter',
    'magnolia-muse',
    'rosewood-nocturne',
    'sakura-serenade',
  ]) {
    await m.goto(`${base}/templates/${key}/preview`, {
      waitUntil: 'networkidle',
    })
    const enable = m.getByRole('button', {
      name: 'Aktifkan animasi',
      exact: true,
    })
    if (await enable.isVisible()) await enable.click()
    await m.waitForTimeout(100)
    const animation = await m
      .locator('.floral-cover .flower-spray')
      .first()
      .evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .some((a) => a.playState === 'running'),
      )
    assert(animation, `No corner movement: ${key}`)
    await m
      .getByRole('button', { name: 'Matikan animasi', exact: true })
      .click()
    const paused = await m
      .locator('.floral-cover .flower-spray')
      .first()
      .evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .every((a) => a.playState !== 'running'),
      )
    assert(paused, `Corner movement did not pause: ${key}`)
    await m.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(m.locator('#gallery')).toBeVisible()
    if (key === 'sakura-serenade') {
      const before = await m
        .locator('.floral-hero-photo img')
        .getAttribute('src')
      await m
        .getByRole('button', { name: 'Foto hero berikutnya', exact: true })
        .click()
      assert.notEqual(
        await m.locator('.floral-hero-photo img').getAttribute('src'),
        before,
      )
    }
    await m.locator('#gallery button').first().click()
    await expect(m.getByRole('dialog')).toBeVisible()
    await m.keyboard.press('Escape')
    await expect(m.getByRole('dialog')).toHaveCount(0)
  }
  await moving.close()
  assert.deepEqual(errors, [])
  await writeFile(
    `${dir}/report.json`,
    JSON.stringify(
      {
        templates: 55,
        categories: 11,
        capturedCovers: capture ? 55 : 0,
        responsive: [320, 390, 1440],
        eventTypes: 5,
        cornerMotionProfiles: 5,
        errors,
      },
      null,
      2,
    ),
  )
  console.log(
    'PASS: 55 new previews, five event types, four floral corners, motion controls, carousel and lightbox.',
  )
} finally {
  await browser.close()
}
