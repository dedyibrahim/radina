import { ref, inject } from 'vue'
import { api, errorMessage } from '../services/api'
export function useRSVP(guest) {
  const context = inject('weddingContext')
  const name = ref(guest === 'Tamu Undangan' ? '' : guest),
    guests = ref(1),
    attendance = ref(''),
    message = ref(''),
    error = ref(''),
    success = ref(false),
    pending = ref(false)
  async function submit() {
    error.value = ''
    success.value = false
    if (name.value.trim().length < 2 || !attendance.value) {
      error.value = 'Mohon isi nama dan pilih konfirmasi kehadiran.'
      return
    }
    if (context.preview) {
      success.value = true
      return
    }
    pending.value = true
    try {
      await api.post(`/weddings/${context.slug}/rsvp`, {
        guest_token:
          new URLSearchParams(window.location.search).get('guest') || undefined,
        name: name.value.trim(),
        guests: guests.value,
        attendance: attendance.value,
        message: message.value.trim(),
      })
      success.value = true
    } catch (e) {
      error.value = errorMessage(e)
    } finally {
      pending.value = false
    }
  }
  return {
    name,
    guests,
    attendance,
    message,
    error,
    success,
    pending,
    submit,
    previewOnly: Boolean(context.preview),
  }
}
