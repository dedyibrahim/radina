import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h, provide } from 'vue'
import { renderToString } from '@vue/server-renderer'

const root = resolve('frontend')
const server = await createServer({
  root,
  configFile: false,
  plugins: [vue()],
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
})
try {
  const { weddingView } = await server.ssrLoadModule('/src/utils/weddingView.js')
  const { contentPresets } = await server.ssrLoadModule('/src/templates/contentPresets.js')
  const source = {
    bride: { full_name: 'Nama Pengantin Lengkap', nickname: 'Pengantin', father_name: 'Ayah Tersimpan', mother_name: 'Ibu Tersimpan', family_order: 'Keterangan Keluarga', instagram: 'akun_tersimpan', photo: '/photo.webp' },
    groom: { full_name: 'Nama Pasangan Lengkap', nickname: 'Pasangan', father_name: 'Ayah Pasangan', mother_name: 'Ibu Pasangan', family_order: 'Keterangan Pasangan', instagram: 'akun_pasangan' },
    event_details: { host_name: 'Penyelenggara', father_name: 'Ayah Acara', mother_name: 'Ibu Acara' },
  }
  const before = JSON.stringify(source)
  for (const key of Object.keys(contentPresets)) {
    for (const parents of [true, false]) {
      for (const social of [true, false]) {
        const view = weddingView({ ...source, template: { template_key: key }, settings: { enable_parents: parents, enable_social: social } })
        for (const role of ['bride', 'groom']) {
          assert.equal(view[role].father, parents ? source[role].father_name : '')
          assert.equal(view[role].mother, parents ? source[role].mother_name : '')
          assert.equal(view[role].order, parents ? source[role].family_order : '')
          assert.equal(view[role].instagram, social ? source[role].instagram : '')
          assert.equal(view[role].name, source[role].full_name)
          assert.equal(view[role].photo, source[role].photo)
        }
        assert.equal(view.eventDetails.father_name, parents ? 'Ayah Acara' : '')
      }
    }
  }
  assert.equal(weddingView(source).bride.father, source.bride.father_name, 'Legacy settings remain visible')
  assert.equal(weddingView(source).bride.instagram, source.bride.instagram)
  assert.equal(JSON.stringify(source), before, 'Presentation toggles must never mutate the saved data')

  const entries = await readdir(resolve(root, 'src/templates'), { recursive: true })
  const components = entries.filter((file) => /(^|[\\/])(Couple|CoupleSection|DesignCouple|FloralPeople|CelebrationHost)\.vue$/.test(file))
  assert.equal(components.length, 14)
  for (const file of components) {
    const { default: Component } = await server.ssrLoadModule(`/src/templates/${file.replaceAll('\\', '/')}`)
    for (const parents of [true, false]) {
      for (const social of [true, false]) {
        const app = createSSRApp({
          setup() {
            provide('wedding', weddingView({ ...source, settings: { enable_parents: parents, enable_social: social } }))
            return () => h(Component, { design: 'amore' })
          },
        })
        const html = await renderToString(app)
        assert(html.includes('Nama Pengantin Lengkap'), file)
        assert.equal(html.includes('Ayah Tersimpan'), parents, file)
        assert.equal(html.includes('Ibu Tersimpan'), parents, file)
        assert.equal(html.includes('Keterangan Keluarga'), parents, file)
        assert.equal(html.includes('instagram.com/akun_tersimpan'), social, file)
      }
    }
  }
  console.log(`PASS: visibility combinations for ${Object.keys(contentPresets).length} templates and ${components.length} rendered couple components; input data unchanged.`)
} finally {
  await server.close()
}
