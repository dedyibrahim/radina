<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api, errorMessage } from '../../services/api'
import PaymentInstructions from '../../components/PaymentInstructions.vue'
import PageState from '../../components/PageState.vue'
const route = useRoute(),
  order = ref(null),
  loading = ref(true),
  error = ref('')
async function load() {
  const whatsapp = sessionStorage.getItem(`order:${route.params.number}`)
  if (!whatsapp) {
    loading.value = false
    return
  }
  try {
    order.value = (
      await api.post('/check-order', { order_number: route.params.number, whatsapp })
    ).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<template>
  <main class="p-container narrow-page">
    <div class="p-centered-heading">
      <p class="p-eyebrow">THANK YOU FOR CHOOSING US</p>
      <h1>Pesanan Anda,<br /><em>awal cerita yang indah.</em></h1>
      <p>Simpan Order ID untuk mengecek proses undangan Anda.</p>
    </div>
    <PageState
      v-if="loading || error"
      :loading="loading"
      :error="error"
      @retry="load"
    /><PaymentInstructions v-else-if="order" :order="order" />
    <div v-else class="surface page-state">
      <p>Masukkan Order ID dan WhatsApp untuk melihat detail pesanan.</p>
      <RouterLink to="/check-order" class="p-button">Cek Pesanan</RouterLink>
    </div>
  </main>
</template>
