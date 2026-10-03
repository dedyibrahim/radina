import { watchEffect } from 'vue'
export function useSeo(get) {
  watchEffect(() => {
    const { title, description, image } = get()
    document.title = title || 'Radina'
    for (const [selector, attr, name, content] of [
      ['meta[name="description"]', 'name', 'description', description],
      ['meta[property="og:title"]', 'property', 'og:title', title],
      ['meta[property="og:description"]', 'property', 'og:description', description],
      ['meta[property="og:image"]', 'property', 'og:image', image || ''],
    ]) {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.content = content || ''
    }
  })
}
