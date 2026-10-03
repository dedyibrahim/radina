import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
export const usePlatformStore = defineStore('platform', () => {
  const settings = ref({})
  const categories = ref([])
  const error = ref('')
  let ready = false
  async function load() {
    if (ready) return
    try {
      const [config, cats] = await Promise.all([api.get('/settings'), api.get('/categories')])
      settings.value = config.data.data
      categories.value = cats.data.data
      ready = true
      error.value = ''
    } catch {
      error.value = 'Informasi platform belum dapat dimuat.'
    }
  }
  return { settings, categories, error, load }
})
