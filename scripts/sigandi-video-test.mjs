import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'

const base = process.env.TEST_URL || 'http://127.0.0.1:8094'
assert(/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base) || base === 'https://radina.net')
await mkdir('test-results/sigandi-video', { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    if (base.startsWith('http://')) {
        const html = await readFile('frontend/dist/index.html', 'utf8')
        await page.route(`${base}/sigandi`, (route) => route.fulfill({ contentType: 'text/html', body: html }))
        await page.route('**/api/settings', (route) => route.fulfill({ json: { data: {} } }))
    }
    const requests = []
    page.on('request', (request) => {
        if (request.url().includes('sigandi-word-demo-v1.mp4')) requests.push(request.url())
    })
    await page.goto(`${base}/sigandi`, { waitUntil: 'networkidle' })
    const play = page.getByRole('button', { name: 'Putar video demo SIGANDI di Word' })
    await play.scrollIntoViewIfNeeded()
    assert.equal(requests.length, 0, 'Video bytes must not load before play')
    await page.locator('#demo').screenshot({ path: 'test-results/sigandi-video/desktop.png' })
    await play.click()
    await page.waitForFunction(() => {
        const video = document.querySelector('#demo video')
        return video && video.readyState >= 2 && video.currentTime > 0
    }, undefined, { timeout: 30000 })
    const media = await page.locator('video').evaluate((video) => ({
        duration: video.duration, width: video.videoWidth, height: video.videoHeight,
        controls: video.controls, playsinline: video.playsInline, error: video.error,
    }))
    assert.equal(media.error, null)
    assert.equal(media.controls, true)
    assert.equal(media.playsinline, true)
    assert.equal(media.width, 1600)
    assert.equal(media.height, 850)
    assert.ok(media.duration > 155 && media.duration < 157)
    await page.locator('video').evaluate((video) => { video.pause(); video.currentTime = 125 })
    await page.waitForFunction(() => !document.querySelector('video').seeking)
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.locator('#demo').screenshot({ path: 'test-results/sigandi-video/mobile.png' })
    console.log(JSON.stringify({ status: 'PASS', base, noVideoBeforePlay: true, playbackAndSeek: true, mobileNoOverflow: true, ...media }, null, 2))
} finally {
    await browser.close()
}
