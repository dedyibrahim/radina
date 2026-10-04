<script setup>
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
const props = defineProps({ order: Object, base: String, paid: Boolean })
const busy = ref(''),
  error = ref('')
async function download(type) {
  busy.value = type
  error.value = ''
  try {
    const result = props.base
      ? await api.get(`${props.base}/documents/${type}`, {
          responseType: 'blob',
        })
      : await api.post(
          `/order-documents/${type}`,
          {
            order_number: props.order.order_number,
            whatsapp: props.order.whatsapp,
          },
          { responseType: 'blob' },
        )
    const url = URL.createObjectURL(result.data),
      link = document.createElement('a')
    link.href = url
    link.download =
      result.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] ||
      `${type}.pdf`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    if (e.response?.data instanceof Blob) {
      try {
        e.response.data = JSON.parse(await e.response.data.text())
      } catch {}
    }
    error.value = errorMessage(e)
  } finally {
    busy.value = ''
  }
}
</script>
<template>
  <div class="order-documents">
    <div class="action-group">
      <button
        type="button"
        class="p-button secondary"
        :disabled="!!busy"
        @click="download('invoice')"
      >
        <Download :size="16" />{{
          busy === 'invoice' ? 'Menyiapkan…' : 'Download Invoice'
        }}
      </button>
      <button
        v-if="paid || order?.payment?.status === 'PAID'"
        type="button"
        class="p-button secondary"
        :disabled="!!busy"
        @click="download('receipt')"
      >
        <Download :size="16" />{{
          busy === 'receipt' ? 'Menyiapkan…' : 'Download Kwitansi'
        }}
      </button>
    </div>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
  </div>
</template>
<style scoped>
.order-documents {
  margin: 20px 0;
}
.action-group {
  flex-wrap: wrap;
}
</style>
