import assert from 'node:assert/strict'
import { expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'

export async function captureExclusiveCovers({
  context,
  rows,
  base,
  dir,
  fits,
  errors,
}) {
  const covers = rows.filter((row) => !row.worldCategory)
  let count = 0
  await Promise.all(
    [0, 1].map(async (worker) => {
      const c = await context({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      })
      const p = await c.newPage()
      for (const [index, row] of covers.entries()) {
        if (index % 2 !== worker) continue
        await p.goto(base + '/w/visual-' + row.key, {
          waitUntil: 'domcontentloaded',
        })
        const cover = p.locator('.opening-stage')
        await expect(
          cover.getByRole('button', { name: 'Buka Undangan', exact: true }),
        ).toBeVisible()
        await expect
          .poll(() =>
            cover
              .locator('img')
              .evaluateAll((nodes) =>
                nodes.every((node) => node.complete && node.naturalWidth > 0),
              ),
          )
          .toBe(true)
        await p.evaluate(() => document.fonts.ready)
        await fits(p, row.key)
        const path = `${dir}/exclusive-${row.key}-cover.png`
        await cover.screenshot({ path })
        execFileSync('php', [
          'scripts/convert-demo-image.php',
          path,
          `frontend/public/images/templates/previews/${row.key}.webp`,
        ])
        if (++count % 20 === 0)
          console.log(`CAPTURE covers ${count}/${covers.length}`)
      }
      await c.close()
    }),
  )
  assert.equal(count, covers.length)
  assert.deepEqual(errors, [])
  console.log(
    `PASS ${count} actual catalog covers, loaded photographs, fonts and mobile layout`,
  )
}

export async function testExclusiveOrnaments({
  context,
  rows,
  base,
  dir,
  fits,
  errors,
}) {
  const atelier = rows.filter((row) => row.nativeOrnaments)
  const representatives = [
    ...new Map([
      ...atelier.map((row) => [row.personality, row]),
      ...atelier.map((row) => [row.ornamentLayout, row]),
    ]).values(),
  ].filter(
    (row, index, all) =>
      all.findIndex((other) => other.key === row.key) === index,
  )
  const c = await context({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const p = await c.newPage()
  for (const row of representatives) {
    await p.goto(base + '/w/visual-' + row.key + '?to=Dedy%20Ibrahim')
    const opening = p.locator('.opening-stage')
    const ornaments = opening.locator('.signature-corner')
    await expect(ornaments).toHaveCount(2)
    const motion = ornaments.locator('.signature-motion').first()
    await expect(motion).toHaveCSS('animation-play-state', 'running')
    const start = await motion.evaluate((el) => getComputedStyle(el).transform)
    await expect
      .poll(() => motion.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(start)
    assert(
      await motion.evaluate(
        (el) => !new DOMMatrix(getComputedStyle(el).transform).is2D,
      ),
      row.key + ' decorative perspective',
    )
    assert(
      await ornaments.evaluateAll((nodes) =>
        nodes.every(
          (node) =>
            getComputedStyle(node).transform === 'none' &&
            getComputedStyle(node).rotate === 'none',
        ),
      ),
      row.key + ' do not flip motifs',
    )
    if (!row.ornaments.startsWith('floral/'))
      await expect(opening.locator('.flower-spray')).toHaveCount(0)
    await fits(p, row.key + ' cover')
    await opening.screenshot({
      path: `${dir}/exclusive-detail-${row.key}-390.png`,
    })
    await p.setViewportSize({ width: 320, height: 740 })
    await fits(p, row.key + ' narrow cover')
    await p.getByRole('button', { name: 'Buka Undangan', exact: true }).click()
    await expect(p.locator('.opening-stage')).toHaveCount(0)
    const profile = p.locator('.section-frame[data-section="couple"]')
    await profile.evaluate((el) =>
      el.scrollIntoView({ behavior: 'instant', block: 'center' }),
    )
    await expect(profile.locator('.signature-corner')).toHaveCount(1)
    await expect(profile).toContainText('Alya Putri Ramadhani')
    await expect(p.locator('#rsvp-name')).toHaveValue('Dedy Ibrahim')
    await fits(p, row.key + ' narrow content')
    const activeMotion = profile.locator('.signature-motion')
    await expect(activeMotion).toHaveCSS('animation-play-state', 'running')
    await p
      .getByRole('button', { name: 'Matikan animasi', exact: true })
      .click()
    assert(
      await activeMotion.evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .every((a) => a.playState !== 'running'),
      ),
      row.key + ' disabled decorations',
    )
    await p
      .getByRole('button', { name: 'Aktifkan animasi', exact: true })
      .click()
    await profile.evaluate((el) =>
      el.scrollIntoView({ behavior: 'instant', block: 'center' }),
    )
    await expect(activeMotion).toHaveCSS('animation-play-state', 'running')
    await p.emulateMedia({ reducedMotion: 'reduce' })
    await expect(p.locator('.wedding-page')).toHaveAttribute(
      'data-visual-quality',
      'lite',
    )
    assert(
      await activeMotion.evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .every((a) => a.playState !== 'running'),
      ),
      row.key + ' reduced motion',
    )
    await p.emulateMedia({ reducedMotion: 'no-preference' })
    await p.setViewportSize({ width: 390, height: 844 })
    console.log('PASS exclusive ornaments ' + row.key)
  }
  await c.close()
  assert.deepEqual(errors, [])
  console.log(
    `PASS exclusive details: ${representatives.length} curated themes, every Atelier personality and all seven compositions, narrow layout, real motion, upright assets, animation controls and reduced motion`,
  )
}
