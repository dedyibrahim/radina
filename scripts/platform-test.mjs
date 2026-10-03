import { chromium } from '@playwright/test'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const url = process.env.TEST_URL || 'http://localhost:5173'
assert(process.env.TEST_URL && process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD, 'Configure an isolated browser test server and administrator.')
const env = Object.fromEntries(
  (await readFile('.env', 'utf8'))
    .split(/\r?\n/)
    .filter((x) => x.includes('='))
    .map((x) => [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)]),
)
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
await mkdir('test-results/platform', { recursive: true })
const report = []
let debugPage
async function request(page, method, path, body) {
  return page.evaluate(
    async ({ method, path, body }) => {
      const token = document.cookie
        .split('; ')
        .find((x) => x.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=')
      const response = await fetch('/api' + path, {
        method,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      return { status: response.status, data: await response.json().catch(() => null) }
    },
    { method, path, body },
  )
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage(),
    errors = []
  debugPage = page
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (msg) => {
    if (msg.type() === 'warning' && msg.text().includes('[Vue warn]')) errors.push(msg.text())
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'test-results/platform/home-desktop.png', fullPage: true })
  await page.goto(`${url}/templates`)
  await page.getByRole('heading', { name: 'Amore Bloom', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Luxury', exact: true }).click()
  await page.getByRole('heading', { name: 'Noir Élégance', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Semua', exact: true }).click()
  await page.getByRole('heading', { name: 'Amore Bloom', exact: true }).waitFor()
  await page.goto(`${url}/order/romantic-floral`)
  await page.getByLabel('Nama Pemesan').fill('Dedy CMS Test')
  await page.getByLabel('Nomor WhatsApp').fill('081234567890')
  await page.getByLabel('Email (opsional)').fill('customer@example.test')
  await page.getByLabel('Nama Pengantin Wanita').fill('Nadia Test')
  await page.getByLabel('Nama Pengantin Pria').fill('Fajar Test')
  const slug = `test-cms-${Date.now()}`
  await page.getByLabel('Slug Undangan').fill(slug)
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click()
  const created = page.waitForResponse(
    (res) => res.url().endsWith('/api/orders') && res.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Buat Pesanan', exact: true }).click()
  const order = (await (await created).json()).data
  console.log('PASS customer order created')
  assert.equal(order.status, 'WAITING_PAYMENT')
  assert.equal(order.total, 149000)
  assert.equal(order.whatsapp, '6281234567890')
  await page.getByRole('link', { name: 'Konfirmasi Pembayaran via WhatsApp' }).waitFor()
  const wa = await page
    .getByRole('link', { name: 'Konfirmasi Pembayaran via WhatsApp' })
    .getAttribute('href')
  assert(wa.includes('https://wa.me/') && decodeURIComponent(wa).includes(order.order_number))
  const blocked = await request(page, 'GET', '/admin/orders')
  assert.equal(blocked.status, 401)
  await page.goto(`${url}/check-order`)
  await page.getByLabel('Order ID').fill(order.order_number)
  await page.getByLabel('Nomor WhatsApp').fill(order.whatsapp)
  await page.getByRole('button', { name: 'Cek Pesanan', exact: true }).click()
  await page.getByRole('heading', { name: order.order_number }).waitFor()
  await page.goto(`${url}/admin/login`)
  await page.getByLabel('Email admin').fill(process.env.TEST_ADMIN_EMAIL || env.ADMIN_EMAIL)
  await page.getByLabel('Kata sandi').fill(process.env.TEST_ADMIN_PASSWORD || env.ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await page.waitForURL('**/admin')
  await page.goto(`${url}/admin/orders/${order.id}`)
  const unpaid = await request(page, 'POST', `/admin/orders/${order.id}/wedding`)
  assert.equal(unpaid.status, 422)
  await page.getByRole('button', { name: 'Konfirmasi Pembayaran', exact: true }).click()
  await page.getByRole('button', { name: 'Pembayaran Sudah Diterima' }).click()
  await page.getByRole('button', { name: 'Kelola Undangan' }).waitFor()
  await page.getByRole('button', { name: 'Kelola Undangan' }).click()
  await page.waitForURL('**/admin/weddings/*')
  const id = Number(page.url().split('/').at(-1))
  console.log('PASS payment confirmed and CMS created')
  await page.getByRole('button', { name: 'Acara', exact: true }).click()
  await page.getByRole('button', { name: 'Tambah Acara' }).click()
  await page.getByLabel('Nama Acara').fill('Akad Test')
  await page.getByLabel('Tanggal').fill('2026-12-12')
  await page.getByLabel('Venue').fill('Ballroom Test')
  await page.getByRole('button', { name: 'Informasi Dasar', exact: true }).click()
  await page.getByLabel('Tanggal Pernikahan', { exact: true }).fill('2026-12-12')
  await page
    .getByLabel('Wedding Quote', { exact: true })
    .fill('Cerita cinta yang indah dari database.')
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByText('Konten undangan berhasil disimpan.').waitFor()
  let actual = (await request(page, 'GET', `/admin/weddings/${id}`)).data.data
  assert.equal(actual.events[0].title, 'Akad Test')
  assert.equal(actual.quote, 'Cerita cinta yang indah dari database.')
  const draft = await request(page, 'GET', `/weddings/${slug}`)
  assert.equal(draft.status, 404)
  await page.getByRole('button', { name: 'Gallery', exact: true }).click()
  await page
    .locator('input[type=file]')
    .setInputFiles(['frontend/public/images/moment-1.webp', 'frontend/public/images/moment-2.webp'])
  await page.locator('.editor-gallery article').nth(1).waitFor()
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.waitForFunction(() =>
    document.querySelector('.editor-state')?.textContent.includes('Tersimpan'),
  )
  actual = (await request(page, 'GET', `/admin/weddings/${id}`)).data.data
  assert.equal(actual.gallery.length, 2)
  assert(actual.gallery[0].image.startsWith('/storage/weddings/'))
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  await page
    .locator('label.toggle-row')
    .filter({ hasText: 'Wedding Gift' })
    .getByRole('checkbox')
    .uncheck()
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.waitForFunction(() =>
    document.querySelector('.editor-state')?.textContent.includes('Tersimpan'),
  )
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click()
  await page.locator('.live-wedding-preview #couple').waitFor()
  await page.getByRole('button', { name: 'Publish', exact: true }).click()
  await page.getByRole('button', { name: 'Publish Website', exact: true }).click()
  await page.getByRole('button', { name: 'Ya, Publish Website' }).click()
  await page.getByText('Undangan dipublish dan siap dibagikan.').waitFor()
  const published = await request(page, 'GET', `/weddings/${slug}`)
  assert.equal(published.status, 200)
  assert.equal(published.data.data.status, 'PUBLISHED')
  await page.goto(`${url}/w/${slug}?to=${encodeURIComponent('Dedy Ibrahim dan Keluarga Besar')}`)
  await page.locator('.cover-guest').getByText('Dedy Ibrahim dan Keluarga Besar').waitFor()
  await page.getByRole('button', { name: 'Buka Undangan' }).click()
  await page.locator('#rsvp').waitFor({ state: 'attached' })
  assert.equal(await page.locator('.gift-section').count(), 0)
  await page.locator('#rsvp-name').fill('Tamu API')
  await page.getByRole('radio', { name: 'Hadir', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim Konfirmasi' }).click()
  await page.getByText('Terkirim! Terima kasih atas konfirmasinya.').waitFor()
  await page.locator('#wish-name').fill('Tamu API')
  await page.locator('#wish-message').fill('Semoga bahagia dari database MySQL.')
  await page.getByRole('button', { name: 'Kirim Ucapan' }).click()
  await page.locator('.wish').getByText('Semoga bahagia dari database MySQL.').waitFor()
  await page.reload()
  await page.getByRole('button', { name: 'Buka Undangan' }).click()
  await page.locator('.wish').getByText('Semoga bahagia dari database MySQL.').waitFor()
  const rsvps = await request(page, 'GET', `/admin/weddings/${id}/rsvps`)
  assert(rsvps.data.data.some((x) => x.name === 'Tamu API'))
  assert.equal(errors.length, 0, errors.join('\n'))
  report.push({
    test: 'Customer order → payment → CMS → upload → preview → publish → public RSVP/wishes',
    status: 'passed',
    slug,
    order: order.order_number,
  })
  console.log('PASS full-stack customer/admin/guest workflow')
  const sizes = [
    [320, 568],
    [360, 800],
    [375, 812],
    [390, 844],
    [414, 896],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
  ]
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height })
    for (const path of [
      '/',
      '/templates',
      '/order/romantic-floral',
      '/check-order',
      '/admin',
      '/admin/orders',
      `/admin/orders/${order.id}`,
      `/admin/weddings/${id}`,
      '/admin/templates',
      '/admin/settings',
      '/w/demo-romantic-floral',
    ]) {
      await page.goto(url + path, { waitUntil: 'networkidle' })
      if (path.startsWith('/w/')) {
        await page.getByRole('button', { name: 'Buka Undangan' }).click()
        await page.locator('#rsvp').waitFor({ state: 'attached' })
      }
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Overflow ${width} ${path}`,
      )
    }
    await page.screenshot({ path: `test-results/platform/wedding-${width}.png` })
    await page.goto(`${url}/admin/weddings/${id}`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Pengantin', exact: true }).click()
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `CMS couple overflow ${width}`,
    )
    if ([320, 390, 1440].includes(width))
      await page.screenshot({ path: `test-results/platform/cms-${width}.png`, fullPage: true })
    const demoId = (await request(page, 'GET', '/templates/romantic-floral/preview')).data.data.id
    await page.goto(`${url}/admin/weddings/${demoId}`, { waitUntil: 'networkidle' })
    for (const name of [
      'Informasi Dasar',
      'Pengantin',
      'Acara',
      'Love Story',
      'Gallery',
      'Music',
      'Wedding Gift',
      'Live Streaming',
      'RSVP',
      'Wishes',
      'Pengaturan',
      'Publish',
    ]) {
      await page.getByRole('button', { name, exact: true }).click()
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `CMS ${name} overflow ${width}`,
      )
    }
    await page.goto(url, { waitUntil: 'networkidle' })
    if ([320, 390, 1440].includes(width))
      await page.screenshot({ path: `test-results/platform/home-${width}.png`, fullPage: true })
    report.push({ test: 'Responsive public/admin/wedding', width, height, status: 'passed' })
    console.log(`PASS responsive ${width} × ${height}`)
  }
  assert.equal(errors.length, 0, errors.join('\n'))
  const html = await (await page.request.get(`${url}/w/${slug}`)).text()
  assert(
    html.includes('The Wedding of Nadia Test &amp; Fajar Test'),
    'Server-side wedding metadata missing',
  )
  report.push({ test: 'Server-rendered social metadata', status: 'passed' })
  await context.close()
} catch (error) {
  if (debugPage) {
    await debugPage
      .screenshot({ path: 'test-results/platform/failure.png', fullPage: true })
      .catch(() => {})
    await writeFile(
      'test-results/platform/failure.txt',
      `${debugPage.url()}\n${error.stack}\n${await debugPage
        .locator('body')
        .innerText()
        .catch(() => '')}`,
    )
  }
  throw error
} finally {
  await writeFile('test-results/platform/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
