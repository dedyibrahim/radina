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
      : ['localhost', '127.0.0.1'].includes(new URL(base).hostname)),
)
assert(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD)
const dir = `test-results/event-invitations/${production ? 'production' : 'local'}`
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
async function responseData(response, status = 200) {
  assert.equal(response.status(), status, await response.text())
  return (await response.json()).data
}
async function fits(page, label) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    `Horizontal overflow: ${label}`,
  )
  assert.deepEqual(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images
          .filter((img) => img.complete && !img.naturalWidth)
          .map((img) => img.getAttribute('src')),
      ),
    [],
    `Broken images: ${label}`,
  )
}
try {
  await a.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await a.getByLabel('Email admin').fill(process.env.TEST_ADMIN_EMAIL)
  await a.getByLabel('Kata sandi', { exact: false }).fill(process.env.TEST_ADMIN_PASSWORD)
  await solveLoginCaptcha(a)
  await a.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await a.waitForURL(`${base}/admin`)
  const token = decodeURIComponent(
    (await admin.cookies()).find((cookie) => cookie.name === 'XSRF-TOKEN').value,
  )
  const headers = { 'X-XSRF-TOKEN': token, Accept: 'application/json' }
  const islamic = []
  let lastCategoryPage = 1
  for (let page = 1; page <= lastCategoryPage; page++) {
    const response = await admin.request.get(`${base}/api/templates?category=islamic&page=${page}`)
    assert.equal(response.status(), 200)
    const result = await response.json()
    lastCategoryPage = result.meta.last_page
    islamic.push(...result.data)
  }
  assert.equal(islamic.length, 11)
  const keys = ['nur-jannah', 'mihrab-emerald', 'sahara-gold', 'qamar-blue', 'zahra-ivory']
  for (const key of keys) {
    assert(islamic.some((template) => template.template_key === key))
    for (const width of [390, 1440]) {
      await c.setViewportSize({ width, height: 900 })
      await c.goto(`${base}/templates/${key}/preview`, { waitUntil: 'networkidle' })
      await expect(c.getByRole('button', { name: 'Buka Undangan', exact: true })).toBeVisible()
      await fits(c, `${key} cover ${width}`)
      await c.screenshot({ path: `${dir}/${key}-${width}-cover.png` })
      await c.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
      await expect(c.locator('#couple')).toBeVisible()
      await fits(c, `${key} invitation ${width}`)
      const contrast = await c
        .locator('.event-card')
        .first()
        .evaluate((card) => {
          const luminance = (value) => {
            const rgb = value
              .match(/[\d.]+/g)
              .slice(0, 3)
              .map(Number)
              .map((v) => {
                v /= 255
                return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
              })
            return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
          }
          const foreground = luminance(getComputedStyle(card.querySelector('h3')).color)
          const background = luminance(getComputedStyle(card).backgroundColor)
          return (
            (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
          )
        })
      assert(contrast >= 4.5, `Event card contrast ${key}: ${contrast}`)
      if (width === 390) await c.screenshot({ path: `${dir}/${key}-content.png`, fullPage: true })
    }
  }
  checks.push(
    'Five distinct Islamic covers and complete invitations open at 390 and 1440 px without broken images or JavaScript warnings.',
  )
  for (const type of ['khitanan', 'office', 'birthday', 'aqiqah', 'other']) {
    const data = await responseData(
      await customer.request.get(
        `${base}/api/templates/romantic-floral/preview?event_type=${type}`,
      ),
    )
    assert.equal(data.event_type, type)
    assert.equal(data.bride, null)
    for (const width of [320, 390]) {
      await c.setViewportSize({ width, height: 900 })
      await c.goto(`${base}/templates/romantic-floral/preview?event_type=${type}`, {
        waitUntil: 'networkidle',
      })
      await expect(c.locator('.celebration-opening h1')).toHaveText(data.title)
      await c.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
      await expect(c.locator('#couple')).toContainText(data.event_details.host_name)
      await expect(c.locator('#event')).toContainText(data.events[0].title)
      await fits(c, `${type} ${width}`)
      if (width === 390) await c.screenshot({ path: `${dir}/${type}-content.png`, fullPage: true })
    }
  }
  checks.push(
    'All five non-wedding event types preview using real hosts and event titles, with neutral agendas and no couple records, at 320 and 390 px.',
  )
  await c.goto(`${base}/templates?category=islamic&event_type=khitanan`, {
    waitUntil: 'networkidle',
  })
  await expect(c.locator('.template-card')).toHaveCount(6)
  await expect(c.getByLabel('Jenis acara', { exact: false })).toHaveValue('khitanan')
  await fits(c, 'Islamic collection')
  const card = c.locator('.template-card').filter({ hasText: 'Nur Jannah' }).first()
  assert((await card.locator('a').first().getAttribute('href')).includes('event_type=khitanan'))
  await c.goto(`${base}/order/nur-jannah?event_type=khitanan`, { waitUntil: 'networkidle' })
  await expect(c.getByLabel('Nama anak', { exact: false })).toBeVisible()
  await expect(c.getByLabel('Nama Pengantin Wanita', { exact: false })).toHaveCount(0)
  await c.getByLabel('Nama Pemesan', { exact: false }).fill('Isolated Event Browser')
  await c.getByLabel('Nomor WhatsApp', { exact: false }).fill('081234567890')
  const slug = `khitan-browser-${Date.now()}`
  await c.getByLabel('Judul acara', { exact: false }).fill('Khitanan Ahmad Ibrahim')
  await expect(c.getByLabel('Slug Undangan', { exact: false })).toHaveValue(
    'khitanan-ahmad-ibrahim',
  )
  await c.getByLabel('Nama keluarga / tuan rumah', { exact: false }).fill('Keluarga Ibrahim')
  await c.getByLabel('Nama anak', { exact: false }).fill('Ahmad Ibrahim')
  await fits(c, 'Khitanan booking')
  await c.screenshot({ path: `${dir}/booking-khitanan.png`, fullPage: true })
  await c.goto(`${base}/order/nur-jannah?event_type=office`, { waitUntil: 'networkidle' })
  await expect(c.getByLabel('Nama perusahaan / penyelenggara', { exact: false })).toBeVisible()
  await expect(c.getByLabel('Nama anak', { exact: false })).toHaveCount(0)
  checks.push(
    'Collection links preserve the selected event type; khitanan and office booking fields adapt and event slugs preserve word boundaries.',
  )
  if (!production) {
    const order = await responseData(
      await admin.request.post(`${base}/api/orders`, {
        data: {
          template_id: islamic.find((t) => t.template_key === 'nur-jannah').id,
          customer_name: 'Isolated Event Browser',
          whatsapp: '081234567890',
          event_type: 'khitanan',
          event_title: 'Khitanan Ahmad Ibrahim',
          host_name: 'Keluarga Ibrahim',
          honoree_name: 'Ahmad Ibrahim',
          slug,
        },
      }),
      201,
    )
    await responseData(
      await admin.request.patch(`${base}/api/admin/orders/${order.id}/payment`, { headers }),
    )
    const wedding = await responseData(
      await admin.request.post(`${base}/api/admin/orders/${order.id}/wedding`, { headers }),
      201,
    )
    const path = `${base}/api/admin/weddings/${wedding.id}`
    await a.goto(`${base}/admin/weddings/${wedding.id}`, { waitUntil: 'networkidle' })
    await expect(a.getByLabel('Jenis acara', { exact: false })).toHaveValue('khitanan')
    await a.getByRole('button', { name: 'Data Acara', exact: true }).click()
    await expect(a.getByLabel('Nama anak', { exact: false })).toHaveValue('Ahmad Ibrahim')
    await a.getByRole('button', { name: 'Impor / Ekspor', exact: true }).click()
    const downloading = a.waitForEvent('download')
    await a.getByRole('button', { name: 'Unduh Template Acara', exact: true }).click()
    const download = await downloading
    await download.saveAs(`${dir}/template-acara.csv`)
    const csv = await readFile(`${dir}/template-acara.csv`, 'utf8')
    assert(csv.includes('event_details.honoree_name') && !csv.includes('bride.full_name'))
    await a.getByRole('button', { name: 'Pelanggan', exact: true }).click()
    await a.getByRole('button', { name: 'Buat Tautan Pelanggan', exact: true }).click()
    const link = await a.getByLabel('Tautan pribadi pelanggan', { exact: false }).inputValue()
    const secret = new URL(link).pathname.split('/').pop()
    await c.goto(link, { waitUntil: 'networkidle' })
    await expect(c.getByRole('button', { name: 'Isi Data Acara', exact: true })).toBeVisible()
    await expect(c.getByLabel('Nama anak', { exact: false })).toHaveValue('Ahmad Ibrahim')
    await expect(c.getByLabel('Nama lengkap pengantin wanita', { exact: false })).toHaveCount(0)
    await c.getByLabel('Nama ayah (opsional)', { exact: false }).fill('Dedy Ibrahim')
    await c.getByLabel('Tanggal acara', { exact: false }).fill('2026-12-24')
    const uploading = c.waitForResponse(
      (r) =>
        r.url().endsWith(`/customer-portals/${secret}/media`) && r.request().method() === 'POST',
    )
    await c
      .getByLabel('Foto anak / tokoh acara', { exact: false })
      .setInputFiles('frontend/public/images/bouquets/buket-05.jpg')
    const photo = (await responseData(await uploading))[0].url
    assert(photo.includes(`/weddings/${wedding.id}/customer/`))
    await c.getByRole('button', { name: 'Tambah Acara', exact: true }).click()
    await c.getByLabel('Nama acara 1', { exact: false }).fill('Syukuran Khitanan')
    await c.getByLabel('Jenis acara 1', { exact: false }).selectOption('syukuran')
    await c.getByLabel('Tanggal acara 1', { exact: false }).fill('2026-12-24')
    await c.getByLabel('Jam mulai acara 1', { exact: false }).fill('09:00')
    await c.getByLabel('Jam selesai acara 1', { exact: false }).fill('11:00')
    await c.getByLabel('Lokasi acara 1', { exact: false }).fill('Aula Radina')
    await c.getByLabel('Alamat acara 1', { exact: false }).fill('Jalan Mawar, Jakarta')
    await c.getByRole('button', { name: 'Kirim Data ke Admin', exact: true }).click()
    await expect(c.locator('.customer-status')).toHaveText('Data dikirim ke admin')
    await a.getByRole('button', { name: 'Muat Data Pelanggan', exact: true }).click()
    await expect(a.locator('.customer-proposal')).toContainText('Ahmad Ibrahim')
    await a.getByRole('button', { name: 'Terapkan Data Pelanggan', exact: true }).click()
    await a.getByRole('button', { name: 'Ya, Terapkan Data Pelanggan', exact: true }).click()
    await expect(a.getByRole('heading', { level: 1 })).toHaveText('Khitanan Ahmad Ibrahim')
    assert.equal((await admin.request.post(`${path}/publish`, { headers })).status(), 422)
    await c.getByRole('button', { name: 'Preview & Persetujuan', exact: true }).click()
    await c.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(c.locator('#couple')).toContainText('Dedy Ibrahim')
    c.once('dialog', (dialog) => dialog.accept())
    await c.getByRole('button', { name: 'Sudah Sesuai, Saya Setujui', exact: true }).click()
    await expect(c.locator('.customer-status')).toHaveText('Sudah disetujui')
    await a.getByRole('button', { name: 'Publish', exact: true }).click()
    await a.getByRole('button', { name: 'Publish Website', exact: true }).click()
    await a.getByRole('button', { name: 'Ya, Publish Website', exact: true }).click()
    await expect(a.getByRole('link', { name: 'Lihat Undangan', exact: true })).toBeVisible()
    await responseData(
      await admin.request.post(`${path}/invitees/import`, {
        headers,
        multipart: {
          file: {
            name: 'guests.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from('nama;alamat\nTamu Khitanan;Jakarta\n'),
          },
        },
      }),
      201,
    )
    const guests = await responseData(await admin.request.get(`${path}/invitees`))
    const url = guests[0].link
    assert(url.includes('guest='))
    await c.goto(url, { waitUntil: 'networkidle' })
    await expect(c.locator('.celebration-guest')).toContainText('Tamu Khitanan')
    await c.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(c.locator('#couple')).toContainText('Ahmad Ibrahim')
    await expect(c.locator('#rsvp-name')).toHaveValue('Tamu Khitanan')
    for (const width of [320, 390, 1440]) {
      await c.setViewportSize({ width, height: 900 })
      await fits(c, `Published khitanan ${width}`)
      await c.screenshot({ path: `${dir}/published-khitanan-${width}.png`, fullPage: true })
    }
    checks.push(
      'Khitanan admin fields, downloaded customer CSV, private child/photo upload, submit/apply/approval gate, UI publication, and generated personal guest links passed.',
    )
  } else {
    const existing = await responseData(await admin.request.get(`${base}/api/admin/weddings/22`))
    assert.equal(existing.event_type, 'wedding')
    assert(existing.bride.full_name && existing.groom.full_name)
    assert(existing.music.playlist.every((track) => track.url.includes('/music-library/radina-')))
    assert.equal((await admin.request.get(`${base}/api/admin/licenses`)).status(), 200)
    checks.push(
      'Existing production wedding 22 retains its couple data and supplied music; the license administration endpoint remains accessible. No production order or invitation was changed.',
    )
  }
  assert.deepEqual(errors, [])
  await writeFile(`${dir}/report.json`, JSON.stringify({ checks, errors }, null, 2))
  console.log(
    `PASS: ${checks.length} event invitation browser checks (${production ? 'production read-only' : 'isolated local database'}).`,
  )
} finally {
  await browser.close()
}
