import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const base = process.env.TEST_URL
assert(base && ['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Use an explicitly configured local test server.')
assert(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD, 'Configure isolated test administrator credentials.')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
const page = await context.newPage(), errors = [], report = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.text().includes('[Vue warn]')) errors.push(m.text()) })
await mkdir('test-results/integration', { recursive: true })
try {
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  // Real HTTP requests must enforce CSRF outside PHPUnit's testing environment.
  const csrf = await context.request.post(`${base}/api/admin/login`, { data: { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD }, headers: { Origin: base, Referer: `${base}/admin/login`, Accept: 'application/json' } })
  assert.equal(csrf.status(), 419, 'Admin login without CSRF must be rejected')
  await page.getByLabel('Email admin').fill(process.env.TEST_ADMIN_EMAIL)
  await page.getByLabel('Kata sandi').fill(process.env.TEST_ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await page.waitForURL('**/admin')
  await page.goto(`${base}/admin/licenses`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Lisensi aplikasi.' }).waitFor()
  await page.getByRole('button', { name: 'Buat Lisensi', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByLabel('Nama pelanggan').fill('Integration Test License')
  await dialog.getByLabel('Nama produk').fill('Existing Desktop Product')
  await dialog.getByRole('button', { name: 'Simpan Lisensi' }).click()
  await dialog.waitFor({ state: 'hidden' })
  const row = page.locator('.license-row').filter({ hasText: 'Integration Test License' })
  await row.waitFor()
  const key = await row.locator('code').innerText()
  assert.match(key, /^[A-Z2-9]{5}(?:-[A-Z2-9]{5}){4}$/)
  await row.getByRole('button', { name: 'Edit', exact: true }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel('Maksimum perangkat').fill('2')
  await dialog.getByRole('button', { name: 'Simpan Lisensi' }).click()
  await dialog.waitFor({ state: 'hidden' })
  const activate = async (machine, token = process.env.TEST_LICENSE_TOKEN) => context.request.post(`${base}/api/license/activate`, { data: { license_key: key.toLowerCase(), machine_id: machine, app_version: '1.0.0' }, headers: { 'X-LICENSE-TOKEN': token || '', Origin: base, Accept: 'application/json' } })
  // Activation keeps its token-only desktop contract even with a same-origin header.
  assert.equal((await activate('PC-ONE', 'wrong-token')).status(), 401)
  const activated = await activate('pc-one')
  assert.equal(activated.status(), 200)
  assert.equal((await activated.json()).license.active_devices, 1)
  assert.equal((await activate('PC-ONE')).status(), 200)
  assert.equal((await activate('PC-TWO')).status(), 200)
  assert.equal((await activate('PC-THREE')).status(), 403)
  await page.reload({ waitUntil: 'networkidle' })
  await row.getByText('2 / 2', { exact: true }).waitFor()
  await row.getByRole('button', { name: 'Nonaktifkan' }).click()
  await row.getByText('Revoked', { exact: true }).waitFor()
  assert.equal((await activate('PC-ONE')).status(), 403)
  await row.getByRole('button', { name: 'Aktifkan', exact: true }).click()
  await row.getByText('Active', { exact: true }).waitFor()
  assert.equal((await activate('PC-ONE')).status(), 200)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `License overflow ${width}`)
    await page.screenshot({ path: `test-results/integration/licenses-${width}.png`, fullPage: true })
  }
  await row.getByRole('button', { name: 'Hapus', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus Lisensi', exact: true }).click()
  await row.waitFor({ state: 'hidden' })
  assert.equal((await activate('PC-ONE')).status(), 404)
  report.push({ test: 'License UI CRUD, immutable format, desktop token, quota, repeat activation, revoke/reactivate, responsive', status: 'passed' })
  console.log('PASS license UI and original activation contract')
  let templates = []
  for (let n = 1; n <= 3; n++) {
    const result = await (await context.request.get(`${base}/api/templates?page=${n}`)).json()
    templates.push(...result.data)
  }
  assert.equal(templates.length, 20)
  for (const template of templates) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${base}/templates/${template.slug}/preview`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Buka Undangan', exact: true }).waitFor()
      await page.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
      await page.locator('#couple').waitFor({ state: 'attached' })
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Preview overflow ${width}: ${template.slug}`)
      const broken = await page.evaluate(() => [...document.images].filter(img => img.complete && img.naturalWidth === 0 && img.getAttribute('src')).map(img => img.getAttribute('src')))
      assert.deepEqual(broken, [], `Broken images: ${template.slug}`)
    }
    report.push({ template: template.slug, widths: [390, 1440], status: 'passed' })
    console.log(`PASS preview ${template.slug}`)
  }
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'test-results/integration/home-desktop.png', fullPage: true })
  assert.deepEqual(errors, [])
} catch (error) {
  await page.screenshot({ path: 'test-results/integration/failure.png', fullPage: true }).catch(() => {})
  throw error
} finally {
  await writeFile('test-results/integration/report.json', JSON.stringify({ report, errors }, null, 2))
  await browser.close()
}
