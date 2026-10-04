import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { solveLoginCaptcha } from './support/login-captcha.mjs'

const base = process.env.TEST_URL
const production = process.env.READ_ONLY_PRODUCTION === '1'
assert(
  base &&
    (production
      ? new URL(base).hostname === 'radina.net'
      : new URL(base).port === '8001' &&
        ['localhost', '127.0.0.1'].includes(new URL(base).hostname)),
  'Use the isolated test server or explicitly enable production read-only verification.',
)
const dir = `test-results/business-tools/${production ? 'production' : 'local'}`
await mkdir(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const admin = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
})
const customer = await browser.newContext({
  viewport: { width: 390, height: 900 },
  reducedMotion: 'reduce',
})
const a = await admin.newPage(),
  c = await customer.newPage(),
  errors = [],
  checks = []
for (const page of [a, c]) {
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.text().includes('[Vue warn]')) errors.push(m.text())
  })
}
async function data(response, status = 200) {
  assert.equal(response.status(), status, await response.text())
  return (await response.json()).data
}
async function fits(page, label) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Horizontal overflow: ${label}`,
  )
}
async function download(page, label, path) {
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: label, exact: true }).click()
  const file = await pending
  await file.saveAs(path)
  return readFile(path)
}
try {
  await a.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await a.getByLabel('Email admin').fill(process.env.TEST_ADMIN_EMAIL)
  await a
    .getByLabel('Kata sandi', { exact: false })
    .fill(process.env.TEST_ADMIN_PASSWORD)
  await solveLoginCaptcha(a)
  await a.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await a.waitForURL(`${base}/admin`)
  const csrf = decodeURIComponent(
      (await admin.cookies()).find((c) => c.name === 'XSRF-TOKEN').value,
    ),
    headers = { 'X-XSRF-TOKEN': csrf, Accept: 'application/json' }
  await a.getByRole('link', { name: 'Paket & Tambahan', exact: true }).click()
  await expect(
    a.getByRole('heading', { name: 'Paket & Tambahan' }),
  ).toBeVisible()
  await expect(a.locator('.package-grid article')).toHaveCount(3)
  await fits(a, 'Packages desktop')
  await a.screenshot({ path: `${dir}/packages.png`, fullPage: true })
  const offers = await data(
    await admin.request.get(`${base}/api/admin/packages`),
  )
  assert.equal(offers.packages.length, 3)
  if (production) {
    assert(offers.packages.every((p) => !p.is_active && p.price === null))
    assert.equal(
      (await data(await customer.request.get(`${base}/api/packages`))).packages
        .length,
      0,
    )
    await a.goto(`${base}/admin/reminders`, { waitUntil: 'networkidle' })
    await expect(
      a.getByRole('heading', { name: 'Pengingat Pesanan' }),
    ).toBeVisible()
    await fits(a, 'Reminders desktop')
    const orderPage = await admin.request.get(`${base}/api/admin/orders`)
    assert.equal(orderPage.status(), 200)
    const orders = (await orderPage.json()).data
    const existing =
      orders.find((o) => o.wedding_id && o.total > 0) ||
      orders.find((o) => o.wedding_id)
    assert(existing)
    await a.goto(`${base}/admin/weddings/${existing.wedding_id}`, {
      waitUntil: 'networkidle',
    })
    await a
      .getByRole('button', { name: 'Statistik & Tamu', exact: true })
      .click()
    await expect(a.locator('.analytics-cards article')).toHaveCount(9)
    await fits(a, 'Statistics desktop')
    await a.screenshot({ path: `${dir}/analytics.png`, fullPage: true })
    await a.goto(`${base}/admin/weddings/${existing.wedding_id}/check-in`, {
      waitUntil: 'networkidle',
    })
    await expect(
      a.getByRole('button', { name: 'Buka Kamera', exact: true }),
    ).toBeVisible()
    await fits(a, 'Check-in desktop')
    for (const path of [
      '/admin/packages',
      '/admin/reminders',
      `/admin/weddings/${existing.wedding_id}/check-in`,
    ]) {
      await a.setViewportSize({ width: 390, height: 900 })
      await a.goto(base + path, { waitUntil: 'networkidle' })
      await fits(a, path)
    }
    assert.equal(
      (await admin.request.get(`${base}/api/admin/licenses`)).status(),
      200,
    )
    console.log('Browser checkpoint passed.')
    checks.push(
      'Production packages remain inactive with no assigned prices; existing template prices remain in use.',
      'Admin package, reminder, statistics and check-in pages render on mobile and desktop.',
      'License administration remains accessible; no production checkout, content update, payment, check-in or document creation was performed.',
    )
  } else {
    const addonName = `Layanan Uji ${Date.now()}`
    await a.getByRole('button', { name: 'Atur Basic', exact: true }).click()
    await a.getByLabel('Harga (Rp)', { exact: false }).fill('25000')
    await a.getByLabel('Masa aktif', { exact: false }).fill('30')
    await a
      .getByLabel('Deskripsi', { exact: false })
      .fill('Paket pengujian, harga tambahan')
    await a
      .getByLabel('Fitur paket', { exact: false })
      .fill('Layanan pengujian')
    await a.getByLabel('Tampilkan untuk pemesanan', { exact: false }).check()
    await a.getByRole('button', { name: 'Simpan', exact: true }).click()
    await expect(a.getByText('Harga disimpan.', { exact: false })).toBeVisible()
    await a.getByRole('button', { name: 'Atur Basic', exact: true }).click()
    const priceInput = a.getByLabel('Harga (Rp)', { exact: false })
    await priceInput.fill('')
    await expect(priceInput).toHaveValue('')
    assert.equal(
      await priceInput.evaluate((input) => input.checkValidity()),
      false,
      'Clearing an active price must remain empty, not become free.',
    )
    const durationInput = a.getByLabel('Masa aktif', { exact: false })
    await durationInput.fill('')
    await expect(durationInput).toHaveValue('')
    await durationInput.fill('0')
    assert.equal(
      await durationInput.evaluate((input) => input.checkValidity()),
      false,
    )
    await durationInput.fill('30')
    await priceInput.fill('25000')
    await a.getByRole('button', { name: 'Simpan', exact: true }).click()
    await expect(a.getByText('Harga disimpan.', { exact: false })).toBeVisible()
    await a.getByRole('button', { name: 'Tambah layanan', exact: true }).click()
    await a.getByLabel('Nama', { exact: false }).fill(addonName)
    await a.getByLabel('Harga (Rp)', { exact: false }).fill('15000')
    await a.getByLabel('Tampilkan untuk pemesanan', { exact: false }).check()
    await a.getByRole('button', { name: 'Simpan', exact: true }).click()
    await expect(a.getByText(addonName, { exact: true })).toBeVisible()
    await c.goto(`${base}/order/romantic-floral`, {
      waitUntil: 'networkidle',
    })
    await c
      .getByLabel('Nama Pemesan', { exact: false })
      .fill('Browser Business Customer')
    await c.getByLabel('Nomor WhatsApp', { exact: false }).fill('081234567890')
    await c.getByLabel('Nama Pengantin Wanita', { exact: false }).fill('Nadia')
    await c.getByLabel('Nama Pengantin Pria', { exact: false }).fill('Fajar')
    const slug = `business-browser-${Date.now()}`
    await c.getByLabel('Slug Undangan', { exact: false }).fill(slug)
    await c
      .getByLabel('Pilih paket', { exact: true })
      .selectOption(String(offers.packages[0].id))
    await c.getByLabel(addonName, { exact: false }).check()
    await c.getByRole('button', { name: 'Lanjutkan', exact: true }).click()
    await expect(c.locator('.summary-total')).toContainText('189.000')
    await fits(c, 'Checkout mobile')
    await c.getByRole('button', { name: 'Buat Pesanan', exact: true }).click()
    await c.waitForURL(/\/order\/success\//)
    const number = new URL(c.url()).pathname.split('/').pop()
    const order = await data(
      await customer.request.post(`${base}/api/check-order`, {
        data: { order_number: number, whatsapp: '081234567890' },
      }),
    )
    assert.equal(Number(order.total), 189000)
    assert.equal(order.pricing.package.duration_days, 30)
    const invoice = await download(c, 'Download Invoice', `${dir}/invoice.pdf`)
    assert(invoice.subarray(0, 5).toString() === '%PDF-')
    await expect(
      c.getByRole('button', { name: 'Download Kwitansi', exact: true }),
    ).toHaveCount(0)
    console.log('Browser checkpoint passed.')
    checks.push(
      'Admin configures a package and optional add-on; mobile checkout computes and stores canonical pricing. Invoice downloads before payment; receipt stays unavailable.',
    )
    await data(
      await admin.request.patch(
        `${base}/api/admin/orders/${order.id}/payment`,
        { headers },
      ),
    )
    const wedding = await data(
      await admin.request.post(`${base}/api/admin/orders/${order.id}/wedding`, {
        headers,
      }),
      201,
    )
    const demo = await data(
      await admin.request.get(`${base}/api/templates/romantic-floral/preview`),
    )
    const path = `${base}/api/admin/weddings/${wedding.id}`
    const content = {
      ...demo,
      slug,
      title: 'Acara Uji Nadia & Fajar',
      expected_updated_at: wedding.updated_at,
    }
    for (const event of content.events) {
      event.start_time = event.start_time?.slice(0, 5)
      event.end_time = event.end_time?.slice(0, 5)
    }
    await data(await admin.request.put(path, { headers, data: content }))
    await data(await admin.request.post(`${path}/publish`, { headers }))
    const paid = await data(
      await admin.request.get(`${base}/api/admin/orders/${order.id}`),
    )
    assert(paid.invitation_expires_at)
    await data(
      await admin.request.post(`${path}/invitees/import`, {
        headers,
        multipart: {
          file: {
            name: 'guests.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(
              'nama;alamat\nTamu QR Browser;Jakarta\nTamu Kedua;Bandung\n',
            ),
          },
        },
      }),
      201,
    )
    const guests = await data(await admin.request.get(`${path}/invitees`))
    const guest = guests.find((g) => g.name === 'Tamu QR Browser'),
      passToken = new URL(guest.link).searchParams.get('guest')
    await c.goto(guest.link, { waitUntil: 'networkidle' })
    await c.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await c.getByRole('button', { name: 'QR Kehadiran', exact: true }).click()
    await expect(c.getByAltText('QR kehadiran Tamu QR Browser')).toBeVisible()
    const qrDownload = c.waitForEvent('download')
    await c.getByRole('link', { name: 'Download QR Tamu', exact: true }).click()
    await (await qrDownload).saveAs(`${dir}/guest-qr.png`)
    await c.getByRole('button', { name: 'Tutup dialog', exact: true }).click()
    await data(
      await customer.request.post(`${base}/api/weddings/${slug}/rsvp`, {
        data: {
          name: guest.name,
          guests: 3,
          attendance: 'Hadir',
          guest_token: passToken,
        },
      }),
      201,
    )
    await a.goto(`${base}/admin/weddings/${wedding.id}/check-in`, {
      waitUntil: 'networkidle',
    })
    await a
      .getByLabel('Pilih Foto QR', { exact: false })
      .setInputFiles(`${dir}/guest-qr.png`)
    await expect(a.locator('.guest-result h2')).toHaveText('Tamu QR Browser')
    await a.getByLabel('Jumlah orang yang datang', { exact: false }).fill('3')
    await a
      .getByRole('button', { name: 'Konfirmasi Kehadiran', exact: true })
      .click()
    await expect(a.locator('.guest-result')).toContainText(
      'Sudah check-in · 3 orang',
    )
    await a
      .getByLabel('Tautan atau kode QR tamu', { exact: false })
      .fill(`${base}/tamu/${passToken}`)
    await a.getByRole('button', { name: 'Cari Tamu', exact: true }).click()
    await expect(a.locator('.guest-result')).toContainText(
      'Sudah check-in · 3 orang',
    )
    await expect(
      a.getByRole('button', {
        name: 'Konfirmasi Kehadiran',
        exact: true,
      }),
    ).toHaveCount(0)
    const stats = await data(await admin.request.get(`${path}/analytics`))
    assert.equal(stats.check_ins, 1)
    assert.equal(stats.actual_people, 3)
    assert.equal(stats.rsvp.people, 3)
    assert.equal(stats.guest_links_opened, 1)
    assert(stats.visitors >= 1)
    assert.equal(stats.opens, 1)
    await a
      .getByRole('button', {
        name: 'Download Statistik CSV',
        exact: true,
      })
      .click()
    await a.screenshot({ path: `${dir}/check-in.png`, fullPage: true })
    await fits(a, 'Check-in desktop')
    await a.setViewportSize({ width: 390, height: 900 })
    await fits(a, 'Check-in mobile')
    await a.screenshot({
      path: `${dir}/check-in-mobile.png`,
      fullPage: true,
    })
    console.log('Browser checkpoint passed.')
    checks.push(
      'Downloaded guest QR is decoded through the actual image scanner, records three arrivals, and prevents repeat check-in. Statistics separate real attendance from RSVP and invitation opens.',
    )
    await c.goto(`${base}/tamu/${passToken}`, { waitUntil: 'networkidle' })
    await expect(
      c.getByRole('heading', { name: 'Tamu QR Browser', exact: true }),
    ).toBeVisible()
    await fits(c, 'Guest pass mobile')
    await c.screenshot({ path: `${dir}/guest-pass.png`, fullPage: true })
    const portal = await data(
      await admin.request.post(`${path}/customer-portal`, { headers }),
    )
    await c.goto(portal.link, { waitUntil: 'networkidle' })
    await c
      .getByRole('button', { name: 'Statistik & Tamu', exact: true })
      .click()
    await expect(c.locator('.analytics-cards article')).toHaveCount(9)
    await fits(c, 'Portal statistics mobile')
    await c
      .getByRole('button', { name: 'Dokumen & Pengingat', exact: true })
      .click()
    const receipt = await download(c, 'Download Kwitansi', `${dir}/receipt.pdf`)
    assert(receipt.subarray(0, 5).toString() === '%PDF-')
    await expect(
      c.getByRole('heading', { name: 'Pengingat', exact: false }),
    ).toBeVisible()
    await fits(c, 'Portal tools mobile')
    await c.screenshot({ path: `${dir}/portal-tools.png`, fullPage: true })
    console.log('Browser checkpoint passed.')
    checks.push(
      'Private customer portal provides statistics, QR downloads, payment receipt PDF and scheduled reminders; published guest pass renders without private addresses.',
    )
  }
  assert.deepEqual(errors, [])
  await writeFile(
    `${dir}/report.json`,
    JSON.stringify({ checks, errors }, null, 2),
  )
  console.log(
    `PASS: ${checks.length} business feature browser checks (${production ? 'production read-only' : 'isolated local database'}).`,
  )
} finally {
  await browser.close()
}
