import { ref, computed, inject, watch } from 'vue'
export function useGift(notify) {
  const wedding = inject('wedding')
  const active = ref(''),
    address = ref(null),
    downloading = ref(false)
  const types = [
    { key: 'BANK', label: 'Transfer Bank' },
    { key: 'EWALLET', label: 'E-Wallet' },
    { key: 'QRIS', label: 'QRIS' },
    { key: 'PHYSICAL', label: 'Kirim Hadiah' },
  ]
  const tabs = computed(() =>
    types.filter((type) => wedding.giftMethods.some((g) => g.type === type.key && g.is_active)),
  )
  watch(
    tabs,
    (value) => {
      if (!value.some((x) => x.key === active.value)) active.value = value[0]?.key || ''
    },
    { immediate: true },
  )
  const methods = computed(() =>
    wedding.giftMethods.filter((g) => g.type === active.value && g.is_active),
  )
  async function copy(number, type) {
    try {
      await navigator.clipboard.writeText(number)
      notify(type === 'BANK' ? 'Nomor rekening berhasil disalin' : 'Nomor berhasil disalin')
    } catch {
      notify('Salin secara manual: ' + number)
    }
  }
  async function download(gift) {
    downloading.value = true
    try {
      const response = await fetch(gift.qr_image)
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) throw new Error()
      const url = URL.createObjectURL(blob),
        link = document.createElement('a')
      link.href = url
      link.download =
        'QRIS-' + (gift.provider || 'Wedding') + '.' + (blob.type.split('/')[1] || 'png')
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      notify('QR berhasil diunduh.')
    } catch {
      notify('QR belum dapat diunduh. Simpan gambar QR secara manual.')
    } finally {
      downloading.value = false
    }
  }
  return { wedding, active, address, downloading, tabs, methods, copy, download }
}
