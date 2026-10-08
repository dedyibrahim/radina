import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h, provide, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'

const server = await createServer({
  root: resolve('frontend'),
  configFile: false,
  plugins: [vue()],
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
})
try {
  const { templateRegistry } = await server.ssrLoadModule(
    '/src/templates/templateRegistry.js',
  )
  const { contentPresets } = await server.ssrLoadModule(
    '/src/templates/contentPresets.js',
  )
  const { visualConfigFor, visualProfiles, motionProfiles } =
    await server.ssrLoadModule('/src/templates/shared/templateVisualConfig.js')
  const { ornamentLibrary } = await server.ssrLoadModule(
    '/src/components/wedding/effects/ornamentLibrary.js',
  )
  const { performanceMode } = await server.ssrLoadModule(
    '/src/composables/useDevicePerformance.js',
  )
  const { default: Atmosphere } = await server.ssrLoadModule(
    '/src/components/wedding/effects/VisualAtmosphere.vue',
  )
  const { default: Divider } = await server.ssrLoadModule(
    '/src/components/wedding/effects/SectionDivider.vue',
  )
  const studio = JSON.parse(
    await readFile('config/template-studio.json', 'utf8'),
  )
  const floral = JSON.parse(
    await readFile('config/floral-collection.json', 'utf8'),
  )
  const cinematicWorlds = JSON.parse(
    await readFile('config/cinematic-worlds.json', 'utf8'),
  )
  const registryText = await readFile(
    'frontend/src/templates/templateRegistry.js',
    'utf8',
  )
  const entries = [
    ...registryText.matchAll(
      /(?:'([^']+)'|([a-z]+)):\s*defineAsyncComponent\([\s\S]*?import\('([^']+)'\)/g,
    ),
  ]
  const paths = Object.fromEntries(
    entries.map((match) => [match[1] || match[2], match[3]]),
  )
  assert.deepEqual(
    Object.keys(templateRegistry).sort(),
    Object.keys(contentPresets).sort(),
    'Every registered template needs an existing CMS content contract',
  )
  const rows = []
  assert.equal(
    Object.values(cinematicWorlds).filter(
      (world) => world.category === 'Regional',
    ).length,
    20,
    'The regional collection includes twenty scene worlds',
  )
  assert.equal(
    Object.values(cinematicWorlds).filter(
      (world) => world.category === 'Kids & Birthday',
    ).length,
    16,
    'The kids and birthday collection includes at least fifteen distinct worlds',
  )
  assert.equal(
    new Set(Object.values(cinematicWorlds).map((world) => world.scene)).size,
    36,
    'Every new template has its own environment',
  )
  assert.doesNotMatch(
    JSON.stringify(cinematicWorlds),
    /spongebob|mickey|doraemon|upin ipin|elsa|naruto|pokemon|marvel|dc comics/i,
    'Original characters only',
  )
  for (const key of Object.keys(templateRegistry)) {
    const component = floral[key]
      ? './FloralAtelier/FloralInvitation.vue'
      : studio[key]
        ? './shared/StudioInvitation.vue'
        : cinematicWorlds[key]
          ? './shared/StudioInvitation.vue'
          : paths[key]
    assert(component, `Missing Vue entry: ${key}`)
    const text = await readFile(
      resolve('frontend/src/templates', component),
      'utf8',
    )
    const design = text.match(/design="([^"]+)"/)?.[1]
    const config = visualConfigFor(key, { design })
    assert.equal(
      visualConfigFor(key, { design, category: 'Modern' }).personality,
      config.personality,
      `A broad storefront category must not replace the original design identity: ${key}, design ${design}`,
    )
    assert(config.depthIntensity >= 0 && config.depthIntensity <= 1, key)
    assert(config.parallaxIntensity >= 0 && config.parallaxIntensity <= 1, key)
    assert(config.animations.length >= 2, key)
    assert(visualProfiles[config.personality], key)
    assert(motionProfiles[config.personality], key)
    assert(
      config.motionProfile.environment && config.motionProfile.foreground,
      key,
    )
    assert(
      config.motionProfile.openingType && config.motionProfile.particle,
      key,
    )
    assert(
      ornamentLibrary[`${config.ornamentFamily}/${config.ornament}`],
      `Missing ornament ${key}: ${config.ornamentFamily}/${config.ornament}`,
    )
    assert(
      ornamentLibrary[`${config.ornamentFamily}/${config.secondaryOrnament}`],
      `Missing secondary ornament ${key}`,
    )
    assert.deepEqual(
      config,
      visualConfigFor(key, { design }),
      'Configuration is deterministic',
    )
    const html = await renderToString(
      createSSRApp({
        setup() {
          provide('wedding', {
            isWedding: true,
            bride: { shortName: 'Alya' },
            groom: { shortName: 'Rizky' },
          })
          provide('weddingVisual', {
            config: ref(config),
            root: ref(null),
            motion: ref(true),
            performance: {
              active: ref(true),
              quality: ref('standard'),
            },
          })
          return () =>
            h('div', [h(Atmosphere, { scene: 'opening' }), h(Divider)])
        },
      }),
    )
    for (const plane of ['background', 'midground', 'foreground'])
      assert(html.includes(`data-plane="${plane}"`), key)
    assert(
      html.includes('aria-hidden="true"') && !html.includes('undefined'),
      key,
    )
    rows.push({
      key,
      name: contentPresets[key].name,
      worldCategory: cinematicWorlds[key]?.category || null,
      world: cinematicWorlds[key]?.world || null,
      scene: config.sceneProfile.scene,
      sceneOpening: config.sceneProfile.opening,
      component,
      personality: config.personality,
      existingLayout: config.layout,
      ornaments: config.ornamentFamily + '/' + config.ornament,
      depth: config.depthIntensity,
      motion: config.animations.join(', '),
      environment: config.motionProfile.environment,
      livingMotion: `${config.motionProfile.foreground} / ${config.motionProfile.particle} / ${config.motionProfile.openingType}`,
      opening: config.openingEffect,
      gallery: config.galleryStyle,
      photo: config.photoFrame,
      divider: config.divider,
      music: config.musicSkin,
    })
  }
  assert.equal(performanceMode({ width: 1440, cores: 8, memory: 8 }), 'high')
  assert.equal(performanceMode({ width: 390, cores: 8, memory: 8 }), 'standard')
  for (const facts of [
    { reduced: true },
    { saveData: true },
    { cores: 2 },
    { memory: 2 },
  ])
    assert.equal(performanceMode(facts), 'lite')
  const future = visualConfigFor('future-template', {
    category: 'Islamic',
    visual: { photoFrame: 'floating' },
  })
  assert.equal(future.personality, 'islamic')
  assert.equal(future.photoFrame, 'floating')
  assert.equal(future.motionProfile.openingType, 'arch')
  assert.equal(
    visualConfigFor('future-minimal', { category: 'Minimalist' })
      .ornamentFamily,
    'modern',
  )
  assert(new Set(rows.map((row) => row.personality)).size > 1)
  await mkdir('test-results', { recursive: true })
  await writeFile(
    'test-results/template-visual-audit.json',
    JSON.stringify(rows, null, 2),
  )
  console.log(
    `PASS: ${rows.length} registry entries, existing Vue sources, layered ornament assets, deterministic profiles, identity variations, quality modes and future-template inheritance.`,
  )
  if (process.argv.includes('--audit')) {
    let database = { templates: [], statuses: {} }
    try {
      database = JSON.parse(
        await readFile('test-results/visual-template-database.json', 'utf8'),
      )
    } catch {}
    const statuses = Object.fromEntries(
      database.templates.map((item) => [item.key, item.status]),
    )
    const escape = (value) => String(value).replaceAll('|', '/')
    const lines = [
      '# Template visual audit',
      '',
      'Audit: 8 October 2026. Registry entries and Vue entry points are discovered from the current project; no fixed template count is used.',
      '',
      `Found ${rows.length} registry entries. Read-only local database snapshot: ${JSON.stringify(database.statuses)}. Production status was not queried or changed. Inactive templates use the same visual system and retain their availability setting.`,
      '',
      'Catalog sources: template-presets.json, floral-presets.json, template-studio.json, floral-collection.json, cinematic-worlds.json and the Radina catalog seeders. Studio/Atelier entries intentionally share a configurable renderer; their component_name labels are not separate Vue files.',
      '',
      '| Template | Vue entry | Personality / existing layout | Ornament / depth | Living scene | Reveal / opening | Existing gallery | Photo / divider / music | Local status |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ]
    for (const row of rows)
      lines.push(
        `| ${escape(row.name)} (${row.key}) | ${row.component} | ${row.personality} / ${row.existingLayout} | ${row.ornaments} / ${row.depth} | ${row.environment}: ${row.livingMotion} | ${row.motion} / ${row.opening} | ${row.gallery} | ${row.photo} / ${row.divider} / ${row.music} | ${statuses[row.key] || 'unknown'} |`,
      )
    await mkdir('docs', { recursive: true })
    await writeFile('docs/template-visual-audit.md', lines.join('\n') + '\n')
  }
} finally {
  await server.close()
}
