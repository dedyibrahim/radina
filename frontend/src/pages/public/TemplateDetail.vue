<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Eye, ArrowUpRight, Check, Smartphone, ArrowLeft } from 'lucide-vue-next'
import { api, errorMessage, formatMoney } from '../../services/api'
import PageState from '../../components/PageState.vue'
import { useSeo } from '../../composables/useSeo'
import { eventOptions } from '../../services/invitationEvents'
const route = useRoute(),
  template = ref(null),
  loading = ref(true),
  error = ref('')
const eventType = ref(
  eventOptions.some((option) => option.value === route.query.event_type)
    ? route.query.event_type
    : 'wedding',
)
const eventQuery = computed(() =>
  eventType.value === 'wedding' ? '' : `?event_type=${eventType.value}`,
)
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
          >Dirancang untuk momen istimewa Anda.</span
        >
      </div>
      <div class="detail-copy">
        <p class="p-eyebrow">{{ template.category?.name }} COLLECTION</p>
        <h1>{{ template.name }}</h1>
        <p>{{ template.description }}</p>
        <label class="form-field"
          >Jenis acara<select v-model="eventType" aria-label="Jenis acara">
            <option v-for="option in eventOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select></label
        >
        <div class="detail-price">{{ formatMoney(template.price) }}<small>per undangan</small></div>
        <div class="detail-features">
          <span v-for="feature in template.features" :key="feature"
            ><Check :size="16" />{{ feature }}</span
          >
        </div>
        <p class="detail-mobile-note">
          <Smartphone :size="16" />Indah di smartphone, tablet, dan desktop.
        </p>
        <RouterLink
          :to="`/templates/${template.slug}/preview${eventQuery}`"
          class="p-button secondary"
          ><Eye :size="17" />Preview Undangan</RouterLink
        ><RouterLink :to="`/order/${template.slug}${eventQuery}`" class="p-button"
          >Gunakan Template Ini<ArrowUpRight :size="17"
        /></RouterLink>
      </div>
    </div>
  </main>
</template>
