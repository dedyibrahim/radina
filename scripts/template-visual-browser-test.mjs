import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'

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
const submissions = []
const base = 'http://127.0.0.1:5181'
let eventTypeFixture = 'wedding'
let journeyFixture = false
const kidsFixture = process.env.RADINA_KIDS_CINEMATIC === '1'
const mediaFixture = kidsFixture || process.env.RADINA_LIVING_GARDEN === '1'
const catalogCapture = process.env.RADINA_CAPTURE_EXCLUSIVE_ONLY === '1'
const catalogSources = catalogCapture
  ? await Promise.all(['additional-template-demos', 'floral-demos', 'template-studio', 'floral-collection'].map(async name => JSON.parse(await readFile(`config/${name}.json`, 'utf8'))))
  : []
const catalogDemos = Object.fromEntries((catalogSources[0] || []).concat(catalogSources[1] || []).map(demo => [demo.key, demo]))
const catalogDesigns = { ...catalogSources[2], ...catalogSources[3] }
function wedding(key, eventType = 'wedding') {
  const row = rows.find((row) => row.key === key)
  const data = {
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
      enable_video: mediaFixture,
      enable_livestream: mediaFixture,
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
    video_url: mediaFixture
      ? 'https://www.youtube.com/watch?v=abcdefghijk'
      : null,
    livestream_url: mediaFixture
      ? 'https://www.youtube.com/watch?v=abcdefghijk'
      : null,
    livestream: mediaFixture
      ? { url: 'https://www.youtube.com/watch?v=abcdefghijk' }
      : {},
    section_content: {},
    event_details: {
      host_name: 'Keluarga Ibrahim',
      honoree_name: 'Dedy',
      honoree_age: 7,
      description: 'Mari hadir dan merayakan momen istimewa bersama kami.',
      photo: '/images/demos/photo-1.webp',
    },
  }
  if (catalogCapture) {
    const demo = catalogDemos[key]
    const photoNumber = demo?.hero_photo || catalogDesigns[key]?.hero_photo || (rows.findIndex(row => row.key === key) % 30) + 1
    const photo = `/images/demos/photo-${photoNumber}.webp`
    data.cover_image = data.hero_image = photo
    data.bride.photo = photo
    if (demo) {
      data.title = `${demo.bride} & ${demo.groom}`
      data.bride.full_name = data.bride.nickname = demo.bride
      data.groom.full_name = data.groom.nickname = demo.groom
    }
  }
  if (kidsFixture) {
    Object.assign(data, {
      title: 'Ulang Tahun Naila Ibrahim',
      bride: null,
      groom: null,
      cover_image: '',
      hero_image: '',
      closing_image: '',
      opening_text:
        'Dengan penuh kebahagiaan, kami mengundang Bapak/Ibu beserta ananda untuk hadir dan merayakan ulang tahun putri kami. Kehadiran dan doa baik Anda akan melengkapi kebahagiaan keluarga kami.',
      closing_text: 'Terima kasih atas kehadiran dan doa baik untuk Naila.',
    })
    data.event_details.honoree_name = 'Naila Ibrahim'
    data.event_details.photo = ''
    data.events[0].title = 'Pesta Ulang Tahun'
    data.events[1].title = 'Bermain Bersama'
  }
  return data
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
      data = wedding(
        key,
        new URL(route.request().url()).searchParams.get('event_type') ||
          (key.startsWith('anak-') ? 'birthday' : 'wedding'),
      )
      data.is_demo = true
    } else if (path.endsWith('/rsvp') && route.request().method() === 'POST') {
      submissions.push(route.request().postDataJSON())
      data = { id: 1 }
    } else if (
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
async function fullBleed(cameras, viewportSelector, label) {
  const gaps = await cameras.evaluateAll(
    (nodes, viewportSelector) =>
      nodes.flatMap((camera) => {
        const viewport = camera
          .closest(viewportSelector)
          .getBoundingClientRect()
        const animation = camera.getAnimations()[0]
        const originalTime = animation?.currentTime
        const duration = animation?.effect.getTiming().duration || 1
        const errors = []
        for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
          if (animation) animation.currentTime = duration * progress
          const image = camera.getBoundingClientRect()
          if (
            image.left > viewport.left + 0.5 ||
            image.top > viewport.top + 0.5 ||
            image.right < viewport.right - 0.5 ||
            image.bottom < viewport.bottom - 0.5
          )
            errors.push({
              progress,
              image: image.toJSON(),
              viewport: viewport.toJSON(),
            })
        }
        if (animation) animation.currentTime = originalTime
        return errors
      }),
    viewportSelector,
  )
  assert.deepEqual(
    gaps,
    [],
    label + ': scenery must cover every edge throughout the camera motion',
  )
}
if (kidsFixture) {
  try {
    eventTypeFixture = 'birthday'
    const { testKidsCinematic } = await import('./kids-cinematic-browser.mjs')
    await testKidsCinematic({
      context,
      rows,
      base,
      dir,
      fits,
      fullBleed,
      errors,
      submissions,
      weddingFixture: wedding,
    })
  } finally {
    await browser.close()
    await new Promise((done) => server.close(done))
  }
  process.exit(0)
}
if (process.env.RADINA_CAPTURE_EXCLUSIVE_ONLY === '1') {
  try {
    const { captureExclusiveCovers } = await import('./exclusive-ornaments-browser.mjs')
    await captureExclusiveCovers({ context, rows, base, dir, fits, errors })
  } finally {
    await browser.close()
    await new Promise(done => server.close(done))
  }
  process.exit(0)
}
if (process.env.RADINA_EXCLUSIVE_DETAILS === '1') {
  try {
    const { testExclusiveOrnaments } = await import('./exclusive-ornaments-browser.mjs')
    await testExclusiveOrnaments({ context, rows, base, dir, fits, errors })
  } finally {
    await browser.close()
    await new Promise(done => server.close(done))
  }
  process.exit(0)
}
if (process.env.RADINA_ALL_IDENTITIES === '1') {
  try {
    const contexts = await Promise.all(
      Array.from({ length: 3 }, () =>
        context({
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
        }),
      ),
    )
    const signatures = new Set()
    let completed = 0
    await Promise.all(
      contexts.map(async (c, worker) => {
        const p = await c.newPage()
        for (const [index, row] of [...rows].reverse().entries()) {
          if (index % contexts.length !== worker) continue
          await p.goto(base + '/w/visual-' + row.key + '?to=Dedy%20Ibrahim', {
            waitUntil: 'domcontentloaded',
          })
          const root = p.locator('.wedding-page')
          await expect(root).toHaveAttribute(
            'data-depth-style',
            row.motionStyle,
          )
          await expect(root).toHaveAttribute('data-camera-path', row.cameraPath)
          await expect(root).toHaveAttribute('data-visual-quality', 'standard')
          await fits(p, row.key + ' cover')
          await expect(root).toHaveAttribute('data-art-direction', row.key)
          const coverOrnaments = p.locator('.opening-stage .signature-corner')
          if (row.nativeOrnaments) {
            await expect(coverOrnaments).toHaveCount(2)
            assert.deepEqual(await coverOrnaments.evaluateAll(nodes => nodes.map(node => node.dataset.ornament)), [row.ornaments, row.secondary])
            await expect(p.locator('.opening-stage .visual-atmosphere .visual-ornament')).toHaveCount(0)
            assert(await coverOrnaments.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).transform === 'none')), row.key + ' upright motifs')
          }
          if (process.env.RADINA_CAPTURE_EXCLUSIVE === '1' && !row.worldCategory) {
            await expect.poll(() => p.locator('.opening-stage img').evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth > 0))).toBe(true)
            await p.evaluate(() => document.fonts.ready)
            const coverPath = `${dir}/exclusive-${row.key}-cover.png`
            await p.locator('.opening-stage').screenshot({ path: coverPath })
            execFileSync('php', ['scripts/convert-demo-image.php', coverPath, `frontend/public/images/templates/previews/${row.key}.webp`])
          }
          if (row.key === 'elegant-luxury')
            await expect(p.locator('.cover-noir > .cover-photo')).toHaveCSS(
              'inset',
              '0px',
            )
          await fullBleed(
            p.locator('.opening-stage .cinematic-scene__camera'),
            '.cinematic-scene',
            row.key + ' opening',
          )
          await fullBleed(
            p.locator(
              '.opening-stage .design-cover:not(.cover-noir) > .cover-photo',
            ),
            '.design-cover',
            row.key + ' cover photograph',
          )
          if (row.key === 'javanese-royal-garden')
            await p
              .getByRole('button', { name: 'Lewati animasi', exact: true })
              .click()
          await p
            .getByRole('button', {
              name: /^(Buka Undangan|Mulai Petualangan)$/,
            })
            .click()
          await expect(p.locator('.opening-stage')).toHaveCount(0)
          await expect(p.locator('#couple')).toContainText(
            'Alya Putri Ramadhani',
          )
          await expect(p.locator('.section-monogram')).toHaveCount(0)
          if (row.nativeOrnaments) {
            await expect(p.locator('[data-section="couple"] .signature-corner')).toHaveCount(1)
            await expect(p.locator('[data-section="couple"] .visual-atmosphere .visual-ornament')).toHaveCount(0)
          }
          await fits(p, row.key + ' content')
          const home = p.locator('.section-frame[data-section="home"]')
          await home.evaluate((el) =>
            el.scrollIntoView({ behavior: 'instant', block: 'center' }),
          )
          await expect(home).toHaveAttribute('data-ambient-running', 'true')
          await fullBleed(
            home.locator('.cinematic-scene__camera'),
            '.cinematic-scene',
            row.key + ' home',
          )
          await fullBleed(
            home.locator('.design-hero:not(.hero-dark) > .hero-full-photo'),
            '.design-hero',
            row.key + ' hero photograph',
          )
          const before = await p.evaluate(
            () =>
              window.audioEvents.filter((e) => e.action === 'create').length,
          )
          await p.getByRole('button', { name: 'Gallery', exact: true }).click()
          const photo = p
            .locator('#gallery button[aria-label^="Perbesar foto"]')
            .first()
          await expect(photo).toBeVisible()
          await photo.click()
          await expect(p.getByRole('dialog')).toBeVisible()
          await p.keyboard.press('Escape')
          await expect(p.getByRole('dialog')).toHaveCount(0)
          await expect(p.locator('#rsvp-name')).toHaveValue('Dedy Ibrahim')
          await p
            .locator('#rsvp')
            .evaluate((el) =>
              el.scrollIntoView({ behavior: 'instant', block: 'center' }),
            )
          await fits(p, row.key + ' RSVP')
          assert.equal(
            await p.evaluate(
              () =>
                window.audioEvents.filter((e) => e.action === 'create').length,
            ),
            before,
            'One player across scene navigation',
          )
          signatures.add(
            `${row.ornaments}/${row.secondary}/${row.motionStyle}/${row.cameraDuration}`,
          )
          if (++completed % 15 === 0)
            console.log(`PASS identity templates ${completed}/${rows.length}`)
        }
        await c.close()
      }),
    )
    assert(signatures.size > 50, 'Keep different template identities')
    console.log(`PASS all ${rows.length} identities on mobile`)
    const desktop = await context({ viewport: { width: 1440, height: 900 } })
    const page = await desktop.newPage()
    const representatives = [
      ...new Map(rows.map((row) => [row.personality, row])).values(),
    ]
    for (const row of representatives) {
      await page.goto(base + '/w/visual-' + row.key)
      await expect(page.locator('.wedding-page')).toHaveAttribute(
        'data-visual-quality',
        'high',
      )
      const motionSelector =
        row.key === 'midnight-romance'
          ? '.midnight-scene .midnight-rose'
          : row.component.includes('KidsCinematic')
            ? '.kids-scene .kids-actor'
            : row.nativeOrnaments
              ? '.floral-corners .signature-motion'
            : '.visual-atmosphere .visual-ornament > span'
      const ornament = page.locator('.opening-stage ' + motionSelector).first()
      await expect(ornament).toHaveCSS('animation-play-state', 'running')
      const transform = await ornament.evaluate(
        (el) => getComputedStyle(el).transform,
      )
      await page.waitForTimeout(220)
      assert.notEqual(
        await ornament.evaluate((el) => getComputedStyle(el).transform),
        transform,
        row.key + ' ornaments must move',
      )
      assert(
        await ornament.evaluate(
          (el) => !new DOMMatrix(getComputedStyle(el).transform).is2D,
        ),
        row.key + ' ornament must have perspective',
      )
      await fullBleed(
        page.locator('.opening-stage .cinematic-scene__camera'),
        '.cinematic-scene',
        row.key + ' desktop',
      )
      if (row.key === 'midnight-romance')
        await fullBleed(
          page.locator('.opening-stage .midnight-camera'),
          '.midnight-scene__viewport',
          row.key + ' bespoke desktop scenery',
        )
      await page.screenshot({
        path: dir + '/identity-' + row.personality + '-desktop.png',
        animations: 'allow',
      })
      await page
        .getByRole('button', { name: /^(Buka Undangan|Mulai Petualangan)$/ })
        .click()
      await expect(page.locator('.opening-stage')).toHaveCount(0)
      await page
        .locator('#couple')
        .evaluate((el) =>
          el.scrollIntoView({ behavior: 'instant', block: 'start' }),
        )
      await fits(page, row.key + ' desktop')
      await page
        .getByRole('button', { name: 'Matikan animasi', exact: true })
        .click()
      await expect(page.locator('.wedding-page')).toHaveClass(/motion-off/)
      await expect(page.locator(motionSelector).first()).toHaveCSS(
        'animation-play-state',
        'paused',
      )
      await page
        .getByRole('button', { name: 'Aktifkan animasi', exact: true })
        .click()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await expect(page.locator('.wedding-page')).toHaveAttribute(
        'data-depth-enabled',
        'false',
      )
      assert(
        await page
          .locator(motionSelector)
          .evaluateAll((nodes) =>
            nodes.every((node) =>
              node
                .getAnimations()
                .every((animation) => animation.playState !== 'running'),
            ),
          ),
      )
      await page.emulateMedia({ reducedMotion: 'no-preference' })
    }
    await desktop.close()
    assert.deepEqual(errors, [])
    console.log(
      `PASS all ${rows.length} identities: mobile, personalized RSVP, gallery, audio continuity, full bleed; ${representatives.length} design families desktop, actual 3D movement, pause and reduced motion`,
    )
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
if (process.env.RADINA_MIDNIGHT === '1') {
  try {
    const c = await context({ viewport: { width: 390, height: 844 } })
    const p = await c.newPage()
    await p.goto(base + '/w/visual-midnight-romance?to=Dedy%20Ibrahim')
    await expect(p.locator('.midnight-cover')).toContainText('Dedy Ibrahim')
    const cover = p.locator('.midnight-cover .midnight-scene')
    await expect(cover).toHaveAttribute('data-active', 'true')
    await expect(p.locator('.scene-motion')).toHaveAttribute('data-frames', '0')
    await expect
      .poll(() =>
        cover
          .locator('.midnight-camera')
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true)
    assert.equal(
      await p.evaluate(() =>
        window.audioEvents.some((e) => e.action === 'play'),
      ),
      false,
    )
    for (const width of [320, 390, 768, 1440]) {
      await p.setViewportSize({ width, height: 844 })
      await fits(p, 'Midnight cover ' + width)
      await p.screenshot({
        path: `${dir}/midnight-living-${width}-cover.png`,
        animations: 'allow',
      })
    }
    await p.setViewportSize({ width: 390, height: 844 })
    await p.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(p.locator('.opening-stage')).toHaveCount(0)
    await expect
      .poll(() =>
        p.evaluate(() => window.audioEvents.some((e) => e.action === 'play')),
      )
      .toBe(true)
    const sections = await p
      .locator('.section-frame')
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.section))
    assert.equal(sections.length, 12)
    for (const width of [320, 390, 768, 1440]) {
      await p.setViewportSize({ width, height: 844 })
      for (const section of sections) {
        const frame = p.locator(`.section-frame[data-section="${section}"]`)
        const scene = frame.locator('.midnight-scene')
        await scene
          .locator('.midnight-scene__viewport')
          .evaluate((el) =>
            el.scrollIntoView({ behavior: 'instant', block: 'center' }),
          )
        await expect(scene).toHaveAttribute('data-active', 'true')
        await expect
          .poll(() =>
            scene
              .locator('.midnight-camera')
              .evaluate((img) => img.complete && img.naturalWidth > 0),
          )
          .toBe(true)
        await fits(p, `Midnight ${width} ${section}`)
        await fullBleed(
          scene.locator('.midnight-camera'),
          '.midnight-scene__viewport',
          `Midnight ${width}/${section}`,
        )
        if (width === 390) {
          const read = (el) =>
            [
              '.midnight-camera',
              '.midnight-rose',
              '.midnight-mist',
              '.midnight-water i',
              '.midnight-firefly',
              '.midnight-candle i',
            ].map(
              (selector) =>
                getComputedStyle(el.querySelector(selector)).transform,
            )
          const before = await scene.evaluate(read)
          await p.waitForTimeout(300)
          const after = await scene.evaluate(read)
          after.forEach((value, i) =>
            assert.notEqual(value, before[i], section + ' moving layer ' + i),
          )
          assert(
            await scene.locator('.midnight-rose').evaluateAll((nodes) =>
              nodes.every((node) => {
                const style = getComputedStyle(node)
                const matrix = new DOMMatrix(
                  getComputedStyle(node.querySelector('img')).transform,
                )
                return (
                  style.rotate === 'none' &&
                  matrix.d > 0 &&
                  node.getBoundingClientRect().bottom >
                    node.parentElement.getBoundingClientRect().bottom + 30
                )
              }),
            ),
            'Upright roses must have their stem below the frame',
          )
          if (
            ['home', 'couple', 'gallery', 'rsvp', 'closing'].includes(section)
          ) {
            await frame
              .locator('[data-reveal]')
              .evaluateAll((nodes) =>
                Promise.all(
                  nodes.map((node) =>
                    Promise.all(
                      node
                        .getAnimations()
                        .map((animation) => animation.finished.catch(() => {})),
                    ),
                  ),
                ),
              )
            await p.screenshot({
              path: `${dir}/midnight-living-${section}-390.png`,
              animations: 'allow',
            })
          }
        }
      }
    }
    await p.setViewportSize({ width: 390, height: 844 })
    await expect(p.locator('#couple')).toContainText('Alya Putri Ramadhani')
    await expect(p.locator('#couple')).toContainText('Bapak Ahmad')
    await p.locator('.gallery-item').first().click()
    await expect(p.locator('.lightbox')).toBeVisible()
    await p.keyboard.press('Escape')
    await expect(p.locator('.lightbox')).toHaveCount(0)
    await expect(p.locator('#rsvp-name')).toHaveValue('Dedy Ibrahim')
    await p.locator('input[name="attendance"][value="Hadir"]').check()
    await p.locator('#rsvp-message').fill('Selamat dan semoga bahagia.')
    await p
      .getByRole('button', { name: 'Kirim Konfirmasi', exact: true })
      .click()
    await expect(p.locator('.form-success')).toContainText('Terkirim!')
    assert.equal(submissions[0].message, 'Selamat dan semoga bahagia.')
    const closing = p.locator('[data-section="closing"] .midnight-scene')
    await closing
      .locator('.midnight-scene__viewport')
      .evaluate((el) =>
        el.scrollIntoView({ behavior: 'instant', block: 'center' }),
      )
    await expect(closing).toHaveAttribute('data-active', 'true')
    await expect(
      p.locator('[data-section="home"] .midnight-scene'),
    ).toHaveAttribute('data-active', 'false')
    await p
      .getByRole('button', { name: 'Matikan animasi', exact: true })
      .click()
    await closing
      .locator('.midnight-scene__viewport')
      .evaluate((el) =>
        el.scrollIntoView({ behavior: 'instant', block: 'center' }),
      )
    await expect(closing).toHaveAttribute('data-active', 'false')
    await expect(closing.locator('.midnight-camera')).toHaveCSS(
      'animation-play-state',
      'paused',
    )
    await p
      .getByRole('button', { name: 'Aktifkan animasi', exact: true })
      .click()
    await closing
      .locator('.midnight-scene__viewport')
      .evaluate((el) =>
        el.scrollIntoView({ behavior: 'instant', block: 'center' }),
      )
    await expect(closing).toHaveAttribute('data-active', 'true')
    await p.emulateMedia({ reducedMotion: 'reduce' })
    await expect(closing).toHaveAttribute('data-active', 'false')
    assert(
      await p
        .locator('.midnight-scene')
        .evaluateAll((nodes) =>
          nodes.every((node) =>
            node
              .getAnimations({ subtree: true })
              .every((a) => a.playState !== 'running'),
          ),
        ),
    )
    assert.equal(
      await p.evaluate(
        () => window.audioEvents.filter((e) => e.action === 'create').length,
      ),
      1,
    )
    await c.close()
    const slow = await context({ viewport: { width: 320, height: 844 } })
    await slow.addInitScript(() =>
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }),
    )
    const mobile = await slow.newPage()
    await mobile.goto(base + '/w/visual-midnight-romance')
    await expect(mobile.locator('.midnight-scene')).toHaveAttribute(
      'data-lite',
      'true',
    )
    await expect(mobile.locator('.midnight-firefly')).toHaveCount(4)
    await expect(mobile.locator('.midnight-scene')).toHaveAttribute(
      'data-active',
      'true',
    )
    await fits(mobile, 'Midnight lite')
    await slow.close()
    const preview = await context({ viewport: { width: 1280, height: 900 } })
    const page = await preview.newPage()
    await page.goto(base + '/templates/midnight-romance/preview')
    const iframe = page.frameLocator('.admin-preview-frame')
    await expect(iframe.locator('.midnight-cover')).toBeVisible()
    await iframe
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(iframe.locator('#home')).toBeVisible()
    await preview.close()
    assert.deepEqual(errors, [])
    console.log(
      'PASS Midnight: 12 sections across four widths; six layers move; upright flowers; RSVP/gallery; lite, reduced and manual motion; preview and one audio player',
    )
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
if (process.env.RADINA_ROYAL_OPENING === '1') {
  try {
    const c = await context({ viewport: { width: 390, height: 844 } })
    const p = await c.newPage()
    await p.goto(base + '/w/visual-javanese-royal-garden?to=Dedy%20Ibrahim')
    const opening = p.locator('.royal-opening')
    await expect(opening).toHaveAttribute('data-reveal', 'ENVIRONMENT')
    await expect(opening).toHaveAttribute('data-reveal', 'TITLE', {
      timeout: 4500,
    })
    await expect(opening).toHaveAttribute('data-reveal', 'NAMES')
    await expect(opening).toHaveAttribute('data-reveal', 'DATE')
    await expect(opening).toHaveAttribute('data-reveal', 'READY')
    assert.equal(
      await p.evaluate(() =>
        window.audioEvents.some((e) => e.action === 'play'),
      ),
      false,
    )
    await expect(opening).toContainText('Dedy Ibrahim')
    await expect
      .poll(() =>
        opening
          .locator('.royal-scene__camera')
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true)
    await fits(p, 'Royal Garden opening')
    await p.screenshot({ path: dir + '/javanese-royal-garden-opening-390.png' })
    await p.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(p.locator('.opening-stage')).toHaveCount(0)
    await expect
      .poll(() =>
        p.evaluate(() => window.audioEvents.some((e) => e.action === 'play')),
      )
      .toBe(true)
    assert.deepEqual(errors, [])
    await c.close()
    console.log(
      'PASS: Royal Garden six-second opening, guest, responsive scene and gesture-triggered music',
    )
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
if (process.env.RADINA_ROYAL_GARDEN === '1') {
  try {
    const c = await context({ viewport: { width: 390, height: 844 } })
    await c.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (value) => {
            window.copiedGift = value
          },
        },
      })
    })
    const p = await c.newPage()
    await p.goto(base + '/w/visual-javanese-royal-garden?to=Dedy%20Ibrahim')
    await p.getByRole('button', { name: 'Lewati animasi', exact: true }).click()
    await expect(p.locator('.royal-opening')).toContainText('Dedy Ibrahim')
    await p.waitForTimeout(850)
    for (const width of [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440]) {
      await p.setViewportSize({ width, height: 844 })
      await fits(p, `Royal Garden opening ${width}`)
      if ([320, 390, 1440].includes(width)) {
        await p.screenshot({
          path: `${dir}/royal-garden-${width}-opening.png`,
          animations: 'allow',
        })
      }
    }
    await p.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(p.locator('.opening-stage')).toHaveCount(0)
    await p.locator('.wedding-page').evaluate((root) => {
      window.royalRoot = root
    })
    const allocation = await p.evaluate(() => window.audioEvents.length)
    for (const name of ['Couple', 'Event', 'Gallery', 'Gift', 'Home']) {
      await p.getByRole('button', { name, exact: true }).click()
      await expect(p.locator('.opening-stage')).toHaveCount(0)
      assert.equal(
        await p.evaluate(() => window.audioEvents.length),
        allocation,
      )
      assert(
        await p
          .locator('.wedding-page')
          .evaluate((root) => root === window.royalRoot),
      )
    }
    const sections = [
      'home',
      'couple',
      'story',
      'event',
      'location',
      'gallery',
      'gift',
      'rsvp',
      'wishes',
      'quote',
      'closing',
    ]
    await expect(p.locator('.royal-slide')).toHaveCount(8)
    await expect(p.locator('.royal-scene')).toHaveCount(16)
    const environments = await p
      .locator('.royal-scene')
      .evaluateAll((nodes) => [
        ...new Set(nodes.map((node) => node.dataset.environment)),
      ])
    assert.equal(
      environments.length,
      3,
      'Published chapters include walkway, pendopo and sunset; opening has the fourth entrance plate',
    )
    await expect(p.locator('.garden-branch')).toHaveCount(0)
    await expect(p.locator('.section-monogram')).toBeHidden()
    assert(
      await p
        .locator('#couple')
        .evaluate(
          (section) =>
            Math.abs(
              section.getBoundingClientRect().top -
                section.querySelector('.royal-slide').getBoundingClientRect()
                  .top,
            ) < 1,
        ),
      'No empty monogram block before the bride chapter',
    )
    for (const width of [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440]) {
      await p.setViewportSize({ width, height: 844 })
      for (const section of sections) {
        const node = p.locator('#' + section)
        await node.scrollIntoViewIfNeeded()
        await fits(p, `Royal Garden ${width}/${section}`)
        await fullBleed(
          node.locator('.royal-scene__camera'),
          '.royal-scene__environment',
          `Royal ${width}/${section}`,
        )
        if (
          [320, 390, 1440].includes(width) &&
          ['couple', 'story', 'event', 'gallery', 'rsvp', 'closing'].includes(
            section,
          )
        ) {
          await node.evaluate((el) =>
            el.scrollIntoView({ block: 'start', behavior: 'instant' }),
          )
          await p.waitForTimeout(800)
          await p.screenshot({
            path: `${dir}/royal-garden-${width}-${section}.png`,
            animations: 'allow',
          })
        }
      }
      for (const slide of await p.locator('.royal-slide').all()) {
        await slide.scrollIntoViewIfNeeded()
        const key = await slide.getAttribute('data-royal-slide')
        await fits(p, `Royal chapter ${width}/${key}`)
        await fullBleed(
          slide.locator('.royal-scene__camera'),
          '.royal-scene__environment',
          `Royal chapter ${width}/${key}`,
        )
        if (width === 390) {
          await slide.evaluate((el) =>
            el.scrollIntoView({ block: 'start', behavior: 'instant' }),
          )
          await p.waitForTimeout(800)
          await p.screenshot({
            path: `${dir}/royal-chapter-${key}-390.png`,
            animations: 'allow',
          })
        }
      }
    }
    assert(
      await p.locator('.royal-branch').evaluateAll((branches) =>
        branches.every((branch) => {
          const style = getComputedStyle(branch)
          const image = branch.querySelector('img')
          const matrix = new DOMMatrix(getComputedStyle(image).transform)
          const environment = branch
            .closest('.royal-scene__environment')
            .getBoundingClientRect()
          return (
            style.rotate === 'none' &&
            style.scale === 'none' &&
            matrix.d > 0 &&
            branch.getBoundingClientRect().bottom > environment.bottom + 15
          )
        }),
      ),
      'Branches must grow upright from outside the bottom edge, without exposed floating stems',
    )
    await expect(p.locator('#couple')).toContainText('Bapak Ahmad')
    await p.setViewportSize({ width: 1440, height: 844 })
    const depthSlide = p.locator('[data-royal-slide="bride"]')
    await depthSlide.evaluate((el) =>
      el.scrollIntoView({ block: 'center', behavior: 'instant' }),
    )
    const surface = await depthSlide.boundingBox()
    await p.mouse.move(surface.x + surface.width * 0.8, 420)
    const depthCamera = depthSlide.locator('.royal-scene__camera')
    await expect
      .poll(() =>
        depthCamera.evaluate((el) => el.style.getPropertyValue('--pointer-x')),
      )
      .not.toBe('')
    assert(
      await depthCamera.evaluate(
        (el) => !new DOMMatrix(getComputedStyle(el).transform).is2D,
      ),
      'Royal camera must render perspective depth',
    )
    assert(
      await depthSlide
        .locator('.royal-branch')
        .first()
        .evaluate((el) => !new DOMMatrix(getComputedStyle(el).transform).is2D),
      'Foreground flowers must move on a separate depth plane',
    )
    await p.setViewportSize({ width: 390, height: 844 })
    await expect(p.locator('#couple')).toContainText('Rizky Pratama')
    await expect(p.locator('#story')).toContainText('Pertemuan')
    await expect(p.locator('.royal-countdown')).toHaveAttribute(
      'data-countdown-event',
      '9',
    )
    await expect(p.locator('#event')).toContainText('WITA')
    await expect(p.locator('#event')).toContainText('Jalan Mawar 2')
    const downloadPromise = p.waitForEvent('download')
    await p
      .getByRole('button', {
        name: 'Tambahkan Resepsi ke kalender',
        exact: true,
      })
      .click()
    const download = await downloadPromise
    const calendar = await readFile(await download.path(), 'utf8')
    assert(calendar.includes('DTSTART:20261213T060000Z'))
    assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 1)
    await p.locator('#gallery .gallery-item').first().click()
    await expect(p.locator('.lightbox-controls')).toContainText('1 / 6')
    await p
      .getByRole('button', { name: 'Foto berikutnya', exact: true })
      .click()
    await expect(p.locator('.lightbox-controls')).toContainText('2 / 6')
    await p.keyboard.press('ArrowRight')
    await expect(p.locator('.lightbox-controls')).toContainText('3 / 6')
    await p.locator('.lightbox').dispatchEvent('touchstart', {
      touches: [{ identifier: 1, clientX: 230 }],
    })
    await p.locator('.lightbox').dispatchEvent('touchend', {
      changedTouches: [{ identifier: 1, clientX: 80 }],
    })
    await expect(p.locator('.lightbox-controls')).toContainText('4 / 6')
    await p.keyboard.press('Escape')
    await expect(p.locator('.lightbox')).toHaveCount(0)
    await p
      .locator('#gift')
      .getByRole('button', { name: /Salin/ })
      .first()
      .click()
    assert.equal(await p.evaluate(() => window.copiedGift), '8721354342')
    await expect(p.locator('#rsvp-name')).toHaveValue('Dedy Ibrahim')
    await p.locator('input[name="attendance"][value="Hadir"]').check()
    await p
      .getByRole('button', { name: 'Tambah jumlah tamu', exact: true })
      .click()
    await p
      .locator('#rsvp-message')
      .fill('Semoga menjadi keluarga yang bahagia.')
    await p
      .getByRole('button', { name: 'Kirim Konfirmasi', exact: true })
      .click()
    await expect(p.locator('.form-success')).toContainText('Terkirim!')
    assert.equal(submissions.length, 1)
    assert.equal(submissions[0].name, 'Dedy Ibrahim')
    assert.equal(submissions[0].guests, 2)
    assert.equal(submissions[0].attendance, 'Hadir')
    assert.equal(
      submissions[0].message,
      'Semoga menjadi keluarga yang bahagia.',
    )
    await p
      .locator('#closing')
      .evaluate((el) =>
        el.scrollIntoView({ behavior: 'instant', block: 'start' }),
      )
    const scene = p.locator('[data-section="closing"] > .royal-scene')
    await expect(scene).toHaveAttribute('data-active', 'true')
    const camera = scene.locator('.royal-scene__camera')
    const before = await camera.evaluate((el) => getComputedStyle(el).transform)
    await p.waitForTimeout(500)
    assert.notEqual(
      await camera.evaluate((el) => getComputedStyle(el).transform),
      before,
    )
    await p.emulateMedia({ reducedMotion: 'reduce' })
    await expect(scene).toHaveAttribute('data-active', 'false')
    await expect(camera).toHaveCSS('animation-name', 'none')
    assert(
      await p
        .locator('.royal-scene__camera')
        .evaluateAll((nodes) =>
          nodes.every(
            (node) => getComputedStyle(node).animationName === 'none',
          ),
        ),
    )
    assert(
      await p
        .locator('.royal-atmosphere')
        .evaluateAll((nodes) =>
          nodes.every((node) =>
            node
              .getAnimations({ subtree: true })
              .every((animation) => animation.playState !== 'running'),
          ),
        ),
    )
    await p.goto(
      base + '/templates/javanese-royal-garden/preview?to=Dedy%20Ibrahim',
    )
    const frame = p.frameLocator('.admin-preview-frame')
    await expect(frame.locator('.royal-opening')).toContainText('Dedy Ibrahim')
    await frame
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(frame.locator('.royal-events')).toBeVisible()
    await p.getByRole('button', { name: 'Preview Cover', exact: true }).click()
    await expect(frame.locator('.royal-opening')).toContainText('Dedy Ibrahim')
    await frame
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(frame.locator('.opening-stage')).toHaveCount(0)
    await p.emulateMedia({ reducedMotion: 'no-preference' })
    await p.addInitScript(() =>
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }),
    )
    await p.goto(
      base +
        '/templates/javanese-royal-garden/preview?event_type=office&preview_embed=1',
    )
    await p.getByRole('button', { name: 'Lewati animasi', exact: true }).click()
    await expect(p.locator('.royal-atmosphere')).toHaveAttribute(
      'data-lite',
      'true',
    )
    await expect(p.locator('.royal-petal')).toHaveCount(5)
    await p.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(p.locator('.celebration-host')).toContainText(
      'Keluarga Ibrahim',
    )
    await expect(
      p.locator('[data-section="couple"] > .royal-scene'),
    ).toBeVisible()
    for (const key of ['jawa-pendopo-pagi', 'romantic-floral']) {
      await p.goto(base + '/w/visual-' + key)
      await expect(p.locator('.opening-stage')).toBeVisible()
      await expect(p.locator('.royal-scene')).toHaveCount(0)
      await p
        .getByRole('button', { name: 'Buka Undangan', exact: true })
        .click()
      await expect(p.locator('.invitation-content')).toBeVisible()
    }
    assert.deepEqual(errors, [])
    await c.close()
    console.log(
      'PASS: Royal Garden ten widths, CMS content/countdown/event calendar, music and root continuity, gallery keyboard/swipe, gift copy, guest RSVP/wish submission, moving scenery, reduced motion and shared preview.',
    )
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
if (process.env.RADINA_LIVING_GARDEN === '1') {
  try {
    for (const profile of [
      'desktop',
      'mobile-lite',
      'mobile-narrow',
      'reduced',
    ]) {
      const c = await context({
        viewport: {
          width:
            profile === 'desktop'
              ? 1440
              : profile === 'mobile-narrow'
                ? 320
                : 390,
          height: 844,
        },
        reducedMotion: profile === 'reduced' ? 'reduce' : 'no-preference',
      })
      if (profile.startsWith('mobile-'))
        await c.addInitScript(() => {
          Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => 2,
          })
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 })
        })
      const p = await c.newPage()
      await p.goto(base + '/w/visual-melati-senja-cinematic?to=Dedy%20Ibrahim')
      await expect(p.locator('.cinematic-opening')).toHaveAttribute(
        'data-reveal',
        'READY',
      )
      await expect
        .poll(() =>
          p
            .locator('.cinematic-opening .garden-branch img')
            .first()
            .evaluate((img) => img.complete && img.naturalWidth > 0),
        )
        .toBe(true)
      const quiet = profile === 'reduced'
      await expect(
        p.locator('.cinematic-opening .living-garden'),
      ).toHaveAttribute('data-active', String(!quiet))
      await p.screenshot({
        path: dir + '/melati-senja-' + profile + '-opening.png',
        animations: 'allow',
      })
      await p
        .getByRole('button', { name: 'Buka Undangan', exact: true })
        .click()
      await expect(p.locator('.opening-stage')).toHaveCount(0)
      const frames = p.locator('.section-frame')
      const sections = await frames.evaluateAll((frames) =>
        frames.map((frame) => frame.dataset.section),
      )
      assert.equal(
        sections.length,
        14,
        'All fourteen configured CMS sections must render',
      )
      for (const section of sections) {
        const frame = p.locator(`.section-frame[data-section="${section}"]`)
        await frame.evaluate((el) =>
          el.scrollIntoView({ behavior: 'instant', block: 'center' }),
        )
        const layers = frame.locator(
          ".living-garden[data-garden-plane='foreground']",
        )
        await expect(layers).toHaveAttribute('data-active', String(!quiet))
        assert.equal(
          await frame
            .locator('.cinematic-scene')
            .evaluate((el) => getComputedStyle(el).opacity),
          '1',
          section + ' scenery must stay visible',
        )
        const branch = layers.locator('.garden-branch').first()
        assert(
          await layers.locator('.garden-branch').evaluateAll((nodes) =>
            nodes.every((node) => {
              const style = getComputedStyle(node)
              const image = new DOMMatrix(
                getComputedStyle(node.querySelector('img')).transform,
              )
              return (
                style.rotate === 'none' &&
                style.scale === 'none' &&
                image.d > 0 &&
                node.getBoundingClientRect().bottom >
                  node.parentElement.getBoundingClientRect().bottom + 25
              )
            }),
          ),
          section + ' branches must grow upright from below the frame',
        )
        const before = await branch.evaluate(
          (el) => getComputedStyle(el).transform,
        )
        const atmosphere = frame.locator('.visual-atmosphere')
        const readScenery = (el) =>
          ['.cinematic-scene__plate', '.garden-mist--far'].map(
            (selector) =>
              getComputedStyle(el.querySelector(selector)).transform,
          )
        const sceneryBefore = await atmosphere.evaluate(readScenery)
        await p.waitForTimeout(220)
        const after = await branch.evaluate(
          (el) => getComputedStyle(el).transform,
        )
        if (quiet)
          assert.equal(after, before, section + ' must respect reduced motion')
        else
          assert.notEqual(
            after,
            before,
            section + ' foliage must actually move',
          )
        const sceneryAfter = await atmosphere.evaluate(readScenery)
        if (quiet)
          assert.deepEqual(
            sceneryAfter,
            sceneryBefore,
            section + ' scenery must stay quiet',
          )
        else
          sceneryAfter.forEach((value, i) =>
            assert.notEqual(
              value,
              sceneryBefore[i],
              section + ' camera/mist must move',
            ),
          )
        await fits(p, profile + ' ' + section)
        if (['home', 'event', 'gallery', 'rsvp'].includes(section))
          await frame.screenshot({
            path: dir + '/melati-senja-' + profile + '-' + section + '.png',
            animations: 'allow',
          })
      }
      if (!quiet) {
        await expect(
          frames
            .first()
            .locator(".living-garden[data-garden-plane='foreground']"),
        ).toHaveAttribute('data-active', 'false')
        const last = frames
          .last()
          .locator(".living-garden[data-garden-plane='foreground']")
        await p
          .getByRole('button', { name: 'Matikan animasi', exact: true })
          .click()
        await frames.last().scrollIntoViewIfNeeded()
        await expect(last).toHaveAttribute('data-active', 'false')
        const branch = last.locator('.garden-branch').first()
        await expect
          .poll(() =>
            branch.evaluate((el) => getComputedStyle(el).animationPlayState),
          )
          .toBe('paused')
        await p.waitForTimeout(80)
        const frozen = await branch.evaluate(
          (el) => getComputedStyle(el).transform,
        )
        await p.waitForTimeout(250)
        assert.equal(
          await branch.evaluate((el) => getComputedStyle(el).transform),
          frozen,
        )
        await p
          .getByRole('button', { name: 'Aktifkan animasi', exact: true })
          .click()
        await frames.last().scrollIntoViewIfNeeded()
        await expect(last).toHaveAttribute('data-active', 'true')
      }
      assert.equal(
        await p.evaluate(
          () => window.audioEvents.filter((e) => e.action === 'create').length,
        ),
        1,
        'Scene changes must retain one music player',
      )
      console.log(
        'PASS living nature: ' +
          profile +
          ', 14 CMS sections, actual movement, visibility and motion controls',
      )
      await c.close()
    }
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
if (process.env.RADINA_CINEMATIC_PREVIEW === '1') {
  try {
    const c = await context({ viewport: { width: 1280, height: 900 } })
    const p = await c.newPage()
    for (const key of ['jawa-pendopo-pagi', 'sunda-kabut-pegunungan']) {
      await p.goto(`${base}/templates/${key}/preview?to=Dedy%20Ibrahim`)
      const frame = p.frameLocator('.admin-preview-frame')
      await expect(frame.locator('.cinematic-opening')).toHaveAttribute(
        'data-reveal',
        'READY',
      )
      await expect(frame.locator('.cinematic-opening')).toContainText(
        'Dedy Ibrahim',
      )
      if (key.startsWith('anak-'))
        await expect(frame.locator('.cinematic-opening')).toContainText(
          'Merayakan usia ke-7',
        )
      await p.getByRole('button', { name: 'Mobile', exact: true }).click()
      await expect(p.locator('.wedding-preview-canvas')).toHaveClass(
        /preview-device-mobile/,
      )
      await p.getByRole('button', { name: 'Animasi ON', exact: true }).click()
      await expect(frame.locator('.wedding-page')).toHaveClass(/motion-off/)
      await frame
        .getByRole('button', { name: /^(Buka Undangan|Mulai Petualangan)$/ })
        .click()
      await expect(frame.locator('.opening-stage')).toHaveCount(0)
      await frame
        .getByRole('button', { name: 'Detail playlist', exact: true })
        .click()
      const volume = frame.getByRole('slider', {
        name: 'Volume musik',
        exact: true,
      })
      await volume.evaluate((input) => {
        input.value = '25'
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
      await expect(frame.locator('.playlist-volume')).toContainText('25%')
      const inner = p.frames().find((f) => f !== p.mainFrame())
      await inner.evaluate(() => {
        window.audioInstance.currentTime = 42
      })
      await frame
        .getByRole('button', { name: 'Bisukan suara', exact: true })
        .click()
      assert.equal(await inner.evaluate(() => window.audioInstance.muted), true)
      assert.equal(
        await inner.evaluate(() => window.audioInstance.volume),
        0.25,
      )
      await frame
        .getByRole('button', { name: 'Aktifkan suara', exact: true })
        .click()
      for (const id of ['gallery', 'gift', 'rsvp']) {
        await frame.locator('#' + id).scrollIntoViewIfNeeded()
        await expect(frame.locator('.opening-stage')).toHaveCount(0)
      }
      assert.equal(
        await inner.evaluate(() => window.audioInstance.currentTime),
        42,
      )
      assert.equal(
        await inner.evaluate(
          () => window.audioEvents.filter((e) => e.action === 'create').length,
        ),
        1,
      )
      await p
        .getByRole('button', { name: 'Preview Cover', exact: true })
        .click()
      await expect(frame.locator('.opening-stage')).toBeVisible()
      await p.screenshot({ path: `${dir}/${key}-public-preview.png` })
      console.log('Preview, replay, volume and navigation passed:', key)
      // Each new page begins with the default toolbar preference.
      await p.reload()
    }
    await c.close()
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
    server.close()
  }
  process.exit(0)
}
if (process.env.RADINA_VISUAL_SLICE === '1') {
  try {
    const c = await context({ viewport: { width: 390, height: 844 } })
    const p = await c.newPage()
    for (const key of ['jawa-pendopo-pagi', 'sunda-kabut-pegunungan']) {
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
