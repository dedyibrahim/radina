<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventOptions } from '../../services/invitationEvents'
import { Search } from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { usePlatformStore } from '../../stores/platform'
import TemplateCard from '../../components/TemplateCard.vue'
import PageState from '../../components/PageState.vue'
import { useSeo } from '../../composables/useSeo'
import { useTemplateCollection } from '../../composables/useTemplateCollection'
import TemplateComparison from '../../components/TemplateComparison.vue'
const route = useRoute(),
  router = useRouter()
const eventType = ref(
  eventOptions.some((option) => option.value === route.query.event_type)
    ? route.query.event_type
    : 'wedding',
)
watch(eventType, (value) =>
  router.replace({
    query: {
      ...route.query,
      event_type: value === 'wedding' ? undefined : value,
    },
  }),
)
const { favorites, comparison, message } = useTemplateCollection()
const showComparison = ref(false),
  favoritesOnly = ref(false)
const displayedTemplates = computed(() =>
  favoritesOnly.value
    ? templates.value.filter((t) => favorites.value.includes(t.template_key))
    : templates.value,
)
const platform = usePlatformStore(),
  search = ref(''),
  category = ref(route.query.category || ''),
  sort = ref('popular'),
  templates = ref([]),
  loading = ref(true),
  error = ref(''),
  page = ref(1),
  hasMore = ref(false)
let timer,
  sequence = 0
async function load(append = false) {
  const current = ++sequence
  loading.value = true
  error.value = ''
  try {
    const result = await api.get('/templates', {
      params: {
        search: search.value,
        category: category.value,
        sort: sort.value,
        page: page.value,
        favorites: favoritesOnly.value,
        favorite_keys: favoritesOnly.value ? favorites.value : undefined,
      },
    })
    if (current !== sequence) return
    templates.value = append ? [...templates.value, ...result.data.data] : result.data.data
    hasMore.value = result.data.meta.current_page < result.data.meta.last_page
  } catch (e) {
    if (current === sequence) error.value = errorMessage(e)
  } finally {
    if (current === sequence) loading.value = false
  }
}
function loadMore() {
  page.value++
  load(true)
}
watch(
  [
    search,
    category,
    sort,
    favoritesOnly,
    () => (favoritesOnly.value ? favorites.value.join(',') : ''),
  ],
  () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      page.value = 1
      load()
    }, 250)
  },
)
onMounted(() => load())
onUnmounted(() => clearTimeout(timer))
useSeo(() => ({
  title: `Koleksi Template — ${platform.settings.company_name || 'Radina'}`,
  description:
    'Temukan undangan digital untuk pernikahan, khitanan, acara kantor, ulang tahun, aqiqah, dan acara lainnya.',
}))
</script>
<template>
  <main class="p-container marketplace-page">
    <div class="p-centered-heading">
      <p class="p-eyebrow">THE INVITATION COLLECTION</p>
      <h1>Untuk setiap kisah,<br /><em>ada desain yang indah.</em></h1>
      <p>Pilih yang paling dekat dengan hati Anda.</p>
    </div>
    <div class="market-toolbar">
      <label class="form-field"
        >Jenis acara<select v-model="eventType" aria-label="Jenis acara">
          <option v-for="option in eventOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select></label
      >
      <label class="search-control"
        ><Search :size="18" /><input
          v-model="search"
          aria-label="Cari template"
          placeholder="Cari template…" /></label
      ><select v-model="sort" class="control" aria-label="Urutkan template">
        <option value="popular">Populer</option>
        <option value="newest">Terbaru</option>
        <option value="price-asc">Harga terendah</option>
        <option value="price-desc">Harga tertinggi</option>
      </select>
    </div>
    <div class="category-tabs">
      <button :class="{ selected: favoritesOnly }" @click="favoritesOnly = !favoritesOnly">
        ♡ Favorit saya
      </button>
      <button :class="{ selected: !category }" @click="category = ''">Semua</button
      ><button
        v-for="cat in platform.categories"
        :key="cat.id"
        :class="{ selected: category === cat.slug }"
        @click="category = cat.slug"
      >
        {{ cat.name }}
      </button>
    </div>
    <PageState v-if="error" :error="error" @retry="load()" />
    <div v-else-if="loading && !templates.length" class="template-grid">
      <div v-for="i in 3" :key="i" class="skeleton template-skeleton"></div>
    </div>
    <div v-else-if="displayedTemplates.length" class="template-grid">
      <TemplateCard
        v-for="template in displayedTemplates"
        :key="template.id"
        :template="template"
        :event-type="eventType"
      />
    </div>
    <PageState v-else title="Belum ada desain dalam kategori ini" /><button
      v-if="hasMore"
      class="p-button secondary load-more"
      :disabled="loading"
      @click="loadMore"
    >
      {{ loading ? 'Memuat…' : 'Lihat lebih banyak' }}
    </button>
    <p v-if="message" class="collection-message" role="status">
      {{ message }}
    </p>
    <div v-if="comparison.length" class="comparison-tray">
      <span>{{ comparison.length }} / 3 desain dipilih</span
      ><button class="p-button" @click="showComparison = true">Bandingkan</button>
    </div>
    <TemplateComparison
      :open="showComparison"
      :event-type="eventType"
      @close="showComparison = false"
    />
  </main>
</template>
<style>
.comparison-tray {
  position: sticky;
  bottom: 20px;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fff9f5f5;
  border: 1px solid #d7a98c;
  border-radius: 18px;
  padding: 12px 18px;
  box-shadow: 0 8px 35px #2c1b1820;
  margin: 30px auto;
  max-width: 520px;
  font-size: 12px;
}
.comparison-tray .p-button {
  padding: 12px;
}
.collection-message {
  font-size: 13px;
  color: #6d4036;
  margin: 20px 0;
}
.marketplace-page .category-tabs {
  flex-wrap: wrap;
}
</style>
