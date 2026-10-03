<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Eye, ArrowUpRight, Check, Smartphone, ArrowLeft } from 'lucide-vue-next'
import { api, errorMessage, formatMoney } from '../../services/api'
import PageState from '../../components/PageState.vue'
import { useSeo } from '../../composables/useSeo'
const route = useRoute(),
  template = ref(null),
  loading = ref(true),
  error = ref('')
async function load() {
  loading.value = true
  error.value = ''
  try {
    template.value = (await api.get(`/templates/${route.params.slug}`)).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
useSeo(() => ({
  title: `${template.value?.name || 'Template'} — Radina`,
  description: template.value?.description,
  image: template.value?.thumbnail,
}))
</script>
<template>
  <main class="p-container detail-page">
    <RouterLink to="/templates" class="text-link"
      ><ArrowLeft :size="16" />Kembali ke koleksi</RouterLink
    ><PageState v-if="loading || error" :loading="loading" :error="error" @retry="load" />
    <div v-else class="template-detail-grid">
      <div class="detail-photo">
        <img :src="template.preview_image || template.thumbnail" :alt="template.name" /><span
          >Designed for your forever.</span
        >
      </div>
      <div class="detail-copy">
        <p class="p-eyebrow">{{ template.category?.name }} COLLECTION</p>
        <h1>{{ template.name }}</h1>
        <p>{{ template.description }}</p>
        <div class="detail-price">{{ formatMoney(template.price) }}<small>per undangan</small></div>
        <div class="detail-features">
          <span v-for="feature in template.features" :key="feature"
            ><Check :size="16" />{{ feature }}</span
          >
        </div>
        <p class="detail-mobile-note">
          <Smartphone :size="16" />Indah di smartphone, tablet, dan desktop.
        </p>
        <RouterLink :to="`/templates/${template.slug}/preview`" class="p-button secondary"
          ><Eye :size="17" />Preview Undangan</RouterLink
        ><RouterLink :to="`/order/${template.slug}`" class="p-button"
          >Gunakan Template Ini<ArrowUpRight :size="17"
        /></RouterLink>
      </div>
    </div>
  </main>
</template>
