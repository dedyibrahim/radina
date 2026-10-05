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
const originalNow = Date.now
try {
  Date.now = () => Date.parse('2026-10-05T00:00:00Z')
  const { weddingView } = await server.ssrLoadModule('/src/utils/weddingView.js')
  const { contentPresets } = await server.ssrLoadModule('/src/templates/contentPresets.js')
  const { default: Section } = await server.ssrLoadModule('/src/templates/RomanticFloral/components/CountdownSection.vue')
  const { downloadCalendar } = await server.ssrLoadModule('/src/templates/RomanticFloral/utils/calendar.js')
  const source = {
    slug: 'countdown-test', title: 'Alya & Dedy', wedding_date: '2026-11-14',
    bride: { full_name: 'Alya Putri', nickname: 'Alya' }, groom: { full_name: 'Dedy Ibrahim', nickname: 'Dedy' },
    events: [
      { id: 7, type: 'akad', title: 'Akad Nikah', date: '2026-11-14', start_time: '09:00:00', end_time: '10:00:00', timezone: 'Asia/Jakarta', venue: 'Rumah Keluarga', is_visible: true, show_on_map: true },
      { id: 9, type: 'reception', title: 'Resepsi', date: '2026-11-15', start_time: '14:00:00', end_time: '16:00:00', timezone: 'Asia/Makassar', venue: 'Gedung Mawar', is_visible: true, show_on_map: false, use_for_countdown: true },
    ],
  }
  const before = JSON.stringify(source)
  for (const template_key of Object.keys(contentPresets)) {
    const view = weddingView({ ...source, template: { template_key } })
    assert.equal(view.countdownEvent.title, 'Resepsi', template_key)
    assert.equal(view.countdownDate.iso, '2026-11-15T14:00:00+08:00', template_key)
    assert.equal(view.countdownDate.day, '15')
    assert.equal(view.countdownDate.month, 'NOVEMBER')
    assert.equal(view.countdownDate.year, 2026)
    assert.equal(view.countdownDate.timezone, 'WITA')
    assert.equal(view.date.day, '14', 'The main invitation date remains independent')
    assert.equal(view.location.name, 'Rumah Keluarga', 'Map selection remains independent')
    const reordered = weddingView({ ...source, events: [...source.events].reverse() })
    assert.equal(reordered.countdownEvent.title, 'Resepsi')
    assert.equal(reordered.countdownDate.iso, view.countdownDate.iso)
  }
  const legacy = weddingView({ ...source, events: source.events.map(({ use_for_countdown, ...event }) => event) })
  assert.equal(legacy.countdownDate.iso, '2026-11-14T09:00:00+07:00')
  const hidden = weddingView({ ...source, events: source.events.map(event => ({ ...event, is_visible: event.id !== 9 })) })
  assert.equal(hidden.countdownEvent, null)
  assert.equal(hidden.countdownDate.day, '', 'A hidden selected source must not silently become another event')
  const timezoneCases = [['Asia/Jakarta', '+07:00', 'WIB'], ['Asia/Makassar', '+08:00', 'WITA'], ['Asia/Jayapura', '+09:00', 'WIT']]
  for (const [timezone, offset, name] of timezoneCases) {
    const view = weddingView({ ...source, events: source.events.map(event => ({ ...event, timezone })) })
    assert.equal(view.countdownDate.iso, `2026-11-15T14:00:00${offset}`)
    assert.equal(view.countdownDate.timezone, name)
  }
  const view = weddingView(source)
  const html = await renderToString(createSSRApp({
    setup() { provide('wedding', view); return () => h(Section) },
  }))
  assert(html.includes('Resepsi · 14:00 WITA'))
  assert(html.includes('NOVEMBER') && html.includes('<span>15</span>'))
  assert(!html.includes('Akad Nikah'))

  const oldDocument = globalThis.document, oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL
  const oldTimeout = globalThis.setTimeout
  let captured, anchor
  try {
    globalThis.document = { createElement() { anchor = { click() {} }; return anchor } }
    URL.createObjectURL = blob => { captured = blob; return 'blob:calendar-test' }
    URL.revokeObjectURL = () => {}
    globalThis.setTimeout = callback => { callback(); return 0 }
    downloadCalendar(view, [view.countdownEvent])
    const calendar = (await captured.text()).replace(/\r\n /g, '')
    assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 1)
    assert(calendar.includes('DTSTART:20261115T060000Z'))
    assert(calendar.includes('DTEND:20261115T080000Z'))
    assert(calendar.includes('SUMMARY:Resepsi — Alya & Dedy'))
    assert(calendar.includes('UID:countdown-test-9@radina.local'))
    assert(!calendar.includes('Akad Nikah'))
    assert.equal(anchor.download, 'countdown-test.ics')
  } finally {
    globalThis.document = oldDocument
    URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke
    globalThis.setTimeout = oldTimeout
  }
  assert.equal(JSON.stringify(source), before)
  console.log(`PASS: ${Object.keys(contentPresets).length} templates select the correct event/date/timezone; main date and map stay independent; legacy fallback, reorder, hidden-source handling and selected-event calendar export.`)
} finally {
  Date.now = originalNow
  await server.close()
}
