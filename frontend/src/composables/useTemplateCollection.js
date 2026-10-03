import { ref } from 'vue'
const favorites = ref([])
try {
  const stored = JSON.parse(localStorage.getItem('radina:favorites') || '[]')
  if (Array.isArray(stored))
    favorites.value = stored.filter((v) => typeof v === 'string').slice(0, 100)
} catch {
  /* Browsers may disable storage. */
}
const comparison = ref([])
const message = ref('')
export function useTemplateCollection() {
  function favorite(key) {
    favorites.value = favorites.value.includes(key)
      ? favorites.value.filter((v) => v !== key)
      : [...favorites.value, key]
    try {
      localStorage.setItem('radina:favorites', JSON.stringify(favorites.value))
    } catch {
      /* Session remains usable. */
    }
  }
  function compare(template) {
    message.value = ''
    if (comparison.value.some((t) => t.template_key === template.template_key)) {
      comparison.value = comparison.value.filter((t) => t.template_key !== template.template_key)
    } else if (comparison.value.length < 3) comparison.value.push(template)
    else
      message.value =
        'Anda dapat membandingkan maksimal 3 template. Hapus salah satu pilihan untuk menambahkan yang lain.'
  }
  return { favorites, comparison, message, favorite, compare }
}
