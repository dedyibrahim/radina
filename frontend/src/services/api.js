import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})
let csrfReady = false
let csrfPromise
api.interceptors.request.use(async (config) => {
  if (!['get', 'head', 'options'].includes(config.method) && !csrfReady) {
    csrfPromise ||= axios
      .get('/sanctum/csrf-cookie', { withCredentials: true })
      .then(() => {
        csrfReady = true
      })
      .finally(() => {
        csrfPromise = null
      })
    await csrfPromise
  }
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 419) csrfReady = false
    return Promise.reject(error)
  },
)
export function errorMessage(error) {
  const errors = error.response?.data?.errors
  if (errors) return Object.values(errors).flat().join(' ')
  return error.response?.data?.message || 'Tidak dapat terhubung. Periksa koneksi dan coba kembali.'
}
export const formatMoney = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
export const statusLabels = {
  WAITING_PAYMENT: 'Menunggu Pembayaran',
  PAYMENT_REVIEW: 'Verifikasi Pembayaran',
  PAID: 'Pembayaran Berhasil',
  CONTENT_PROCESS: 'Sedang Dikerjakan',
  READY: 'Siap Dipublish',
  PUBLISHED: 'Undangan Aktif',
  CANCELLED: 'Dibatalkan',
  PENDING: 'Menunggu',
  DRAFT: 'Draft',
}
