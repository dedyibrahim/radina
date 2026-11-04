import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.TEST_URL || 'http://127.0.0.1:8094'
assert(/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base), 'Use an isolated local server.')
await mkdir('test-results/sigandi', { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const errors = []
const report = {}
try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
    })
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${base}/sigandi`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 1 }).waitFor()
    await page.getByRole('link', { name: 'Unduh Installer EXE' }).waitFor()
    assert.match(await page.title(), /SIGANDI/)
    assert.equal(await page.locator('header a[href="/sigandi"]').count(), 1)
    const metadata = await page.request.get(`${base}/sigandi/release`)
    const release = await metadata.json()
    assert.equal(release.version, '1.4.8')
    assert.equal(release.word_version, '0.4.9')
    for (const type of ['installer', 'guide']) {
        const response = await page.request.head(`${base}/sigandi/download/${type}`)
        assert.equal(response.status(), 200)
        assert.match(response.headers()['content-disposition'], /attachment/)
        assert.equal(Number(response.headers()['content-length']), release.files[type].bytes)
    }
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: 'Unduh Panduan PDF' }).click(),
    ])
    assert.equal(download.suggestedFilename(), release.files.guide.filename)
    await download.saveAs('test-results/sigandi/downloaded-guide.pdf')
    await page.getByText('Apakah saya perlu internet?', { exact: true }).click()
    assert(
        await page
            .getByText('Ya. Aktivasi dan setiap tindakan berlisensi', { exact: false })
            .isVisible(),
    )
    await page.screenshot({ path: 'test-results/sigandi/desktop.png', fullPage: true })
    report.desktop = { downloadsAvailable: true, guideDownloadWorks: true, faqWorks: true }
    for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(`${base}/sigandi`, { waitUntil: 'networkidle' })
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
        )
        assert(!overflow, `Horizontal overflow at ${width}px`)
        await page.getByRole('link', { name: 'Unduh Installer EXE' }).waitFor()
        await page.screenshot({ path: `test-results/sigandi/mobile-${width}.png`, fullPage: true })
        report[`mobile${width}`] = { noHorizontalOverflow: true, downloadsAvailable: true }
    }
    let fail = true
    await page.route('**/sigandi/release', (route) =>
        fail ? route.fulfill({ status: 503, body: '{}' }) : route.continue(),
    )
    await page.goto(`${base}/sigandi`, { waitUntil: 'networkidle' })
    await page.getByRole('alert').filter({ hasText: 'Informasi unduhan' }).waitFor()
    fail = false
    await page.getByRole('button', { name: 'Coba lagi', exact: true }).last().click()
    await page.getByRole('link', { name: 'Unduh Installer EXE' }).waitFor()
    report.releaseRetryWorks = true
    assert.deepEqual(errors, [])
    report.javascriptErrors = errors
    report.status = 'PASS'
} finally {
    await browser.close()
    await writeFile('test-results/sigandi/report.json', JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
