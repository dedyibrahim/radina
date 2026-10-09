import assert from 'node:assert/strict'
import { expect } from '@playwright/test'

export async function testKidsCinematic({
  context,
  rows,
  base,
  dir,
  fits,
  fullBleed,
  errors,
  submissions,
  weddingFixture,
}) {
  const kids = rows.filter((row) => row.component.includes('KidsCinematic'))
  assert.equal(kids.length, 4)
  const profiles = [
    { name: 'mobile', width: 390, height: 844, isMobile: true },
    { name: 'narrow', width: 320, height: 740, isMobile: true },
    { name: 'tablet', width: 768, height: 1024, isMobile: true },
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'lite', width: 390, height: 844, isMobile: true, lite: true },
    {
      name: 'reduced',
      width: 390,
      height: 844,
      isMobile: true,
      reduced: true,
    },
  ].filter(
    (profile) =>
      process.env.RADINA_KIDS_SMOKE !== '1' || profile.name === 'mobile',
  )
  const scrollScene = async (scene) =>
    scene
      .locator('.kids-scene__viewport')
      .evaluate((el) =>
        el.scrollIntoView({ behavior: 'instant', block: 'center' }),
      )
  const shotNames = new Set()
  for (const profile of profiles) {
    const c = await context({
      viewport: { width: profile.width, height: profile.height },
      isMobile: !!profile.isMobile,
      hasTouch: !!profile.isMobile,
      reducedMotion: profile.reduced ? 'reduce' : 'no-preference',
    })
    if (profile.lite)
      await c.addInitScript(() => {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 2,
        })
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 2,
        })
      })
    const p = await c.newPage()
    for (const row of kids) {
      const label = `${row.key} ${profile.name}`
      await p.goto(base + '/w/visual-' + row.key + '?to=Dedy%20Ibrahim', {
        waitUntil: 'domcontentloaded',
      })
      const opening = p.locator('.kids-opening')
      const theme = row.key.replace('anak-', '').replace('-cinematic', '')
      await expect(opening).toHaveAttribute('data-kids-theme', theme)
      await expect(opening.locator('h1')).toHaveText('Naila Ibrahim')
      await expect(opening.locator('.kids-age-emblem b')).toHaveText('7')
      await expect(opening.locator('.kids-guest-card')).toContainText(
        'Dedy Ibrahim',
      )
      await expect(p.locator('.wedding-page')).toHaveAttribute(
        'data-visual-quality',
        profile.lite || profile.reduced
          ? 'lite'
          : profile.name === 'desktop'
            ? 'high'
            : 'standard',
      )
      const coverScene = opening.locator('.kids-scene')
      await expect(coverScene).toHaveAttribute(
        'data-active',
        profile.reduced ? 'false' : 'true',
      )
      await expect
        .poll(() =>
          opening
            .locator('img')
            .evaluateAll((nodes) =>
              nodes.every((el) => el.complete && el.naturalWidth > 0),
            ),
        )
        .toBe(true)
      await fits(p, label + ' cover')
      await fullBleed(
        coverScene.locator('.kids-camera'),
        '.kids-scene__viewport',
        label + ' cover',
      )
      if (!profile.reduced) {
        const actor = coverScene.locator('.kids-actor').first()
        await expect(actor).toHaveCSS('animation-play-state', 'running')
        const before = await actor.evaluate(
          (el) => getComputedStyle(el).transform,
        )
        await expect
          .poll(() => actor.evaluate((el) => getComputedStyle(el).transform), {
            message: label + ' moving character',
            timeout: 5000,
          })
          .not.toBe(before)
        assert(
          await actor.evaluate(
            (el) => !new DOMMatrix(getComputedStyle(el).transform).is2D,
          ),
          label + ' perspective',
        )
      }
      assert.equal(
        await p.evaluate(
          () => window.audioEvents.filter((e) => e.action === 'play').length,
        ),
        0,
        label + ' music needs opening gesture',
      )
      if (profile.name === 'mobile')
        await opening.screenshot({
          path: `${dir}/kids-${theme}-cover.png`,
        })
      await p
        .getByRole('button', { name: 'Buka Undangan', exact: true })
        .click()
      await expect(p.locator('.opening-stage')).toHaveCount(0)
      await expect(p.locator('#home')).toContainText('Naila Ibrahim')
      await expect(p.locator('#couple')).toContainText('Keluarga Ibrahim')
      await expect(p.locator('.section-monogram')).toHaveCount(0)
      const frames = p.locator('.section-frame')
      assert.equal(
        await frames.count(),
        14,
        label + ' all enabled CMS sections',
      )
      if (process.env.RADINA_KIDS_SMOKE === '1') {
        await expect(p.locator('.visual-divider').first()).toBeHidden()
        assert(
          await frames.evaluateAll((nodes) =>
            nodes.every(
              (node, i) =>
                !i ||
                Math.abs(
                  node.getBoundingClientRect().top -
                    nodes[i - 1].getBoundingClientRect().bottom,
                ) < 1,
            ),
          ),
          label + ' consecutive scenes have no white gaps',
        )
      }
      for (const frame of await frames.all()) {
        const scene = frame.locator('.kids-scene')
        await expect(scene).toHaveCSS('position', 'absolute')
        const start = await frame.evaluate((el) => ({
          frame: el.getBoundingClientRect().top,
          content: el.querySelector(':scope > section').getBoundingClientRect()
            .top,
        }))
        assert(
          Math.abs(start.frame - start.content) < 2,
          label + ' scenery must not add an empty slide before content',
        )
        await scrollScene(scene)
        await expect(scene).toHaveAttribute(
          'data-active',
          profile.reduced ? 'false' : 'true',
        )
        await expect(scene).toHaveAttribute('data-theme', theme)
        shotNames.add(await scene.getAttribute('data-shot'))
        await fullBleed(
          scene.locator('.kids-camera'),
          '.kids-scene__viewport',
          label + ' ' + (await frame.getAttribute('data-section')),
        )
        await fits(p, label + ' content')
      }
      const closing = p.locator('[data-section="closing"] .kids-scene')
      await expect(
        p.locator('[data-section="home"] .kids-scene'),
      ).toHaveAttribute('data-active', 'false')
      if (!profile.reduced) {
        await p
          .getByRole('button', {
            name: 'Matikan animasi',
            exact: true,
          })
          .click()
        await scrollScene(closing)
        await expect(closing).toHaveAttribute('data-active', 'false')
        await expect(closing.locator('.kids-camera')).toHaveCSS(
          'animation-play-state',
          'paused',
        )
        await p
          .getByRole('button', {
            name: 'Aktifkan animasi',
            exact: true,
          })
          .click()
        await scrollScene(closing)
        await expect(closing).toHaveAttribute('data-active', 'true')
      } else {
        assert(
          await p
            .locator('.kids-scene')
            .evaluateAll((nodes) =>
              nodes.every((node) =>
                node
                  .getAnimations({ subtree: true })
                  .every((a) => a.playState !== 'running'),
              ),
            ),
          label + ' respect reduced motion',
        )
      }
      if (profile.name === 'mobile' || profile.name === 'desktop') {
        await p.getByRole('button', { name: 'Gallery', exact: true }).click()
        await p.locator('.gallery-item').first().click()
        await expect(p.locator('.lightbox')).toBeVisible()
        await p.keyboard.press('Escape')
        await expect(p.locator('.lightbox')).toHaveCount(0)
        await expect(p.locator('#rsvp-name')).toHaveValue('Dedy Ibrahim')
        await p.locator('input[name="attendance"][value="Hadir"]').check()
        await p
          .locator('#rsvp-message')
          .fill('Selamat ulang tahun Naila, sampai bertemu!')
        await p
          .getByRole('button', {
            name: 'Kirim Konfirmasi',
            exact: true,
          })
          .click()
        await expect(p.locator('.form-success')).toContainText('Terkirim!')
        assert.equal(submissions.at(-1).name, 'Dedy Ibrahim')
        assert.equal(
          submissions.at(-1).message,
          'Selamat ulang tahun Naila, sampai bertemu!',
        )
        await p.locator('[data-section="couple"]').evaluate((el) =>
          el.scrollIntoView({
            behavior: 'instant',
            block: 'start',
          }),
        )
        await p.waitForTimeout(900)
        await p.screenshot({
          path: `${dir}/kids-${theme}-${profile.name}-profile.png`,
        })
      }
      assert.equal(
        await p.evaluate(
          () => window.audioEvents.filter((e) => e.action === 'create').length,
        ),
        1,
        label + ' audio remains continuous',
      )
      console.log('PASS ' + label)
    }
    await c.close()
  }
  const previewContext = await context({
    viewport: { width: 1440, height: 900 },
  })
  const previewPage = await previewContext.newPage()
  for (const row of kids) {
    await previewPage.goto(base + '/templates/' + row.key + '/preview')
    await expect(
      previewPage.getByText('Pratinjau · ' + row.name, { exact: true }),
    ).toBeVisible()
    const frame = previewPage.frameLocator('.admin-preview-frame')
    await expect(frame.locator('.kids-opening')).toBeVisible()
    await previewPage
      .getByRole('button', { name: 'Mobile', exact: true })
      .click()
    await expect
      .poll(() =>
        previewPage
          .locator('.admin-preview-frame')
          .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
      )
      .toBe(390)
    await expect(frame.locator('.kids-opening h1')).toHaveText('Naila Ibrahim')
    await previewPage
      .getByRole('button', { name: 'Animasi ON', exact: true })
      .click()
    await expect(frame.locator('.kids-scene')).toHaveAttribute(
      'data-active',
      'false',
    )
    await previewPage
      .getByRole('button', { name: 'Animasi OFF', exact: true })
      .click()
    await expect(frame.locator('.kids-scene')).toHaveAttribute(
      'data-active',
      'true',
    )
    await frame
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(frame.locator('#home')).toContainText('Naila Ibrahim')
    await previewPage
      .getByRole('button', { name: 'Preview Cover', exact: true })
      .click()
    await expect(frame.locator('.kids-opening')).toBeVisible()
    console.log('PASS catalog preview toolbar ' + row.key)
  }
  await previewContext.close()
  const photoContext = await context({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
  })
  await photoContext.route(
    /\/api\/weddings\/visual-anak-[^/?]+(?:\?.*)?$/,
    async (route) => {
      const key = new URL(route.request().url()).pathname
        .split('/')
        .at(-1)
        .replace('visual-', '')
      const data = weddingFixture(key, 'birthday')
      data.event_details.photo = '/images/demos/photo-1.webp'
      data.event_details.honoree_name = 'Naila Azzahra Putri Ibrahim'
      data.event_details.honoree_age = 12
      await route.fulfill({ json: { data } })
    },
  )
  const photoPage = await photoContext.newPage()
  for (const row of kids) {
    await photoPage.goto(base + '/w/visual-' + row.key)
    await expect(photoPage.locator('.kids-opening h1')).toHaveText(
      'Naila Azzahra Putri Ibrahim',
    )
    await expect(
      photoPage.locator('.kids-opening .kids-portrait img'),
    ).toHaveAttribute('src', '/images/demos/photo-1.webp')
    await expect(
      photoPage.locator('.kids-opening .kids-age-caption'),
    ).toContainText('12')
    await fits(photoPage, row.key + ' long name and photograph')
    await photoPage
      .getByRole('button', { name: 'Buka Undangan', exact: true })
      .click()
    await expect(
      photoPage.locator('.kids-hero .kids-portrait img'),
    ).toHaveAttribute('src', '/images/demos/photo-1.webp')
    await expect(photoPage.locator('.kids-hero .kids-age-badge')).toHaveText(
      '12 tahun',
    )
    await expect(photoPage.locator('#couple')).toContainText(
      'Naila Azzahra Putri Ibrahim',
    )
    console.log('PASS personalized photograph and age ' + row.key)
  }
  await photoContext.close()
  assert.deepEqual([...shotNames].sort(), [
    'arrival',
    'celebrate',
    'farewell',
    'play',
  ])
  assert.deepEqual(errors, [], 'Vue runtime and console warnings')
  console.log(
    `PASS four kids worlds, ${profiles.length} device profiles, ${profiles.length * kids.length * 14} content scenes, full bleed, motion controls, audio, gallery, RSVP, catalog preview, personalized photograph and age`,
  )
}
