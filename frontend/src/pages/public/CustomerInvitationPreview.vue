<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { api, errorMessage } from '../../services/api'
import WeddingRenderer from '../../components/WeddingRenderer.vue'
import PageState from '../../components/PageState.vue'

const route = useRoute(),
  preview = ref(null),
  loading = ref(true),
  error = ref('')
function notify(data) {
  if (window.parent !== window)
    window.parent.postMessage(
      { type: 'radina:customer-preview', ...data },
      window.location.origin,
    )
}
onMounted(async () => {
  try {
    preview.value = (
      await api.get(`/customer-portals/${route.params.token}/preview`)
    ).data.data
  } catch (e) {
    error.value = errorMessage(e)
    notify({ error: error.value })
  } finally {
    loading.value = false
  }
})
async function ready() {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
  notify({ fingerprint: preview.value.fingerprint })
}
</script>
<template>
  <PageState
    v-if="loading || error"
    :loading="loading"
    :error="error"
    title="Preview belum tersedia"
  />
  <WeddingRenderer
    v-else-if="preview"
    :wedding="preview.wedding"
    preview
    @ready="ready"
  />
</template>
