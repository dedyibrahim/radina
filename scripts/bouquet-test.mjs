import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.TEST_URL
assert(base && ['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use an isolated local test server.')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errors = [], checks = []
page.on('pageerror', error => errors.push(error.message))
await mkdir('test-results/bouquets', { recursive: true })
try {
  assert.equal((await page.goto(`${base}/buket`, { waitUntil: 'networkidle' })).status(), 200)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Seikat perhatian')
  assert.match(await page.title(), /Rp100.000/)
  await expect(page.locator('.bouquet-start')).toContainText('Rp100.000')
  assert.equal(await page.locator('.bouquet-card').count(), 17)
  await page.locator('.bouquet-card img').evaluateAll(images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode() })))
  assert(await page.locator('.bouquet-card img').evaluateAll(images => images.every(image => image.naturalWidth > 0)))
  checks.push('17 original bouquet photos load and the starting price is Rp100.000.')

  const links = await page.locator('a[href^="https://wa.me/"]').evaluateAll(nodes => nodes.map(node => node.href))
  assert(links.length >= 20)
  for (const link of links) assert.equal(new URL(link).pathname, '/6281289903664')
  const product = new URL(await page.getByRole('link', { name: 'Pesan buket ini' }).first().getAttribute('href'))
  assert.match(product.searchParams.get('text'), /Buket Custom 01/)
  assert.match(product.searchParams.get('text'), /\/images\/bouquets\/buket-01.jpg/)
  checks.push('All bouquet WhatsApp links use the requested number and include the selected photo.')

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    await page.evaluate(() => window.scrollTo(0, 0))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Bouquet overflow at ${width}px`)
    await expect(page.getByRole('link', { name: 'Hubungi Radina melalui WhatsApp' })).toBeVisible()
    await page.screenshot({ path: `test-results/bouquets/buket-${width}.png` })
  }
  checks.push('Bouquet layout and floating WhatsApp button fit 320–1440px.')

  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('link', { name: 'Lihat Koleksi Buket' })).toHaveAttribute('href', '/buket')
  for (const link of [page.getByRole('link', { name: 'Hubungi Kami', exact: true }), page.getByRole('link', { name: 'Hubungi Radina melalui WhatsApp' })]) {
    assert.equal(new URL(await link.getAttribute('href')).pathname, '/6281289903664')
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Homepage overflow at ${width}px`)
  }
  const settings = await (await page.request.get(`${base}/api/settings`)).json()
  assert.equal(settings.data.whatsapp_number, '6281289903664')
  assert.equal((await page.request.get(`${base}/bucket`, { maxRedirects: 0 })).status(), 301)
  checks.push('Wedding contact, homepage links, settings, and the bucket redirect are correct.')
  assert.deepEqual(errors, [])
  console.log(`PASS ${checks.length} bouquet and business contact browser checks.`)
} finally {
  await writeFile('test-results/bouquets/report.json', JSON.stringify({ checks, errors }, null, 2))
  await browser.close()
}
