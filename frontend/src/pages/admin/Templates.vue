<script setup>
import { templateOptions } from '../../templates/templateRegistry'
import { ref, reactive, onMounted } from 'vue'
import { Plus, PenLine } from 'lucide-vue-next'
import { api, errorMessage, formatMoney } from '../../services/api'
import { usePlatformStore } from '../../stores/platform'
import { useUiStore } from '../../stores/ui'
import FormField from '../../components/FormField.vue'
import MediaUploader from '../../components/MediaUploader.vue'
import BaseModal from '../../components/BaseModal.vue'
import PageState from '../../components/PageState.vue'
const platform = usePlatformStore(),
  ui = useUiStore(),
  templates = ref([]),
  loading = ref(true),
  error = ref(''),
  pending = ref(false),
  open = ref(false),
  id = ref(null),
  featureText = ref('')
const form = reactive({})
async function load() {
  try {
    templates.value = (await api.get('/admin/templates')).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
function edit(template) {
  id.value = template?.id || null
  Object.assign(
    form,
    template || {
      name: '',
      slug: '',
      description: '',
      price: 0,
      category_id: platform.categories[0]?.id || '',
      component_name: 'RomanticFloralTemplate.vue',
      template_key: 'romantic-floral',
      status: 'ACTIVE',
      is_featured: false,
      thumbnail: '',
      preview_image: '',
      features: [],
    },
  )
  form.component_name =
    templateOptions.find((x) => x.value === form.template_key)?.component || form.component_name
  featureText.value = (form.features || []).join('\n')
  error.value = ''
  open.value = true
}
async function save() {
  pending.value = true
  try {
    const data = {
      ...form,
      template_key:
        templateOptions.find((x) => x.component === form.component_name)?.value ||
        'romantic-floral',
      features: featureText.value
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
    }
    if (id.value) await api.put(`/admin/templates/${id.value}`, data)
    else await api.post('/admin/templates', data)
    open.value = false
    await load()
    ui.toast('Template berhasil disimpan.')
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
        <p class="p-eyebrow">TEMPLATE COLLECTION</p>
        <h1>Desain untuk setiap cerita.</h1>
        <p>Atur harga, kategori, dan ketersediaan template.</p>
      </div>
      <button class="p-button" @click="edit()"><Plus :size="17" />Tambah Template</button>
    </div>
    <PageState v-if="loading" loading />
    <div v-else class="admin-template-grid">
      <article v-for="template in templates" :key="template.id" class="surface admin-template-card">
        <img v-if="template.thumbnail" :src="template.thumbnail" :alt="template.name" />
        <div>
          <p class="p-eyebrow">
            {{ template.category?.name }} ·
            {{ template.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif' }}
          </p>
          <h2>{{ template.name }}</h2>
          <p>{{ formatMoney(template.price) }}</p>
          <button class="p-button secondary" @click="edit(template)">
            <PenLine :size="15" />Edit Template
          </button>
          <RouterLink v-if="template.status === 'ACTIVE'" class="p-button secondary" :to="`/templates/${template.slug}/preview`" target="_blank">Live Preview</RouterLink>
        </div>
      </article>
    </div>
    <p v-if="error && !open" class="alert error">{{ error }}</p>
    <BaseModal :open="open" title="Kelola template" @close="open = false"
      ><form class="platform" @submit.prevent="save">
        <h2>{{ id ? 'Edit' : 'Tambah' }} Template</h2>
        <FormField v-model="form.name" label="Nama template" required /><FormField
          v-model="form.slug"
          label="Slug"
          required
        /><FormField
          v-model="form.description"
          label="Deskripsi"
          type="textarea"
          required
        /><FormField v-model="form.price" label="Harga (Rp)" type="number" required /><FormField
          v-model="form.category_id"
          label="Kategori"
          type="select"
          :options="platform.categories.map((x) => ({ value: x.id, label: x.name }))"
        /><FormField
          v-model="form.component_name"
          label="Komponen template"
          type="select"
          :options="templateOptions.map((x) => ({ value: x.component, label: x.label }))"
        /><FormField
          v-model="form.status"
          label="Status"
          type="select"
          :options="[
            { value: 'ACTIVE', label: 'Aktif' },
            { value: 'DISABLED', label: 'Nonaktif' },
          ]"
        /><label class="toggle-row"
          ><span>Tampilkan sebagai unggulan</span
          ><input v-model="form.is_featured" type="checkbox" /></label
        ><MediaUploader
          v-model="form.thumbnail"
          collection="templates"
          label="Upload thumbnail"
        /><MediaUploader
          v-model="form.preview_image"
          collection="templates"
          label="Upload preview"
        /><FormField v-model="featureText" label="Fitur (satu per baris)" type="textarea" />
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <button class="p-button full-width" :disabled="pending">
          {{ pending ? 'Menyimpan…' : 'Simpan Template' }}
        </button>
      </form></BaseModal
    >
  </div>
</template>
