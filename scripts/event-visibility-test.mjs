import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h, provide } from 'vue'
import { renderToString } from '@vue/server-renderer'

const server = await createServer({
  root: resolve('frontend'),
  configFile: false,
  plugins: [vue()],
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
})
try {
  const { weddingView } = await server.ssrLoadModule('/src/utils/weddingView.js')
  const { contentPresets } = await server.ssrLoadModule('/src/templates/contentPresets.js')
  const { default: Location } = await server.ssrLoadModule(
    '/src/templates/RomanticFloral/components/LocationSection.vue',
  )
  const { default: Content } = await server.ssrLoadModule('/src/templates/shared/DesignContent.vue')
  const { default: OriginalContent } = await server.ssrLoadModule(
    '/src/templates/RomanticFloral/components/InvitationContent.vue',
  )
  const source = {
    wedding_date: '2026-12-20',
    bride: { full_name: 'Alya Putri' },
    groom: { full_name: 'Dedy Ibrahim' },
    settings: { enable_maps: true },
    section_order: ['event', 'location'],
    events: [
      {
        id: 7,
        title: 'Akad Nikah',
        date: '2026-12-20',
        start_time: '09:00:00',
        end_time: '10:00:00',
        timezone: 'Asia/Jakarta',
        venue: 'Rumah Keluarga',
        address: 'Jalan Keluarga 1',
      },
      {
        id: 9,
        title: 'Resepsi',
        date: '2026-12-20',
        start_time: '11:00:00',
        end_time: '14:00:00',
        timezone: 'Asia/Jakarta',
        venue: 'Gedung Mawar',
        address: 'Jalan Mawar 2',
        google_maps_url: 'https://maps.google.com/?q=GedungMawar',
      },
    ],
  }
  const before = JSON.stringify(source)
  function selected(flags, extra = {}) {
    return {
      ...source,
      ...extra,
      events: source.events.map((event, index) => ({ ...event, ...flags[index] })),
    }
  }
  async function render(Component, data) {
    return renderToString(
      createSSRApp({
        setup() {
          provide('wedding', weddingView(data))
          return () => h(Component, { design: 'amore' })
        },
      }),
    )
  }
  for (const key of Object.keys(contentPresets)) {
    const template = { template_key: key }
    assert.deepEqual(
      weddingView({ ...source, template }).locations.map((loc) => loc.name),
      ['Rumah Keluarga'],
      key,
    )
    const reception = weddingView(
      selected([{ show_on_map: false }, { show_on_map: true }], { template }),
    )
    assert.equal(reception.events.length, 2, key)
    assert.equal(reception.location.name, 'Gedung Mawar', key)
    assert.equal(reception.locations[0].title, 'Resepsi', key)
    assert.equal(reception.location.maps, source.events[1].google_maps_url)
    assert(reception.location.embed.includes(encodeURIComponent('Gedung Mawar Jalan Mawar 2')))
    const noMaps = weddingView(
      selected([{ show_on_map: false }, { show_on_map: false }], { template }),
    )
    assert.equal(noMaps.events.length, 2, key)
    assert.equal(noMaps.locations.length, 0, 'No fallback when every map switch is off')
    assert.equal(noMaps.location.name, '')
    const hidden = weddingView(
      selected([{ is_visible: false, show_on_map: true }, { show_on_map: true }], { template }),
    )
    assert.deepEqual(
      hidden.events.map((event) => event.title),
      ['Resepsi'],
      key,
    )
    assert.deepEqual(
      hidden.locations.map((loc) => loc.name),
      ['Gedung Mawar'],
      key,
    )
    assert.equal(hidden.date.iso, '2026-12-20T11:00:00+07:00', key)
    const legacyHidden = weddingView(selected([{ is_visible: false }, {}], { template }))
    assert.equal(
      legacyHidden.locations.length,
      0,
      'Hiding the first event must not select the next map automatically',
    )
    const both = weddingView(selected([{ show_on_map: true }, { show_on_map: true }], { template }))
    assert.equal(both.locations.length, 2, key)
    assert.notEqual(both.locations[0].key, both.locations[1].key)
  }
  const bothData = selected([{ show_on_map: true }, { show_on_map: true }])
  const html = await render(Location, bothData)
  assert.equal((html.match(/class="location-card"/g) || []).length, 2)
  assert.equal((html.match(/class="map-preview"/g) || []).length, 2)
  assert(!html.includes('<iframe'), 'Maps are loaded only after the guest taps a preview')
  assert(html.includes('Akad Nikah') && html.includes('Resepsi'))
  assert(html.includes('Rumah Keluarga') && html.includes('Gedung Mawar'))
  const onlyReception = await render(
    Content,
    selected([{ is_visible: false }, { show_on_map: true }]),
  )
  assert(!onlyReception.includes('Rumah Keluarga') && !onlyReception.includes('Akad Nikah'))
  assert(onlyReception.includes('Gedung Mawar'))
  for (const Component of [Content, OriginalContent]) {
    const none = await render(Component, selected([{ show_on_map: false }, { show_on_map: false }]))
    assert(!none.includes('id="location"'))
    const disabled = await render(Component, { ...bothData, settings: { enable_maps: false } })
    assert(!disabled.includes('id="location"'), 'The overall Maps switch remains respected')
    assert.equal((await render(Component, bothData)).match(/class="location-card"/g).length, 2)
  }
  assert.equal(JSON.stringify(source), before)
  console.log(
    `PASS: ${Object.keys(contentPresets).length} templates; independent schedule/map visibility, legacy defaults, selected venue, multi-location sections, lazy maps, hidden-event filtering and unchanged input data.`,
  )
} finally {
  await server.close()
}
