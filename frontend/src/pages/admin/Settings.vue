<script setup>
import { ref, onMounted } from 'vue'
import { Save } from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { usePlatformStore } from '../../stores/platform'
import { useUiStore } from '../../stores/ui'
import FormField from '../../components/FormField.vue'
import MediaUploader from '../../components/MediaUploader.vue'
import PageState from '../../components/PageState.vue'
const platform = usePlatformStore(),
  ui = useUiStore(),
  form = ref(null),
  loading = ref(true),
  pending = ref(false),
  error = ref('')
const fields = [
  ['company_name', 'Nama platform'],
  ['whatsapp_number', 'WhatsApp admin (format 628…)'],
  ['email', 'Email'],
  ['bank_name', 'Bank utama'],
  ['bank_account', 'Nomor rekening utama'],
  ['bank_account_name', 'Pemilik rekening utama'],
  ['secondary_bank_name', 'Bank kedua (opsional)'],
  ['secondary_bank_account', 'Nomor rekening kedua'],
  ['secondary_bank_account_name', 'Pemilik rekening kedua'],
  ['instagram', 'URL Instagram'],
  ['footer', 'Footer'],
  ['seo_title', 'SEO title'],
  ['seo_description', 'SEO description'],
  ['payment_notice', 'Catatan pembayaran (opsional)'],
]
async function load() {
  try {
    form.value = (await api.get('/admin/settings')).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
async function save() {
  pending.value = true
  error.value = ''
  try {
    platform.settings = (await api.put('/admin/settings', form.value)).data.data
    ui.toast('Pengaturan berhasil disimpan.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <div>
    <div class="admin-title">
      <div>
        <p class="p-eyebrow">PLATFORM SETTINGS</p>
        <h1>Sentuhan Anda, di setiap detail.</h1>
        <p>Identitas platform dan konfigurasi pembayaran.</p>
      </div>
    </div>
    <PageState v-if="loading || !form" :loading="loading" :error="error" @retry="load" />
    <form v-else class="surface settings-form" @submit.prevent="save">
      <MediaUploader v-model="form.logo" collection="logo" label="Upload logo platform" />
      <div class="form-grid">
        <FormField
          v-for="field in fields"
          :key="field[0]"
          v-model="form[field[0]]"
          :label="field[1]"
          :type="
            ['footer', 'seo_description', 'payment_notice'].includes(field[0])
              ? 'textarea'
              : field[0] === 'email'
                ? 'email'
                : 'text'
          "
          :required="
            [
              'company_name',
              'whatsapp_number',
              'email',
              'bank_name',
              'bank_account',
              'bank_account_name',
            ].includes(field[0])
          "
        />
      </div>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <button class="p-button" :disabled="pending">
        <Save :size="16" />{{ pending ? 'Menyimpan…' : 'Simpan Pengaturan' }}
      </button>
    </form>
  </div>
</template>
