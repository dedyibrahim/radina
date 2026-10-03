import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const initialized = ref(false)
  async function restore() {
    if (initialized.value) return
    try {
      user.value = (await api.get('/admin/me')).data.data
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }
  async function login(credentials) {
    user.value = (await api.post('/admin/login', credentials)).data.data
    initialized.value = true
  }
  async function logout() {
    await api.post('/admin/logout')
    user.value = null
    initialized.value = true
  }
  return { user, initialized, restore, login, logout }
})
