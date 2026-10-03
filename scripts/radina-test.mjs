import { solveLoginCaptcha } from './support/login-captcha.mjs'
﻿import { chromium } from '@playwright/test'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const base = process.env.TEST_URL || 'http://localhost:5173'
const keys = [
  'romantic-floral',
  'elegant-luxury',
  'minimalist-white',
  'nusantara-heritage',
  'garden-dream',
  'classic-vintage',
  'midnight-romance',
  'sakinah',
  'eternal-story',
  'blush',
]
const requestedKeys = process.env.RADINA_TEMPLATES?.split(',').filter((key) => keys.includes(key))
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
const env = Object.fromEntries(
  (await readFile('.env', 'utf8'))
    .split(/\r?\n/)
    .filter((s) => s.includes('='))
    .map((s) => [s.slice(0, s.indexOf('=')), s.slice(s.indexOf('=') + 1)]),
)
await mkdir('test-results/radina', { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const context = await browser.newContext({
  reducedMotion: 'reduce',
  permissions: ['clipboard-read', 'clipboard-write'],
})
const page = await context.newPage(),
  errors = [],
  report =
    process.env.RADINA_SKIP_VISUAL === '1' || requestedKeys
      ? JSON.parse(await readFile('test-results/radina/report.json', 'utf8')).filter(
          (x) => x.key && !requestedKeys?.includes(x.key),
        )
      : []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.text().includes('[Vue warn]')) errors.push(m.text())
})
await page.addInitScript(() => {
  window.__audioCreated = 0
  const AudioOriginal = window.Audio
  window.Audio = function (...args) {
    window.__audioCreated++
    window.__currentAudio = new AudioOriginal(...args)
    return window.__currentAudio
  }
})
async function req(method, path, body) {
  return page.evaluate(
    async ({ method, path, body }) => {
      const token = document.cookie
        .split('; ')
        .find((x) => x.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=')
      const r = await fetch('/api' + path, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      return { status: r.status, data: await r.json() }
    },
    { method, path, body },
  )
}
async function overflow(label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label)
}
try {
  await page.goto(base, { waitUntil: 'networkidle' })
  assert.equal((await req('GET', '/settings')).data.data.company_name, 'Radina')
  await page.screenshot({ path: 'test-results/radina/home.png', fullPage: true })
  for (const key of process.env.RADINA_SKIP_VISUAL === '1' ? [] : requestedKeys || keys) {
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height })
      await page.goto(
        `${base}/templates/${key}/preview?to=${encodeURIComponent('Dedy Ibrahim dan Keluarga Besar Dengan Nama Panjang')}`,
        { waitUntil: 'networkidle' },
      )
      await page.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
      await page.locator('#gallery').waitFor()
      await overflow(`${key} ${width}`)
      const before = page.url(),
        created = await page.evaluate(() => window.__audioCreated)
      for (const section of ['Couple', 'Event', 'Gallery', 'Gift']) {
        const button = page
          .locator('.floating-nav')
          .getByRole('button', { name: section, exact: true })
        if (await button.count()) {
          await button.click()
          assert.equal(page.url(), before)
          assert.equal(
            await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(),
            0,
          )
          assert.equal(await page.evaluate(() => window.__audioCreated), created)
        }
      }
      assert((await page.url()).includes('to='))
      await overflow(`${key} navigation ${width}`)
      await page.locator('#gallery img').first().click()
      await page.getByRole('dialog').waitFor()
      await overflow(`${key} lightbox ${width}`)
      await page.getByRole('button', { name: 'Tutup dialog' }).click()
      await page.locator('#gift').getByRole('tab', { name: 'Kirim Hadiah' }).click()
      await page.locator('#gift').getByRole('button', { name: 'Kirim Hadiah', exact: true }).click()
      await page.getByRole('dialog').waitFor()
      await overflow(`${key} physical modal ${width}`)
      await page.getByRole('button', { name: 'Tutup dialog' }).click()
      if (width === 390) {
        await page.locator('#home').scrollIntoViewIfNeeded()
        await page.screenshot({ path: `test-results/radina/${key}-390.png` })
        await page.locator('#gift').getByRole('tab', { name: 'Transfer Bank' }).click()
        await page.locator('#gift').scrollIntoViewIfNeeded()
        await page.screenshot({ path: `test-results/radina/${key}-gift.png` })
      }
      report.push({ key, width, height, status: 'passed' })
    }
    console.log(
      `PASS ${key}: 10 viewports, section navigation, guest query, gallery and gift modal`,
    )
  }
  for (const key of keys) {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto(`${base}/templates/${key}/preview?to=Dedy%20Ibrahim`, {
      waitUntil: 'networkidle',
    })
    await page.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await page.locator('#home').waitFor()
    const stableUrl = page.url()
    await page.getByRole('button', { name: 'Gulir ke cerita kami' }).click()
    assert.equal(page.url(), stableUrl)
    assert.equal(await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(), 0)
    await overflow(`${key} scroll indicator`)
  }
  console.log('PASS scroll indicator: all 10 templates preserve URL and opening state')
  await page.goto(base + '/templates/romantic-floral/preview?to=Dedy%20Ibrahim', {
    waitUntil: 'networkidle',
  })
  await page.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
  await page.locator('#gallery').waitFor()
  const count = await page.evaluate(() => window.__audioCreated)
  let apiReload = 0
  page.on('request', (r) => {
    if (r.url().includes('/api/templates/romantic-floral/preview')) apiReload++
  })
  await page.waitForFunction(() => window.__currentAudio?.readyState >= 1)
  const seek = await page.evaluate(() => Math.min(10, window.__currentAudio.duration / 4))
  await page.evaluate((value) => {
    window.__currentAudio.currentTime = value
  }, seek)
  await page.waitForFunction((value) => window.__currentAudio.currentTime >= value - 0.1, seek)
  await page.evaluate(() => {
    window.location.hash = 'gallery'
  })
  await page.waitForTimeout(800)
  assert.equal(apiReload, 0)
  assert.equal(await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(), 0)
  assert.equal(await page.evaluate(() => window.__audioCreated), count)
  assert((await page.evaluate(() => window.__currentAudio.currentTime)) >= seek - 0.1)
  console.log('PASS hash regression: renderer and music preserved')
  await page.goto(base + '/admin/login')
  await page.getByLabel('Email admin').fill(env.ADMIN_EMAIL)
  await page.getByLabel('Kata sandi').fill(env.ADMIN_PASSWORD)
  await solveLoginCaptcha(page);
  await page.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await page.waitForURL(base + '/admin')
  const demo = (await req('GET', '/admin/weddings/1')).data.data
  const created = await req('POST', '/orders', {
    template_id: demo.template_id,
    customer_name: 'Radina Upgrade Test',
    whatsapp: '081234567890',
    bride_name: 'Nadia Test',
    groom_name: 'Fajar Test',
    slug: 'radina-test-' + Date.now(),
  })
  assert.equal(created.status, 201)
  const order = created.data.data
  await req('PATCH', `/admin/orders/${order.id}/payment`, {})
  const w = (await req('POST', `/admin/orders/${order.id}/wedding`, {})).data.data
  const payload = {
    ...demo,
    slug: order.slug,
    expected_updated_at: w.updated_at,
    events: demo.events.map((e) => ({
      ...e,
      start_time: e.start_time.slice(0, 5),
      end_time: e.end_time.slice(0, 5),
    })),
  }
  delete payload.gift_methods
  assert.equal((await req('PUT', `/admin/weddings/${w.id}`, payload)).status, 200)
  await page.goto(`${base}/admin/weddings/${w.id}/gift`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Tambah Metode' }).click()
  await page.getByLabel('Nama Bank').fill('BCA')
  await page.getByLabel('Nomor Rekening').fill('1122334455')
  await page.getByLabel('Nama Pemilik').fill('Nadia Test')
  await page.getByRole('button', { name: 'Simpan Metode Hadiah' }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.getByRole('button', { name: 'Tambah Metode' }).click()
  await page.getByLabel('Jenis Metode').selectOption('EWALLET')
  await page.getByLabel('Provider E-Wallet').fill('DANA')
  await page.getByLabel('Nomor E-Wallet').fill('081234567890')
  await page.getByLabel('Nama Pemilik').fill('Nadia Test')
  await page.getByRole('button', { name: 'Simpan Metode Hadiah' }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(
    (
      await req('POST', `/admin/weddings/${w.id}/gifts`, {
        type: 'QRIS',
        provider: 'QRIS Demo',
        account_name: 'Nadia Test',
        qr_image: '/images/templates/sakinah.svg',
        description: 'Gambar demo, bukan QR pembayaran.',
        is_active: true,
      })
    ).status,
    201,
  )
  assert.equal(
    (
      await req('POST', `/admin/weddings/${w.id}/gifts`, {
        type: 'PHYSICAL',
        recipient_name: 'Nadia Test',
        phone: '081234567890',
        address: 'Alamat pengiriman uji',
        is_active: true,
      })
    ).status,
    201,
  )
  await page.reload({ waitUntil: 'networkidle' })
  if (await page.getByRole('button', { name: 'Simpan', exact: true }).isEnabled())
    await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click()
  await page.locator('#couple').waitFor()
  assert.equal(await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(), 0)
  await page.getByRole('button', { name: 'Informasi Dasar', exact: true }).click()
  await page.getByLabel('Judul Undangan').fill('Live Preview Radina')
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click()
  await page.locator('#couple').waitFor()
  assert.equal(await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(), 0)
  // Change template through the shared editor and retain gifts.
  await page.getByRole('button', { name: 'Template', exact: true }).click()
  const card = page
    .locator('.template-choice')
    .filter({ has: page.getByRole('heading', { name: 'Sakinah', exact: true }) })
  await card.getByRole('button', { name: 'Gunakan Template' }).click()
  await page.getByRole('button', { name: 'Ya, Gunakan Template' }).click()
  await page.locator('.theme-sakinah').waitFor()
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByText('Konten undangan berhasil disimpan.').waitFor()
  const saved = (await req('GET', `/admin/weddings/${w.id}`)).data.data
  assert.equal(saved.template.template_key, 'sakinah')
  assert.equal(saved.gift_methods.length, 4)
  assert.equal(saved.gallery.length, demo.gallery.length)
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height })
    await page.getByRole('button', { name: 'Wedding Gift', exact: true }).click()
    await overflow(`CMS gift ${width}`)
    await page.getByRole('button', { name: 'Tambah Metode' }).click()
    await page.getByRole('dialog').waitFor()
    await overflow(`CMS gift modal ${width}`)
    await page.getByRole('button', { name: 'Tutup dialog' }).click()
  }
  await page.goto(`${base}/admin/weddings/${w.id}/preview?to=Dedy%20Ibrahim`, {
    waitUntil: 'networkidle',
  })
  await page.locator('#gift').waitFor()
  assert.equal(await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(), 0)
  await page.locator('#gift').getByRole('tab', { name: 'E-Wallet' }).click()
  await page.locator('#gift').getByRole('button', { name: 'Salin Nomor' }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '081234567890')
  await page.locator('#gift').getByRole('tab', { name: 'QRIS', exact: true }).click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download QR' }).click()
  await downloaded
  await page.getByRole('button', { name: 'Preview Cover', exact: true }).click()
  await page.getByRole('button', { name: 'Buka Undangan', exact: true }).waitFor()
  await page
    .locator('.preview-controls')
    .getByRole('button', { name: 'Gallery', exact: true })
    .click()
  await page.locator('#gallery').waitFor()
  assert.equal(await page.getByRole('button', { name: 'Buka Undangan', exact: true }).count(), 0)
  console.log(
    'PASS gift CMS, live preview, template switch, admin preview, clipboard and QR download',
  )
  assert.equal(errors.length, 0, errors.join('\n'))
  report.push({
    test: 'Gift CMS, preview, template switch and hash/audio regression',
    status: 'passed',
    weddingId: w.id,
  })
} catch (e) {
  await page.screenshot({ path: 'test-results/radina/failure.png', fullPage: true })
  await writeFile(
    'test-results/radina/failure.txt',
    `${page.url()}\n${e.stack}\n${errors.join('\n')}`,
  )
  throw e
} finally {
  await writeFile('test-results/radina/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
