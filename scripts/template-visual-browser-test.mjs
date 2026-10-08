import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium, expect } from '@playwright/test'

const rows = JSON.parse(
  await readFile('test-results/template-visual-audit.json', 'utf8'),
)
const root = resolve('frontend/dist'),
  dir = 'test-results/template-visuals'
await mkdir(dir, { recursive: true })
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    )
    const path = resolve(root, '.' + pathname)
    assert(path.startsWith(root + '/') || path.startsWith(root + '\\'))
    const file = extname(path) ? path : resolve(root, 'index.html')
    response.setHeader(
      'Content-Type',
      {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.html': 'text/html',
      }[extname(file)] || 'application/octet-stream',
    )
    response.end(await readFile(file))
  } catch {
    response.statusCode = 404
    response.end()
  }
})
await new Promise((done) => server.listen(5181, '127.0.0.1', done))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = [],
  apiCalls = []
const base = 'http://127.0.0.1:5181'
let eventTypeFixture = 'wedding'
let journeyFixture = false
function wedding(key, eventType = 'wedding') {
  const row = rows.find((row) => row.key === key)
  return {
    id: 1,
    slug: `visual-${key}`,
    title: 'Alya & Rizky',
    is_demo: false,
    status: 'DRAFT',
    event_type: eventType,
    wedding_date: '2026-12-12',
    template: {
      id: 1,
      slug: key,
      template_key: key,
      name: row.name,
      status: 'ACTIVE',
      category: { name: row.worldCategory || row.category || 'Modern' },
      features: [],
    },
    bride: {
      full_name: 'Alya Putri Ramadhani',
      nickname: 'Alya',
      photo: '/images/demos/photo-1.webp',
      father_name: 'Bapak Ahmad',
      mother_name: 'Ibu Siti',
      family_order: 'Putri pertama dari',
    },
    groom: {
      full_name: 'Rizky Pratama',
      nickname: 'Rizky',
      photo: '/images/demos/photo-2.webp',
      father_name: 'Bapak Budi',
      mother_name: 'Ibu Rina',
      family_order: 'Putra tercinta dari',
    },
    cover_image: '/images/demos/photo-1.webp',
    hero_image: '/images/demos/photo-3.webp',
    closing_image: '/images/demos/photo-2.webp',
    quote: 'Arab dan terjemahan/nDoa terbaik bagi keluarga kami.',
    quote_source: 'Doa keluarga',
    opening_text:
      'Dengan penuh syukur kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu.',
    closing_text: 'Terima kasih atas kehadiran dan doa restu Anda.',
    events: [
      {
        id: 7,
        title: 'Akad Nikah',
        type: 'akad',
        date: '2026-12-12',
        start_time: '09:00:00',
        end_time: '10:00:00',
        timezone: 'Asia/Jakarta',
        venue: 'Rumah Keluarga',
        address: 'Jalan Keluarga 1',
        is_visible: true,
        show_on_map: true,
        use_for_countdown: false,
      },
      {
        id: 9,
        title: 'Resepsi',
        type: 'reception',
        date: '2026-12-13',
        start_time: '14:00:00',
        end_time: '16:00:00',
        timezone: 'Asia/Makassar',
        venue: 'Gedung Mawar',
        address: 'Jalan Mawar 2',
        is_visible: true,
        show_on_map: false,
        use_for_countdown: true,
      },
    ],
    stories: [0, 1, 2].map((i) => ({
      date_label: `202${i + 2}`,
      title: ['Pertemuan', 'Perjalanan', 'Janji Kami'][i],
      description: 'Setiap langkah membawa kami menuju cerita yang indah.',
      image: `/images/demos/photo-${i + 1}.webp`,
    })),
    gallery: [1, 2, 3, 4, 5, 6].map((i) => ({
      image: `/images/demos/photo-${i}.webp`,
      caption: `Kenangan ${i}`,
    })),
    gifts: [],
    gift_methods: [
      {
        type: 'BANK',
        provider: 'BCA',
        account_number: '8721354342',
        account_name: 'Dedy Ibrahim',
        is_active: true,
      },
    ],
    shipping_gift: {},
    settings: {
      ...Object.fromEntries(
        [
          'parents',
          'family',
          'social',
          'music',
          'gallery',
          'story',
          'rsvp',
          'wishes',
          'gift',
          'countdown',
          'maps',
        ].map((key) => ['enable_' + key, true]),
      ),
      enable_auto_journey: journeyFixture,
      auto_journey_speed: 'slow',
      motion_intensity: 'cinematic',
    },
    music: {
      playlist: [
        {
          title: 'Musik Pilihan',
          artist: 'Radina',
          url: '/music/wedding-song.mp3',
        },
      ],
      volume: 40,
      autoplay_after_open: true,
    },
    livestream: {},
    section_content: {},
    event_details: {
      host_name: 'Keluarga Ibrahim',
      honoree_name: 'Dedy',
      honoree_age: 7,
      description: 'Mari hadir dan merayakan momen istimewa bersama kami.',
      photo: '/images/demos/photo-1.webp',
    },
  }
}
async function context(options) {
  const context = await browser.newContext(options)
  await context.addInitScript(() => {
    window.audioEvents = []
    class AudioFixture extends EventTarget {
      constructor(src) {
        super()
        window.audioInstance = this
        this.src = src
        this.muted = false
        this.currentTime = 0
        window.audioEvents.push({ action: 'create' })
      }
      getAttribute(key) {
        return key === 'src' ? this.src : null
      }
      async play() {
        window.audioEvents.push({
          action: 'play',
          muted: this.muted,
          cover: !!document.querySelector('.opening-stage'),
          at: performance.now(),
        })
      }
      pause() {
        window.audioEvents.push({ action: 'pause' })
      }
    }
    window.Audio = AudioFixture
  })
  await context.route('**/sanctum/csrf-cookie', (route) =>
    route.fulfill({ status: 204 }),
  )
  await context.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    apiCalls.push(path)
    let data
    if (path === '/api/admin/me') data = { id: 1, name: 'Admin', role: 'admin' }
    else if (path === '/api/admin/weddings/1/preview')
      data = wedding('romantic-floral')
    else if (/^\/api\/templates\/[^/]+\/preview$/.test(path)) {
      const key = path.split('/')[3]
      data = wedding(key, new URL(route.request().url()).searchParams.get('event_type') || (key.startsWith('anak-') ? 'birthday' : 'wedding'))
      data.is_demo = true
    }
    else if (
      path.startsWith('/api/weddings/visual-') &&
      !/\/(visits|wishes|rsvps)$/.test(path)
    )
      data = wedding(
        path.slice('/api/weddings/visual-'.length),
        new URL(route.request().url()).searchParams.get('event_type') ||
          eventTypeFixture,
      )
    else if (path.endsWith('/wishes') || path.endsWith('/rsvps')) data = []
    else if (path.endsWith('/visits')) data = {}
    else if (path === '/api/settings') data = { site_name: 'Radina' }
    else {
      await route.fulfill({
        status: 404,
        json: { message: 'Fixture not found: ' + path },
      })
      return
    }
    await route.fulfill({ json: { data } })
  })
  context.on('page', (page) => {
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.text().includes('[Vue warn]')) errors.push(message.text())
    })
  })
  return context
}
async function fits(page, label) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Horizontal overflow: ${label}`,
  )
}
if (process.env.RADINA_CINEMATIC_PREVIEW === '1') {
  try {
    const c = await context({ viewport: { width: 1280, height: 900 } })
    const p = await c.newPage()
    for (const key of ['jawa-pendopo-pagi', 'golden-atelier', 'anak-petualangan-laut']) {
      await p.goto(`${base}/templates/${key}/preview?to=Dedy%20Ibrahim`)
      const frame = p.frameLocator('.admin-preview-frame')
      await expect(frame.locator('.cinematic-opening')).toHaveAttribute('data-reveal', 'READY')
      await expect(frame.locator('.cinematic-opening')).toContainText('Dedy Ibrahim')
      if (key.startsWith('anak-')) await expect(frame.locator('.cinematic-opening')).toContainText('Merayakan usia ke-7')
      await p.getByRole('button', { name: 'Mobile', exact: true }).click()
      await expect(p.locator('.wedding-preview-canvas')).toHaveClass(/preview-device-mobile/)
      await p.getByRole('button', { name: 'Animasi ON', exact: true }).click()
      await expect(frame.locator('.wedding-page')).toHaveClass(/motion-off/)
      await frame.getByRole('button', { name: /^(Buka Undangan|Mulai Petualangan)$/ }).click()
      await expect(frame.locator('.opening-stage')).toHaveCount(0)
      await frame.getByRole('button', { name: 'Detail playlist', exact: true }).click()
      const volume = frame.getByRole('slider', { name: 'Volume musik', exact: true })
      await volume.evaluate((input) => { input.value = '25'; input.dispatchEvent(new Event('input', { bubbles: true })) })
      await expect(frame.locator('.playlist-volume')).toContainText('25%')
      const inner = p.frames().find(f => f !== p.mainFrame())
      await inner.evaluate(() => { window.audioInstance.currentTime = 42 })
      await frame.getByRole('button', { name: 'Bisukan suara', exact: true }).click()
      assert.equal(await inner.evaluate(() => window.audioInstance.muted), true)
      assert.equal(await inner.evaluate(() => window.audioInstance.volume), 0.25)
      await frame.getByRole('button', { name: 'Aktifkan suara', exact: true }).click()
      for (const id of ['gallery', 'gift', 'rsvp']) {
        await frame.locator('#'+id).scrollIntoViewIfNeeded()
        await expect(frame.locator('.opening-stage')).toHaveCount(0)
      }
      assert.equal(await inner.evaluate(() => window.audioInstance.currentTime), 42)
      assert.equal(await inner.evaluate(() => window.audioEvents.filter(e => e.action === 'create').length), 1)
      await p.getByRole('button', { name: 'Preview Cover', exact: true }).click()
      await expect(frame.locator('.opening-stage')).toBeVisible()
      await p.screenshot({ path: `${dir}/${key}-public-preview.png` })
      console.log('Preview, replay, volume and navigation passed:', key)
      // Each new page begins with the default toolbar preference.
      await p.reload()
    }
    await c.close()
    assert.deepEqual(errors, [])
  } finally { await browser.close(); server.close() }
  process.exit(0)
}
if (process.env.RADINA_VISUAL_SLICE === '1') {
  try {
    const c = await context({ viewport: { width: 390, height: 844 } })
    const p = await c.newPage()
    for (const key of [
      'jawa-pendopo-pagi',
      'golden-atelier',
      'anak-petualangan-laut',
    ]) {
      eventTypeFixture = key.startsWith('anak-') ? 'birthday' : 'wedding'
      for (const width of [
        320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440,
      ]) {
        await p.setViewportSize({ width, height: 844 })
        await p.goto(base + '/w/visual-' + key + '?to=Dedy%20Ibrahim')
        await expect(p.locator('.cinematic-opening')).toHaveAttribute(
          'data-reveal',
          'READY',
        )
        await expect(p.locator('.cinematic-opening')).toContainText(
          'Dedy Ibrahim',
        )
        await fits(p, key + ' cover ' + width)
        if ([390, 1440].includes(width))
          await p.screenshot({
            path: dir + '/' + key + '-' + width + '-opening.png',
            animations: 'disabled',
            fullPage: true,
          })
        await p
          .getByRole('button', {
            name: /^(Buka Undangan|Mulai Petualangan)$/,
          })
          .click()
        await expect(p.locator('.invitation-content')).toBeVisible()
        await expect(p.locator('.opening-stage')).toHaveCount(0)
        await fits(p, key + ' content ' + width)
        if ([390, 1440].includes(width))
          await p.locator('#home').screenshot({
            path: dir + '/' + key + '-' + width + '-home.png',
            animations: 'disabled',
          })
        const creates = await p.evaluate(
          () => window.audioEvents.filter((e) => e.action === 'create').length,
        )
        assert.equal(creates, 1)
        for (const id of ['gallery', 'gift', 'rsvp']) {
          await p.locator('#' + id).scrollIntoViewIfNeeded()
          await expect(p.locator('.opening-stage')).toHaveCount(0)
        }
        assert.equal(
          await p.evaluate(
            () =>
              window.audioEvents.filter((e) => e.action === 'create').length,
          ),
          creates,
        )
        console.log('Reference:', key, width, 'passed')
      }
    }
    assert.deepEqual(errors, [])
    await c.close()
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
try {
  const batch = await context({
    viewport: { width: 390, height: 820 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  })
  const page = await batch.newPage()
  for (const [i, row] of rows.entries()) {
    await page.goto(`${base}/w/visual-${row.key}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('.wedding-page')).toHaveAttribute(
      'data-visual-personality',
      row.personality,
      { timeout: 20000 },
    )
    await expect(page.locator('.wedding-page')).toHaveAttribute(
      'data-visual-quality',
      'lite',
    )
    await expect(
      page.locator(
        '.opening-stage > .visual-atmosphere, .opening-stage .cinematic-scene',
      ),
    ).toHaveCount(1)
    await fits(page, row.key + ' cover')
    await page.screenshot({
      path: `${dir}/${row.key}-cover.png`,
      animations: 'disabled',
    })
    await page
      .getByRole('button', {
        name: /^(Buka Undangan|Mulai Petualangan)$/,
      })
      .click()
    await expect(page.locator('.invitation-content')).toBeVisible()
    await expect(page.locator('#date .big-date > span')).toHaveText('13')
    await expect(page.locator('#date .countdown-target')).toContainText(
      '14:00 WITA',
    )
    await expect(page.locator('#couple')).toContainText('Alya Putri Ramadhani')
    await expect(page.locator('#event')).toContainText('Gedung Mawar')
    await fits(page, row.key + ' content')
    await page.locator('#gallery').scrollIntoViewIfNeeded()
    await fits(page, row.key + ' gallery')
    await page.locator('#gallery').evaluate(async (element) => {
      await Promise.all(
        [...element.querySelectorAll('img')]
          .filter((img) => img.getBoundingClientRect().top < innerHeight)
          .map((img) => {
            img.loading = 'eager'
            return Promise.race([
              img.decode(),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error('Photo decode timed out: ' + img.src)),
                  7000,
                ),
              ),
            ])
          }),
      )
    })
    await page.screenshot({
      path: `${dir}/${row.key}-gallery.png`,
      animations: 'disabled',
    })
    await page
      .locator('#gallery button[aria-label^="Perbesar foto"]')
      .first()
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page
      .getByRole('button', { name: 'Foto berikutnya', exact: true })
      .click()
    await expect(page.locator('.lightbox-controls')).toContainText('2 / 6')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.locator('#gift').scrollIntoViewIfNeeded()
    await expect(page.locator('#gift')).toContainText('8721354342')
    await fits(page, row.key + ' gift')
    const before = await page.evaluate(
      () =>
        window.audioEvents.filter((item) => item.action === 'create').length,
    )
    const url = page.url(),
      calls = apiCalls.filter(
        (path) => path === `/api/weddings/visual-${row.key}`,
      ).length
    await page.getByRole('button', { name: 'Event', exact: true }).click()
    assert.equal(page.url(), url)
    assert.equal(
      apiCalls.filter((path) => path === `/api/weddings/visual-${row.key}`)
        .length,
      calls,
    )
    assert.equal(
      await page.evaluate(
        () =>
          window.audioEvents.filter((item) => item.action === 'create').length,
      ),
      before,
    )
    await expect(page.locator('.opening-stage')).toHaveCount(0)
    if ((i + 1) % 10 === 0)
      console.log(`Checked ${i + 1}/${rows.length} templates on mobile`)
  }
  const representatives = [
    ...new Map(rows.map((row) => [row.personality, row])).values(),
  ]
  for (const width of [360, 375, 414, 430]) {
    await page.setViewportSize({ width, height: 820 })
    for (const row of representatives) {
      await page.goto(`${base}/w/visual-${row.key}`)
      await expect(page.locator('.opening-stage')).toBeVisible()
      await fits(page, `${row.key} ${width}px cover`)
      await page
        .getByRole('button', {
          name: /^(Buka Undangan|Mulai Petualangan)$/,
        })
        .click()
      await expect(page.locator('.invitation-content')).toBeVisible()
      await fits(page, `${row.key} ${width}px content`)
    }
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(`${base}/w/visual-rosalia-arch?to=Dedy%20Ibrahim`)
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-visual-quality',
    'standard',
  )
  await expect(page.locator('.opening-stage')).toContainText('Dedy Ibrahim')
  await expect
    .poll(() =>
      page.locator('.scene-motion').getAttribute('data-frames').then(Number),
    )
    .toBeGreaterThan(0)
  await page
    .getByRole('button', { name: 'Matikan animasi', exact: true })
    .click()
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'false',
  )
  await expect(page.locator('.visual-ornament > span').first()).toHaveCSS(
    'animation-play-state',
    'paused',
  )
  await page
    .getByRole('button', { name: 'Aktifkan animasi', exact: true })
    .click()
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'true',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-visual-quality',
    'lite',
  )
  await expect(page.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'false',
  )
  for (const type of ['office', 'khitanan', 'birthday', 'aqiqah', 'other']) {
    eventTypeFixture = type
    await page.goto(`${base}/w/visual-rosalia-arch`)
    await page
      .getByRole('button', {
        name: /^(Buka Undangan|Mulai Petualangan)$/,
      })
      .click()
    await expect(page.locator('#couple')).toContainText('Keluarga Ibrahim')
    await fits(page, type)
  }
  eventTypeFixture = 'wedding'
  await batch.close()
  const desktop = await context({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
  })
  const d = await desktop.newPage()
  for (const row of rows) {
    await d.goto(`${base}/w/visual-${row.key}`)
    await expect(d.locator('.wedding-page')).toHaveAttribute(
      'data-visual-quality',
      'high',
    )
    await fits(d, row.key + ' desktop')
    // Render every desktop composition; detailed transition/audio checks below.
    await d.screenshot({
      path: `${dir}/${row.key}-desktop.png`,
      animations: 'disabled',
    })
  }
  for (const row of representatives) {
    await d.goto(`${base}/w/visual-${row.key}`)
    await expect(d.locator('.opening-stage')).toBeVisible()
    await d
      .getByRole('button', {
        name: /^(Buka Undangan|Mulai Petualangan)$/,
      })
      .click()
    await expect(d.locator('.opening-stage')).toHaveClass(/cover-leave-active/)
    await expect(d.locator('.invitation-content')).toBeVisible()
    const events = await d.evaluate(() => window.audioEvents)
    assert.equal(events.filter((item) => item.action === 'create').length, 1)
    const muted = events.find((item) => item.action === 'play' && item.muted)
    const audible = events.find((item) => item.action === 'play' && !item.muted)
    assert(muted?.cover, row.key)
    assert.equal(audible?.cover, false, row.key)
    assert(
      audible.at - muted.at >= 650 && audible.at - muted.at < 1800,
      `Opening duration: ${row.key}`,
    )
    const allocations = events.length
    await d.getByRole('button', { name: 'Event', exact: true }).click()
    await expect(d.locator('.opening-stage')).toHaveCount(0)
    assert.equal(
      (await d.evaluate(() => window.audioEvents)).length,
      allocations,
    )
  }
  await d.getByRole('button', { name: 'Music ON', exact: true }).click()
  await expect(
    d.getByRole('button', { name: 'Music OFF', exact: true }),
  ).toBeVisible()
  await d.getByRole('button', { name: 'Music OFF', exact: true }).click()
  await expect(
    d.getByRole('button', { name: 'Music ON', exact: true }),
  ).toBeVisible()
  assert.equal(
    await d.evaluate(
      () =>
        window.audioEvents.filter((event) => event.action === 'create').length,
    ),
    1,
  )
  await d.goto(`${base}/admin/weddings/1/preview`)
  const frame = d.frameLocator('.admin-preview-frame')
  await expect(frame.locator('.invitation-content')).toBeVisible()
  await frame.locator('.wedding-page').evaluate((element) => {
    window.previewRoot = element
  })
  await frame.getByRole('button', { name: 'Music OFF', exact: true }).click()
  await expect(
    frame.getByRole('button', { name: 'Music ON', exact: true }),
  ).toBeVisible()
  for (const [name, width] of [
    ['Mobile', 390],
    ['Tablet', 768],
    ['Desktop', 1440],
  ]) {
    await d.getByRole('button', { name, exact: true }).click()
    await expect
      .poll(() => frame.locator('body').evaluate(() => innerWidth))
      .toBe(width)
    await d.getByRole('button', { name: 'Event', exact: true }).click()
    await expect
      .poll(() =>
        frame
          .locator('#event')
          .evaluate((element) =>
            Math.abs(
              element.getBoundingClientRect().top -
                parseFloat(getComputedStyle(element).scrollMarginTop) -
                parseFloat(
                  getComputedStyle(document.documentElement).scrollPaddingTop,
                ),
            ),
          ),
      )
      .toBeLessThan(10)
    await expect(frame.locator('.opening-stage')).toHaveCount(0)
    assert(
      await frame
        .locator('.wedding-page')
        .evaluate((element) => element === window.previewRoot),
    )
    assert.equal(
      await frame
        .locator('body')
        .evaluate(
          () =>
            window.audioEvents.filter((event) => event.action === 'create')
              .length,
        ),
      1,
    )
    await expect(
      frame.getByRole('button', { name: 'Music ON', exact: true }),
    ).toBeVisible()
  }
  await d.getByRole('button', { name: 'Preview Cover', exact: true }).click()
  await expect(frame.locator('.opening-stage')).toBeVisible()
  await d.screenshot({ path: `${dir}/admin-responsive-preview.png` })
  journeyFixture = true
  const living = representatives.find((row) => row.personality === 'luxury')
  await d.goto(`${base}/w/visual-${living.key}`)
  await expect(d.locator('.opening-stage')).toBeVisible()
  await expect(d.locator('.auto-journey')).toHaveCount(0)
  await d
    .getByRole('button', { name: /^(Buka Undangan|Mulai Petualangan)$/ })
    .click()
  await expect(d.locator('.invitation-content')).toBeVisible()
  const journeyButton = d.locator('[data-journey-control] button')
  await expect(journeyButton).toBeVisible()
  const initialY = await d.evaluate(() => scrollY)
  await d.waitForTimeout(350)
  assert.equal(
    await d.evaluate(() => scrollY),
    initialY,
    'Auto Journey must be opt in',
  )
  await journeyButton.click()
  await expect(journeyButton).toHaveAttribute('aria-pressed', 'true')
  await expect
    .poll(() => d.evaluate(() => scrollY))
    .toBeGreaterThan(initialY + 3)
  await d.mouse.wheel(0, 30)
  await expect(journeyButton).toHaveAttribute('aria-pressed', 'false')
  await journeyButton.click()
  await expect(journeyButton).toHaveAttribute('aria-pressed', 'true')
  await d.getByRole('button', { name: 'Event', exact: true }).click()
  await expect(journeyButton).toHaveAttribute('aria-pressed', 'false')
  assert.equal(
    await d.evaluate(
      () =>
        window.audioEvents.filter((event) => event.action === 'create').length,
    ),
    1,
  )
  await expect(d.locator('.opening-stage')).toHaveCount(0)
  await desktop.close()
  const reducedJourney = await context({
    viewport: { width: 390, height: 820 },
    reducedMotion: 'reduce',
  })
  const reducedPage = await reducedJourney.newPage()
  await reducedPage.goto(`${base}/w/visual-${living.key}`)
  await reducedPage
    .getByRole('button', { name: /^(Buka Undangan|Mulai Petualangan)$/ })
    .click()
  await expect(reducedPage.locator('.invitation-content')).toBeVisible()
  await expect(reducedPage.locator('.auto-journey')).toHaveCount(0)
  await reducedJourney.close()
  journeyFixture = false
  const lite = await context({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  })
  await lite.addInitScript(() =>
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 2,
    }),
  )
  const low = await lite.newPage()
  await low.goto(`${base}/w/visual-rosalia-arch`)
  await expect(low.locator('.wedding-page')).toHaveAttribute(
    'data-visual-quality',
    'lite',
  )
  await expect(low.locator('.wedding-page')).toHaveAttribute(
    'data-depth-enabled',
    'false',
  )
  await expect(low.locator('.visual-ornament > span').first()).toHaveCSS(
    'animation-name',
    'none',
  )
  await lite.close()
  assert.deepEqual(errors, [])
  await writeFile(
    `${dir}/verification.json`,
    JSON.stringify(
      {
        templates: rows.length,
        mobileWidths: [360, 375, 390, 414, 430],
        personalities: representatives.map((row) => row.personality),
        pageErrors: errors,
      },
      null,
      2,
    ),
  )
  console.log(
    `PASS: all ${rows.length} mobile/desktop templates, five mobile widths, content/calendar/gift preservation, shared lightbox, navigation and music continuity, cinematic opening, opt-in Auto Journey with manual pause/resume, reduced motion and responsive admin preview.`,
  )
} catch (error) {
  console.error('Browser page errors:', errors)
  console.error('Recent API calls:', apiCalls.slice(-12))
  throw error
} finally {
  await browser.close()
  await new Promise((done) => server.close(done))
}
