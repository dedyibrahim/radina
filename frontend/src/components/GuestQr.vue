<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
const props = defineProps({ url: String, name: String })
const png = ref(''),
  error = ref('')
watch(
  () => props.url,
  async (url) => {
    png.value = ''
    error.value = ''
    if (!url) return
    try {
      png.value = await QRCode.toDataURL(url, {
        width: 600,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: { dark: '#203d32', light: '#ffffff' },
      })
    } catch {
      error.value = 'QR belum tersedia. Muat ulang halaman.'
    }
  },
  { immediate: true },
)
</script>
<template>
  <div class="guest-qr">
    <img v-if="png" :src="png" :alt="`QR kehadiran ${name || 'tamu'}`" />
    <p v-if="error" role="alert">{{ error }}</p>
    <a
      v-if="png"
      :href="png"
      :download="`QR-${(name || 'tamu').replace(/[^a-z0-9]/gi, '-')}.png`"
      class="p-button secondary"
      >Download QR Tamu</a
    >
    <p>
      Tunjukkan QR kepada petugas saat tiba di acara. Satu QR berlaku untuk satu
      undangan tamu.
    </p>
  </div>
</template>
<style scoped>
.guest-qr {
  text-align: center;
}
.guest-qr img {
  display: block;
  width: 280px;
  max-width: 100%;
  height: auto;
  margin: 0 auto 12px;
}
.guest-qr p {
  font-size: 13px;
  line-height: 1.6;
  margin: 16px auto;
  max-width: 400px;
}
</style>
