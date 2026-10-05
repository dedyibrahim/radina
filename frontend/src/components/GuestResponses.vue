<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { RefreshCw, Search, Users, MessageCircle } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
import { useUiStore } from '../stores/ui'

const props = defineProps({ base: { type: String, required: true }, admin: Boolean })
const ui = useUiStore()
const searchDraft = ref(''),
  search = ref(''),
  moderationError = ref('')
const kinds = ['rsvps', 'wishes']
const empty = () => ({ records: [], total: 0, nextPage: null, loading: false, error: '' })
const lists = reactive({ rsvps: empty(), wishes: empty() })
const moderating = reactive(new Set())
const controllers = new Map()
const busy = computed(() => kinds.some((kind) => lists[kind].loading) || moderating.size > 0)
let revision = 0

function cancel() {
  revision++
  for (const controller of controllers.values()) controller.abort()
  controllers.clear()
}
async function load(kind, page = 1, append = false) {
  const currentRevision = revision,
    base = props.base,
    query = search.value
  const controller = new AbortController()
  controllers.get(kind)?.abort()
  controllers.set(kind, controller)
  const list = lists[kind]
  list.loading = true
  list.error = ''
  try {
    const result = (
      await api.get(`${base}/${kind}`, {
        params: { page, search: query },
        signal: controller.signal,
      })
    ).data
    if (revision !== currentRevision || controller.signal.aborted) return
    list.records = append ? [...list.records, ...result.data] : result.data
    list.total = result.total
    list.nextPage = result.current_page < result.last_page ? result.current_page + 1 : null
  } catch (error) {
    if (revision === currentRevision && !controller.signal.aborted) list.error = errorMessage(error)
  } finally {
    if (revision === currentRevision && controllers.get(kind) === controller) {
      list.loading = false
      controllers.delete(kind)
    }
  }
}
async function refresh() {
  cancel()
  moderationError.value = ''
  for (const kind of kinds) Object.assign(lists[kind], empty())
  await Promise.allSettled(kinds.map((kind) => load(kind)))
}
function find() {
  search.value = searchDraft.value.trim()
  refresh()
}
watch(
  () => props.base,
  () => {
    searchDraft.value = ''
    search.value = ''
    refresh()
  },
  { immediate: true },
)
onUnmounted(cancel)
async function moderate(wish) {
  if (!props.admin || moderating.has(wish.id)) return
  const currentRevision = revision
  moderationError.value = ''
  moderating.add(wish.id)
  try {
    const result = (await api.patch(`${props.base}/wishes/${wish.id}`, { visible: !wish.visible }))
      .data.data
    if (currentRevision !== revision) return
    wish.visible = result.visible
    ui.toast('Visibilitas ucapan diperbarui.')
  } catch (error) {
    if (currentRevision === revision) moderationError.value = errorMessage(error)
  } finally {
    moderating.delete(wish.id)
  }
}
function date(value) {
  return new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}
</script>

<template>
  <div class="guest-responses">
    <div class="responses-heading">
      <div>
        <h2>RSVP &amp; Ucapan</h2>
        <p class="panel-subtitle">Konfirmasi kehadiran, ucapan, dan doa tamu dalam satu halaman.</p>
      </div>
      <button type="button" class="p-button secondary" :disabled="busy" @click="refresh">
        <RefreshCw :size="16" />Muat Data Terbaru
      </button>
    </div>
    <p v-if="moderationError" class="alert error" role="alert">{{ moderationError }}</p>
    <form class="responses-search" @submit.prevent="find">
      <label for="guest-response-search">Cari nama tamu pada RSVP dan ucapan</label>
      <div>
        <input
          id="guest-response-search"
          v-model="searchDraft"
          type="search"
          maxlength="120"
          placeholder="Nama tamu"
          :disabled="busy"
        />
        <button type="submit" class="p-button secondary" :disabled="busy">
          <Search :size="16" />Cari
        </button>
      </div>
    </form>
    <div class="responses-grid">
      <section
        v-for="kind in kinds"
        :key="kind"
        class="responses-panel"
        :aria-busy="lists[kind].loading"
      >
        <header>
          <h3>
            <Users v-if="kind === 'rsvps'" :size="19" /><MessageCircle v-else :size="19" />{{
              kind === 'rsvps' ? 'Konfirmasi kehadiran' : 'Ucapan & doa'
            }}
          </h3>
          <span class="responses-count"
            >{{ lists[kind].total }} {{ kind === 'rsvps' ? 'konfirmasi' : 'ucapan' }}</span
          >
        </header>
        <p v-if="lists[kind].error" class="alert error" role="alert">{{ lists[kind].error }}</p>
        <p
          v-if="lists[kind].loading && !lists[kind].records.length"
          class="empty-note"
          role="status"
        >
          Memuat {{ kind === 'rsvps' ? 'konfirmasi kehadiran' : 'ucapan' }}…
        </p>
        <p v-else-if="!lists[kind].records.length && !lists[kind].error" class="empty-note">
          {{
            search
              ? 'Tidak ada hasil untuk nama tersebut.'
              : kind === 'rsvps'
                ? 'Belum ada konfirmasi kehadiran.'
                : 'Belum ada ucapan dari tamu.'
          }}
        </p>
        <article v-for="record in lists[kind].records" :key="record.id" class="response-card">
          <div class="response-name">
            <strong>{{ record.name }}</strong>
            <span
              v-if="kind === 'rsvps'"
              class="response-badge"
              :class="{ attending: record.attendance === 'Hadir' }"
              >{{ record.attendance }}</span
            >
            <span v-else class="response-badge" :class="{ hidden: !record.visible }">{{
              record.visible ? 'Tampil di undangan' : 'Disembunyikan dari undangan'
            }}</span>
          </div>
          <p v-if="kind === 'rsvps'" class="response-guests">
            Jumlah tamu: {{ record.guests }} orang
          </p>
          <p v-if="record.message" class="response-message">{{ record.message }}</p>
          <time :datetime="record.created_at">{{ date(record.created_at) }} WIB</time>
          <button
            v-if="admin && kind === 'wishes'"
            type="button"
            class="p-button secondary small"
            :disabled="moderating.has(record.id)"
            @click="moderate(record)"
          >
            {{
              moderating.has(record.id)
                ? 'Menyimpan…'
                : record.visible
                  ? 'Sembunyikan'
                  : 'Tampilkan'
            }}
          </button>
        </article>
        <button
          v-if="lists[kind].error"
          type="button"
          class="p-button secondary"
          :disabled="busy"
          @click="load(kind, lists[kind].nextPage || 1, Boolean(lists[kind].nextPage))"
        >
          Coba Lagi
        </button>
        <button
          v-else-if="lists[kind].nextPage"
          type="button"
          class="p-button secondary"
          :disabled="busy"
          @click="load(kind, lists[kind].nextPage, true)"
        >
          {{
            lists[kind].loading
              ? 'Memuat…'
              : kind === 'rsvps'
                ? 'Muat RSVP Lainnya'
                : 'Muat Ucapan Lainnya'
          }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.responses-heading,
.responses-panel > header,
.response-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.responses-heading h2 {
  margin-bottom: 10px;
}
.responses-heading .panel-subtitle {
  margin-bottom: 0;
}
.responses-search {
  margin: 24px 0;
}
.responses-search label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
}
.responses-search > div {
  display: flex;
  gap: 10px;
}
.responses-search input {
  flex: 1;
  min-width: 0;
  border: 1px solid #d8dfcd;
  background: #fffef9;
  padding: 12px;
  border-radius: 6px;
  font: inherit;
}
.responses-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.responses-panel {
  min-width: 0;
  border: 1px solid #d8dfcd;
  border-radius: 10px;
  padding: 20px;
}
.responses-panel > header {
  margin-bottom: 20px;
}
.responses-panel h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.responses-panel h3 svg {
  flex-shrink: 0;
}
.responses-count,
.response-badge {
  font-size: 11px;
  background: #f3f5ed;
  color: #617d47;
  padding: 6px 10px;
  border-radius: 20px;
}
.response-card {
  padding: 18px 0;
  border-top: 1px solid #e3e9d9;
  overflow-wrap: anywhere;
}
.response-name strong {
  font-size: 14px;
}
.response-badge {
  background: #fbf0e8;
  color: #916354;
}
.response-badge.attending {
  background: #e3ecd5;
  color: #526949;
}
.response-badge.hidden {
  background: #f1f0ed;
  color: #746d66;
}
.response-guests {
  font-size: 12px;
  margin-top: 10px;
}
.response-message {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.8;
  margin-top: 12px;
}
.response-card time {
  display: block;
  font-size: 11px;
  color: #829871;
  margin: 12px 0;
}
.empty-note {
  font-size: 13px;
  line-height: 1.8;
}
@media (max-width: 850px) {
  .responses-grid {
    grid-template-columns: 1fr;
  }
  .responses-panel {
    padding: 16px;
  }
  .responses-heading > .p-button {
    width: 100%;
  }
}
</style>
