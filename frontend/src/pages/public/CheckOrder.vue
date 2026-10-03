<script setup>
import { ref, reactive } from 'vue'
import { Search } from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import FormField from '../../components/FormField.vue'
import PaymentInstructions from '../../components/PaymentInstructions.vue'
const form = reactive({ order_number: '', whatsapp: '' }),
  pending = ref(false),
  error = ref(''),
  order = ref(null)
async function submit() {
  pending.value = true
  error.value = ''
  order.value = null
  try {
    order.value = (await api.post('/check-order', form)).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <main class="p-container narrow-page">
    <div class="p-centered-heading">
      <p class="p-eyebrow">YOUR INVITATION JOURNEY</p>
      <h1>Bagaimana kabar<br /><em>cerita Anda?</em></h1>
      <p>Cek perkembangan pesanan dengan Order ID dan nomor WhatsApp.</p>
    </div>
    <form class="surface check-order-form" @submit.prevent="submit">
      <FormField
        v-model="form.order_number"
        label="Order ID"
        placeholder="WD-20261003-0001"
        required
      /><FormField v-model="form.whatsapp" label="Nomor WhatsApp" type="tel" required />
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <button class="p-button full-width" :disabled="pending">
        <Search :size="17" />{{ pending ? 'Mencari…' : 'Cek Pesanan' }}
      </button>
    </form>
    <PaymentInstructions v-if="order" :order="order" />
  </main>
</template>
