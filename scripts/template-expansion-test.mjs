import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

// This suite is read-only. Only the isolated local server may generate catalog assets.
const base = process.env.TEST_URL
const production = process.env.READ_ONLY_PRODUCTION === '1'
assert(
  base &&
    (production
      ? new URL(base).hostname === 'radina.net'
      : ['localhost', '127.0.0.1'].includes(new URL(base).hostname) &&
        new URL(base).port === '8001'),
)
const capture = !production && process.env.CAPTURE_TEMPLATE_COVERS === '1'
const studio = JSON.parse(await readFile('config/template-studio.json', 'utf8'))
const dir = `test-results/template-expansion/${production ? 'production' : 'local'}`
await mkdir(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 900 },
  reducedMotion: 'reduce',
})
const page = await context.newPage(),
  errors = [],
  checks = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.text().includes('[Vue warn]')) errors.push(m.text())
})
const fits = async (label) => {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    `Overflow: ${label}`,
  )
  await page.locator('img').evaluateAll((imgs) =>
    Promise.all(
      imgs.map((img) => {
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
      .evaluateAll((imgs) => imgs.filter((i) => i.complete && !i.naturalWidth).map((i) => i.src)),
    [],
    `Broken image: ${label}`,
  )
}
try {
  const categories = (await (await context.request.get(`${base}/api/categories`)).json()).data
  const templates = []
  let last = 1
  for (let p = 1; p <= last; p++) {
    const r = await context.request.get(`${base}/api/templates?page=${p}`)
    assert.equal(r.status(), 200)
    const result = await r.json()
    last = result.meta.last_page
    templates.push(...result.data)
  }
  assert.equal(templates.length, 56)
  assert.equal(categories.length, 11)
  const counts = Object.fromEntries(
    categories.map((c) => [
      c.name,
      templates.filter((t) => String(t.category_id) === String(c.id)).length,
    ]),
  )
  for (const [category, count] of Object.entries(counts))
    assert(count >= 5, `${category}: ${count}`)
  assert.equal(new Set(templates.flatMap((t) => t.animations.effects)).size, 19)
  checks.push(
    'All 11 categories have at least five active templates; 56 templates expose 19 valid animation effects.',
  )
  for (const [index, template] of templates.entries()) {
    const key = template.template_key
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto(`${base}/templates/${template.slug}/preview`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: 'Buka Undangan', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aktifkan animasi', exact: true })).toBeVisible()
    assert.equal(
      await page.locator('.scene-motion').getAttribute('data-effects'),
      template.animations.effects.join(','),
    )
    assert.equal(Number(await page.locator('.scene-motion').getAttribute('data-frames')), 0)
    await fits(`${key} mobile cover`)
    if (studio[key]) {
      assert.equal(await page.locator('.studio-cover').count(), 1)
      // Framed images must stay in their frames; overlapping photos once obscured the names.
      if (studio[key].family !== 'poster') {
        const contained = await page.locator('.studio-cover-photo').evaluate((el) => {
          const img = el.querySelector('img'),
            f = el.getBoundingClientRect(),
            i = img?.getBoundingClientRect()
          return !i || (i.width <= f.width + 1 && i.height <= f.height + 1)
        })
        assert(contained, `Photo escaped its frame: ${key}`)
      }
      if (capture) {
        await page.addStyleTag({
          content: '.motion-toggle,.wedding-preview-tools{display:none!important}',
        })
        const png = `${dir}/${key}-cover.png`
        await page.locator('.studio-cover').screenshot({ path: png })
        execFileSync('php', [
          'scripts/convert-demo-image.php',
          png,
          `frontend/public/images/templates/previews/${key}.webp`,
        ])
      }
    }
    await page.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(page.locator('#event')).toBeVisible()
    await expect(page.locator('#couple')).toBeVisible()
    await fits(`${key} mobile contents`)
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await fits(`${key} contents ${width}`)
    }
    if ((index + 1) % 10 === 0 || index === templates.length - 1)
      console.log(`Verified previews: ${index + 1}/56`)
    // Stay below the production API rate limit, including preview and wishes reads.
    if (production) await page.waitForTimeout(3500)
  }
  checks.push(
    'All 56 previews open at 390 px and render complete contents at 320, 390 and 1440 px, with no horizontal overflow, broken photos or JavaScript errors.',
  )
  for (const type of ['khitanan', 'office', 'birthday', 'aqiqah', 'other']) {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto(`${base}/templates/confetti-club/preview?event_type=${type}`, {
      waitUntil: 'networkidle',
    })
    const title = await page.locator('.studio-cover h1').innerText()
    assert(title.trim().length)
    await page.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(page.locator('.studio-hero h1')).toHaveText(title)
    await expect(page.locator('#couple .celebration-person')).toBeVisible()
    await fits(`Studio ${type}`)
    if (production) await page.waitForTimeout(3500)
  }
  checks.push(
    'Studio designs also display real event titles and hosts for khitanan, office, birthday, aqiqah and other events.',
  )
  const moving = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: 'no-preference',
  })
  const m = await moving.newPage()
  m.on('pageerror', (e) => errors.push(e.message))
  for (const key of [
    'confetti-club',
    'balloon-fiesta',
    'origami-dream',
    'nur-jannah',
    'riviera-postcard',
    'starlight-premiere',
    'wildflower-meadow',
    'eternal-story',
  ]) {
    await m.goto(`${base}/templates/${key}/preview`, { waitUntil: 'networkidle' })
    const canvas = m.locator('.scene-motion')
    const before = Number(await canvas.getAttribute('data-frames'))
    const first = await canvas.screenshot()
    await m.waitForTimeout(250)
    assert(Number(await canvas.getAttribute('data-frames')) > before, `Animation stopped: ${key}`)
    assert(!first.equals(await canvas.screenshot()), `Static canvas: ${key}`)
    await m.getByRole('button', { name: 'Matikan animasi', exact: true }).click()
    await m.waitForTimeout(100)
    const stopped = Number(await canvas.getAttribute('data-frames'))
    await m.waitForTimeout(150)
    assert.equal(Number(await canvas.getAttribute('data-frames')), stopped)
    await m.getByRole('button', { name: 'Aktifkan animasi', exact: true }).click()
    await expect(m.getByRole('button', { name: 'Matikan animasi', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await m.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(m.locator('#event')).toBeVisible()
    if (production) await m.waitForTimeout(3500)
  }
  await m.emulateMedia({ reducedMotion: 'reduce' })
  await expect(m.getByRole('button', { name: 'Aktifkan animasi', exact: true })).toBeVisible()
  await m.waitForTimeout(100)
  const stopped = Number(await m.locator('.scene-motion').getAttribute('data-frames'))
  await m.waitForTimeout(200)
  assert.equal(Number(await m.locator('.scene-motion').getAttribute('data-frames')), stopped)
  await moving.close()
  checks.push(
    'Animated canvases change over time, pause when switched off and honor live reduced-motion preferences; all opening buttons remain usable.',
  )
  assert.deepEqual(errors, [])
  await writeFile(
    `${dir}/report.json`,
    JSON.stringify({ counts, checks, errors, capturedCovers: capture ? 31 : 0 }, null, 2),
  )
  console.log(
    `PASS: ${checks.length} template expansion checks (${production ? 'production read-only' : 'isolated local'}, ${capture ? '31 covers captured' : 'no asset writes'}).`,
  )
} finally {
  await browser.close()
}
