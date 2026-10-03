import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const base = process.env.TEST_URL
assert(base && ['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use the isolated local test server.')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } })
const page = await context.newPage(), checks = [], errors = []
page.on('pageerror', error => errors.push(error.message))
await mkdir('test-results/payment-accounts', { recursive: true })
async function verifyAccounts() {
  await expect(page.locator('.payment-bank')).toHaveCount(2)
  await expect(page.locator('.payment-bank').nth(0)).toContainText('Bank Mandiri')
  await expect(page.locator('.payment-bank').nth(0)).toContainText('1680001279155')
  await expect(page.locator('.payment-bank').nth(1)).toContainText('Bank BCA')
  await expect(page.locator('.payment-bank').nth(1)).toContainText('8721354342')
  for (const card of await page.locator('.payment-bank').all()) await expect(card).toContainText('a/n Dedy Ibrahim')
}
try {
  await page.goto(`${base}/buket`, { waitUntil: 'networkidle' })
  await verifyAccounts()
  for (const [name, number] of [['Bank Mandiri', '1680001279155'], ['Bank BCA', '8721354342']]) {
    await page.getByRole('button', { name: `Salin nomor rekening ${name}`, exact: true }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(number)
  }
  checks.push('Bouquet payment shows both correct accounts and both copy buttons copy the exact number.')

  const templates = await (await context.request.get(`${base}/api/templates`)).json()
  const response = await context.request.post(`${base}/api/orders`, { data: {
    template_id: templates.data[0].id, customer_name: 'Isolated Payment Account Test', whatsapp: '081234567890',
    bride_name: 'Test Bride', groom_name: 'Test Groom', slug: `payment-account-test-${Date.now()}`,
  } })
  assert.equal(response.status(), 201)
  const order = (await response.json()).data
  await page.evaluate(order => sessionStorage.setItem(`order:${order.order_number}`, order.whatsapp), order)
  await page.goto(`${base}/order/success/${order.order_number}`, { waitUntil: 'networkidle' })
  await verifyAccounts()
  assert(!await page.locator('.payment-instructions').textContent().then(text => /masih contoh|pemilik rekening.*contoh/.test(text)))
  assert.equal(new URL(await page.getByRole('link', { name: 'Konfirmasi Pembayaran via WhatsApp' }).getAttribute('href')).pathname, '/6281289903664')
  checks.push('A newly created wedding order uses both owner accounts without the demo notice, with the correct WhatsApp contact.')

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`)
    await page.locator('.payment-accounts').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `test-results/payment-accounts/payment-${width}.png` })
  }
  checks.push('Wedding payment accounts fit 320, 390, 768, and 1440px.')
  assert.deepEqual(errors, [])
  console.log(`PASS ${checks.length} payment account browser checks.`)
} finally {
  await writeFile('test-results/payment-accounts/report.json', JSON.stringify({ checks, errors }, null, 2))
  await browser.close()
}
