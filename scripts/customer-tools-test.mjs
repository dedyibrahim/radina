import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { solveLoginCaptcha } from './support/login-captcha.mjs'
const base = process.env.TEST_URL
assert(base && new URL(base).hostname === '127.0.0.1' && new URL(base).port === '8001', 'Use the isolated test server')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const admin = await browser.newContext({ reducedMotion: 'reduce' }), customer = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const a = await admin.newPage(), c = await customer.newPage(), errors = [], dir = 'test-results/customer-tools'
await mkdir(dir, { recursive: true })
customer.on('page', p => p.on('pageerror', e => errors.push(e.message)))
c.on('pageerror', e => errors.push(e.message))
async function data(response, status = 200) { assert.equal(response.status(), status, await response.text()); return (await response.json()).data }
async function download(label, name) {
  const pending = c.waitForEvent('download')
  await c.getByRole('button', { name: label, exact: true }).click()
  const file = await pending; await file.saveAs(`${dir}/${name}`)
  return readFile(`${dir}/${name}`, 'utf8')
}
async function preview() {
  await c.getByRole('button', { name: 'Preview & Persetujuan', exact: true }).click()
  await expect(c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true })).toBeVisible()
  await expect(c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true })).toBeEnabled()
}
async function approve() {
  c.once('dialog', dialog => dialog.accept())
  await c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true }).click()
}
try {
  await a.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await a.getByLabel('Email admin').fill(process.env.TEST_ADMIN_EMAIL)
  await a.getByLabel('Kata sandi', { exact: false }).fill(process.env.TEST_ADMIN_PASSWORD)
  await solveLoginCaptcha(a)
  await a.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await a.waitForURL(`${base}/admin`)
  const csrf = decodeURIComponent((await admin.cookies()).find(c => c.name === 'XSRF-TOKEN').value), headers = { 'X-XSRF-TOKEN': csrf, Accept: 'application/json' }
  const template = await data(await admin.request.get(`${base}/api/templates/rose-ribbon`))
  const slug = `portal-tools-${Date.now()}`
  const order = await data(await admin.request.post(`${base}/api/orders`, { headers, data: { template_id: template.id, customer_name: 'Portal Tools Test', whatsapp: '081234567890', bride_name: 'Alya', groom_name: 'Dimas', slug, event_type: 'wedding', expected_total: Number(template.price) } }), 201)
  await data(await admin.request.patch(`${base}/api/admin/orders/${order.id}/payment`, { headers }))
  const wedding = await data(await admin.request.post(`${base}/api/admin/orders/${order.id}/wedding`, { headers }), 201)
  const path = `${base}/api/admin/weddings/${wedding.id}`
  const demo = await data(await admin.request.get(`${base}/api/templates/rose-ribbon/preview`))
  const content = { ...demo, slug, title: 'Portal Tools Test', expected_updated_at: wedding.updated_at }
  for (const event of content.events) { event.start_time = event.start_time?.slice(0, 5); event.end_time = event.end_time?.slice(0, 5) }
  await data(await admin.request.put(path, { headers, data: content }))
  const portal = await data(await admin.request.post(`${path}/customer-portal`, { headers }))
  await data(await admin.request.post(`${path}/customer-portal/review`, { headers }))
  await c.goto(portal.link, { waitUntil: 'networkidle' })
  await preview()
  await expect(c.locator('.desktop-ambience')).toHaveCount(0)
  await expect(c.locator('.customer-preview iframe')).toHaveCount(1)
  const iframe = c.frameLocator('.customer-preview iframe')
  await expect(iframe.getByRole('button', { name: 'Buka Undangan', exact: true })).toBeVisible()
  await expect(c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true })).toBeInViewport()
  const parentScroll = await c.evaluate(() => scrollY)
  const frame = c.frames().find(frame => frame.url().includes('/pelanggan/') && frame.url().includes('/preview'))
  await frame.evaluate(() => document.querySelector('.design-cover button').click())
  await expect(iframe.locator('.invitation-content')).toBeVisible()
  assert.equal(await c.evaluate(() => scrollY), parentScroll, 'Opening the invitation must not scroll the portal')
  assert.equal(await frame.evaluate(() => scrollY), 0)
  await c.screenshot({ path: `${dir}/approval-desktop.png`, fullPage: false })
  await c.getByLabel('Catatan revisi').fill('Tolong periksa lokasi acara pengujian.')
  await c.getByRole('button', { name: 'Kirim Catatan Revisi', exact: true }).click()
  await expect(c.locator('.customer-status')).toHaveText('Revisi diminta')
  await c.setViewportSize({ width: 390, height: 900 })
  await preview()
  assert(await c.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await expect(c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true })).toBeInViewport()
  await c.screenshot({ path: `${dir}/approval-mobile.png`, fullPage: false })
  await approve()
  await expect(c.locator('.customer-status')).toHaveText('Sudah disetujui')
  await c.getByRole('button', { name: 'Daftar Tamu / Impor & Ekspor', exact: true }).click()
  assert((await download('Unduh Template Tamu', 'template-tamu.csv')).includes('nama;alamat'))
  await c.getByLabel('File daftar tamu (CSV)').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('nama;alamat\n;Jakarta\n') })
  await c.getByRole('button', { name: 'Periksa Daftar Tamu', exact: true }).click()
  await expect(c.getByRole('alert')).toBeVisible()
  const csv = { name: 'guests.csv', mimeType: 'text/csv', buffer: Buffer.from('nama;alamat\nBapak Budi;Jakarta\nIbu Ayu;Bandung\nBapak Budi;Jakarta\n=1+1;Bekasi\n') }
  await c.getByLabel('File daftar tamu (CSV)').setInputFiles(csv)
  await c.getByRole('button', { name: 'Periksa Daftar Tamu', exact: true }).click()
  await expect(c.locator('.guest-inspection')).toContainText('3 tamu baru')
  await c.getByRole('button', { name: 'Impor & Buat Tautan Tamu', exact: true }).click()
  await expect(c.getByRole('status').filter({ hasText: '3 tamu ditambahkan' })).toBeVisible()
  await c.getByLabel('Cari nama tamu').fill('Budi')
  await c.getByRole('button', { name: 'Cari Tamu', exact: true }).click()
  await expect(c.locator('tbody tr')).toHaveCount(1)
  const exported = await download('Unduh Tautan Tamu', 'tautan-tamu.csv')
  assert(exported.includes('Bapak Budi') && exported.includes('Ibu Ayu') && exported.includes("'=1+1"))
  assert(exported.includes(`/w/${slug}?to=`) && exported.includes('guest='))
  await c.getByLabel('File daftar tamu (CSV)').setInputFiles(csv)
  await c.getByRole('button', { name: 'Periksa Daftar Tamu', exact: true }).click()
  await expect(c.locator('.guest-inspection')).toContainText('0 tamu baru')
  await expect(c.getByRole('button', { name: 'Impor & Buat Tautan Tamu', exact: true })).toBeDisabled()
  const customerPath = `${base}/api/customer-portals/${new URL(portal.link).pathname.split('/').pop()}`
  assert.equal((await data(await customer.request.get(customerPath))).status, 'APPROVED')
  // Change the visible content while a review is open: stale approvals must still fail.
  async function changeQuote(quote) {
    const current = await data(await admin.request.get(path))
    content.expected_updated_at = current.updated_at; content.quote = quote
    await data(await admin.request.put(path, { headers, data: content }))
  }
  await changeQuote('Versi pertama pengujian preview')
  await preview()
  await changeQuote('Versi kedua pengujian preview')
  await approve()
  await expect(c.getByRole('alert').filter({ hasText: 'Preview sudah berubah' })).toBeVisible()
  await expect(c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true })).toHaveCount(0)
  await preview(); await approve()
  await expect(c.locator('.customer-status')).toHaveText('Sudah disetujui')
  assert.deepEqual(errors, [])
  console.log('PASS: customer CSV template/import/dedup/search/export/formula protection; desktop/mobile preview isolation and scroll; revision/approval; stale approval rejected. Only isolated test records created.')
} finally { await browser.close() }
