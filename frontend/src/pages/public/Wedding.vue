<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { useSeo } from '../../composables/useSeo'
import WeddingRenderer from '../../components/WeddingRenderer.vue'
import PageState from '../../components/PageState.vue'
import WeddingPreviewToolbar from '../../components/WeddingPreviewToolbar.vue'
import { nextTick } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'
const renderer = ref(null)
async function previewSection(key) {
  if (key === 'cover') {
    renderer.value?.showCover()
    window.scrollTo({ top: 0 })
    return
  }
  renderer.value?.showInvitation()
  await nextTick()
  setTimeout(() => scrollToSection(key), 400)
}
const route = useRoute(),
  wedding = ref(null),
  loading = ref(true),
  error = ref('')
async function load() {
  loading.value = true
  error.value = ''
  wedding.value = null
  try {
    const path = route.params.id
      ? `/admin/weddings/${route.params.id}/preview`
      : route.meta.preview
        ? `/templates/${route.params.slug}/preview`
        : `/weddings/${route.params.slug}`
    wedding.value = (await api.get(path)).data.data
  } catch (e) {
    error.value =
      e.response?.status === 404
        ? 'Undangan belum dipublish atau tautannya tidak ditemukan.'
        : errorMessage(e)
  } finally {
    loading.value = false
  }
}
watch(
  () => [route.params.id || '', route.params.slug || '', Boolean(route.meta.preview)].join(':'),
  load,
  { immediate: true },
)
useSeo(() => ({
  title: wedding.value?.title || 'Undangan Pernikahan',
  description: `${wedding.value?.wedding_date || ''} — ${wedding.value?.opening_text || 'Hari bahagia, cerita cinta yang indah.'}`,
  image: wedding.value?.cover_image,
}))
</script>
<template>
  <div>
    <WeddingPreviewToolbar
      v-if="(route.meta.preview || wedding?.is_demo) && wedding"
      :wedding="wedding"
      :wedding-id="route.params.id"
      @section="previewSection"
    />
    <div v-if="loading || error" class="platform wedding-state">
      <PageState
        :loading="loading"
        :error="error"
        title="Undangan belum tersedia"
        @retry="load"
      /><RouterLink v-if="error" to="/" class="p-button secondary">Ke Beranda</RouterLink>
    </div>
    <WeddingRenderer
      v-if="wedding && !loading && !error"
      :key="wedding.slug"
      ref="renderer"
      :start-open="Boolean(route.params.id)"
      :wedding="wedding"
      :preview="Boolean(route.meta.preview || wedding.is_demo)"
    />
  </div>
</template>
