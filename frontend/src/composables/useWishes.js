import { ref, inject, onMounted } from 'vue'
import { api, errorMessage } from '../services/api'
export function useWishes(guest) {
  const context = inject('weddingContext')
  const name = ref(guest === 'Tamu Undangan' ? '' : guest),
    message = ref(''),
    error = ref(''),
    pending = ref(false),
    wishes = ref([]),
    next = ref(null)
  async function load(url = `/weddings/${context.slug}/wishes`) {
    if (context.preview) return
    try {
      const result = (await api.get(url)).data
      wishes.value.push(...result.data)
      next.value = result.next_page_url
        ? new URL(result.next_page_url).pathname.replace(/^\/api/, '') +
          new URL(result.next_page_url).search
        : null
    } catch (e) {
      error.value = errorMessage(e)
    }
  }
  onMounted(() => load())
  async function submit() {
    error.value = ''
    if (name.value.trim().length < 2 || message.value.trim().length < 5) {
      error.value = 'Mohon isi nama dan ucapan minimal 5 karakter.'
      return
    }
    if (context.preview) {
      wishes.value.unshift({
        id: crypto.randomUUID(),
        name: name.value.trim(),
        message: message.value.trim(),
        created_at: new Date().toISOString(),
      })
      message.value = ''
      return
    }
    pending.value = true
    try {
      const result = await api.post(`/weddings/${context.slug}/wishes`, {
        name: name.value.trim(),
        message: message.value.trim(),
      })
      wishes.value.unshift(result.data.data)
      message.value = ''
    } catch (e) {
      error.value = errorMessage(e)
    } finally {
      pending.value = false
    }
  }
  function relative(date) {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000))
    return minutes < 1
      ? 'Baru saja'
      : minutes < 60
        ? `${minutes} menit lalu`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)} jam lalu`
          : `${Math.floor(minutes / 1440)} hari lalu`
  }
  return {
    name,
    message,
    error,
    pending,
    wishes,
    next,
    load,
    submit,
    relative,
    previewOnly: Boolean(context.preview),
  }
}
