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
  const { default: Quote } = await server.ssrLoadModule('/src/templates/RomanticFloral/components/WeddingQuote.vue')
  const arabic = 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا'
  const translation = 'Di antara tanda-tanda kebesaran-Nya, Dia menciptakan pasangan untukmu.'
  async function render(data) {
    const before = JSON.stringify(data)
    const html = await renderToString(createSSRApp({
      setup() {
        provide('wedding', weddingView(data))
        return () => h(Quote)
      },
    }))
    assert.equal(JSON.stringify(data), before, 'Formatting must not change saved customer content')
    return html.match(/<blockquote>([\s\S]*?)<\/blockquote>/)[1]
  }
  for (const separator of ['\n', '\r\n', '\r', '\\n', '/n', '\\r\\n']) {
    const html = await render({ quote: arabic + separator + translation })
    assert(html.includes(`<bdi dir="auto">${arabic}</bdi>`))
    assert(html.includes(`<bdi dir="auto">${translation}</bdi>`))
    assert.equal((html.match(/<br\s*\/?>/g) || []).length, 1)
  }
  const blankLine = await render({ quote: arabic + '/n/n' + translation })
  assert.equal((blankLine.match(/<br\s*\/?>/g) || []).length, 2)
  const plain = await render({ quote: 'Satu paragraf tetap satu paragraf.' })
  assert(!plain.includes('<br'))
  const link = 'https://radina.net/news/notes'
  const withLink = await render({ quote: link + '\n' + translation })
  assert(withLink.includes(link), 'Line break shorthand must not damage URL paths')
  const untrusted = await render({ quote: '<img src=x onerror=alert(1)>/n<script>alert(1)</script>' })
  assert(!untrusted.includes('<img') && !untrusted.includes('<script'))
  assert(untrusted.includes('&lt;img') && untrusted.includes('&lt;script'))
  for (const template_key of Object.keys(contentPresets)) {
    const html = await render({
      template: { template_key },
      quote: 'Kutipan awal',
      section_content: { quote: { content: arabic + '/n' + translation } },
    })
    assert(html.includes(arabic) && html.includes(translation), template_key)
    assert(!html.includes('Kutipan awal'), 'Custom quote content remains the displayed source')
    assert.equal((html.match(/<br\s*\/?>/g) || []).length, 1, template_key)
  }
  console.log(`PASS: Arabic/translation separation, Enter and literal newline markers, blank lines, preserved URLs, escaped HTML, custom quotes and ${Object.keys(contentPresets).length} template adapters; saved content unchanged.`)
} finally {
  await server.close()
}
