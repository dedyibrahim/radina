import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { solveLoginCaptcha } from './support/login-captcha.mjs'

const base = process.env.TEST_URL
assert(base && ['localhost', '127.0.0.1', 'radina.net'].includes(new URL(base).hostname))
assert(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD)
const production = new URL(base).hostname === 'radina.net'
assert(!production || process.env.READ_ONLY_PRODUCTION === '1', 'Production checks must be explicitly read only.')
const catalog = JSON.parse(await readFile('frontend/public/music/library/catalog.json', 'utf8'))
const dir = 'test-results/music-replacement'
await mkdir(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage(), errors = [], checks = []
page.on('pageerror', error => errors.push(error.message))
try {
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Email admin').fill(process.env.TEST_ADMIN_EMAIL)
  await page.getByLabel('Kata sandi', { exact: false }).fill(process.env.TEST_ADMIN_PASSWORD)
  await solveLoginCaptcha(page)
  await page.getByRole('button', { name: 'Masuk ke Workspace' }).click()
  await page.waitForURL(`${base}/admin`)
  await page.goto(`${base}/admin/music`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Music Library', exact: true })).toBeVisible()
  const response = await context.request.get(`${base}/api/admin/music`)
  assert.equal(response.status(), 200)
  const tracks = (await response.json()).data
  assert.equal(tracks.length, 6)
  await expect(page.locator('.music-library-track')).toHaveCount(6)
  for (const expected of catalog) {
    const track = tracks.find(track => track.title === expected.title)
    assert(track, expected.title)
    assert.equal(track.duration, expected.duration)
    assert.equal(track.file_url, `/storage/music-library/${expected.file_url.split('/').pop()}`)
    const audio = await context.request.get(`${base}${track.file_url}`)
    assert.equal(audio.status(), 200, expected.title)
    const bytes = await audio.body()
    assert.equal(bytes.length, expected.bytes)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256, expected.title)
    const range = await context.request.get(`${base}${track.file_url}`, { headers: { Range: 'bytes=0-1023' } })
    // PHP's development server serves an existing storage junction directly and
    // returns the whole file; Apache and Laravel's media route support ranges.
    assert(production ? range.status() === 206 : [200, 206].includes(range.status()))
    assert.equal((await range.body()).length, range.status() === 206 ? 1024 : expected.bytes)
    const row = page.locator('.music-library-track').filter({ has: page.getByRole('heading', { name: expected.title, exact: true }) })
    await row.getByRole('button', { name: /Preview/ }).click()
    await expect(row.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
    await row.getByRole('button', { name: 'Pause', exact: true }).click()
    const duration = await page.evaluate(url => new Promise((resolve, reject) => {
      const audio = new Audio(url)
      const timer = setTimeout(() => { audio.removeAttribute('src'); audio.load(); reject(new Error('Audio metadata timed out')) }, 20000)
      audio.preload = 'metadata'
      audio.onloadedmetadata = () => { clearTimeout(timer); const duration = audio.duration; audio.removeAttribute('src'); audio.load(); resolve(duration) }
      audio.onerror = () => { clearTimeout(timer); reject(new Error('Audio metadata failed')) }
    }), track.file_url)
    assert(Math.abs(duration - expected.duration) < 2, `${expected.title} metadata duration: ${duration}`)
  }
  checks.push('Six library entries match the original MP3 hashes, play in Chrome, have valid duration metadata, and support ranged playback.')
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Library overflow at ${width}px`)
  }
  await page.screenshot({ path: `${dir}/${production ? 'production' : 'local'}-library-1440.png` })
  const templates = (await (await context.request.get(`${base}/api/templates`)).json()).data
  let demoId
  for (const template of templates) {
    const preview = await context.request.get(`${base}/api/templates/${template.slug}/preview`)
    assert.equal(preview.status(), 200)
    const wedding = (await preview.json()).data
    demoId ||= wedding.id
    assert(wedding.music.playlist.length >= 1)
    for (const track of wedding.music.playlist) assert(tracks.some(current => current.id === track.library_id && current.file_url === track.url))
    assert(tracks.some(current => current.file_url === wedding.music.music_url))
  }
  const editorId = production ? 22 : demoId
  await page.goto(`${base}/admin/weddings/${editorId}`, { waitUntil: 'networkidle' })
  await page.locator('.editor-tabs').getByRole('button', { name: 'Music', exact: true }).click()
  await expect(page.locator('.selector-track')).toHaveCount(6)
  const saved = await context.request.get(`${base}/api/admin/weddings/${editorId}`)
  assert.equal(saved.status(), 200)
  for (const track of (await saved.json()).data.music.playlist) assert(tracks.some(current => current.id === track.library_id && current.file_url === track.url))
  checks.push('All template previews and the existing invitation editor use the replacement library; the editor offers only six songs.')
  await page.getByRole('button', { name: 'Keluar', exact: true }).click()
  await page.waitForURL(`${base}/admin/login`)
  assert.deepEqual(errors, [])
  await writeFile(`${dir}/${production ? 'production' : 'local'}-report.json`, JSON.stringify({ verified: true, base, checks, responsive: true, errors }, null, 2))
  console.log(`PASS ${production ? 'production' : 'local'}: six supplied songs, original file hashes, real playback, duration, HTTP range, all demos, editor library and playlist, responsive layout, and logout.`)
} finally { await browser.close() }
