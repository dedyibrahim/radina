<script setup>
import EventDetailsForm from '../../components/EventDetailsForm.vue'
import {
  eventOptions,
  eventProfile,
  agendaOptions,
} from '../../services/invitationEvents'
import MusicSelector from '../../components/MusicSelector.vue'
import SectionManager from '../../components/SectionManager.vue'
import WeddingGiftManager from '../../components/WeddingGiftManager.vue'
import WeddingRenderer from '../../components/WeddingRenderer.vue'
import WeddingImportExport from '../../components/WeddingImportExport.vue'
import WeddingAnalytics from '../../components/WeddingAnalytics.vue'
import GuestResponses from '../../components/GuestResponses.vue'
import CustomerPortalManager from '../../components/CustomerPortalManager.vue'
import { nextTick } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import {
  Save,
  Eye,
  Send,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  ExternalLink,
} from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { useUiStore } from '../../stores/ui'
import FormField from '../../components/FormField.vue'
import MediaUploader from '../../components/MediaUploader.vue'
import BaseModal from '../../components/BaseModal.vue'
import PageState from '../../components/PageState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
const route = useRoute(),
  ui = useUiStore(),
  form = ref(null),
  templates = ref([]),
  loading = ref(true),
  pending = ref(false),
  error = ref(''),
  tab = ref(route.meta.section || 'basic'),
  baseline = ref(''),
  confirmPublish = ref(false),
  previewed = ref(false)
const window = globalThis.window
const baseTabs = [
  ['basic', 'Informasi Dasar'],
  ['customer', 'Pelanggan'],
  ['import-export', 'Impor / Ekspor'],
  ['template', 'Template'],
  ['sections', 'Section Manager'],
  ['couple', 'Pengantin'],
  ['events', 'Acara'],
  ['story', 'Love Story'],
  ['gallery', 'Gallery'],
  ['music', 'Music'],
  ['gift', 'Wedding Gift'],
  ['livestream', 'Live Streaming'],
  ['analytics', 'Statistik & Tamu'],
  ['responses', 'RSVP & Ucapan'],
  ['settings', 'Pengaturan'],
  ['preview', 'Preview'],
  ['publish', 'Publish'],
]
const baseBasicFields = [
  ['title', 'Judul Undangan', 'text'],
  ['wedding_date', 'Tanggal Pernikahan', 'date'],
  ['hashtag', 'Wedding Hashtag', 'text'],
  ['opening_text', 'Opening Text', 'textarea'],
  ['quote', 'Wedding Quote', 'textarea'],
  ['quote_source', 'Quote Source', 'text'],
  ['closing_text', 'Closing Text', 'textarea'],
]
const coupleFields = [
  ['full_name', 'Nama Lengkap'],
  ['nickname', 'Nama Panggilan'],
  ['father_name', 'Nama Ayah'],
  ['mother_name', 'Nama Ibu'],
  ['family_order', 'Keterangan keluarga (contoh: Putri pertama dari)'],
  ['instagram', 'Instagram (tanpa @)'],
]
const featureLabels = {
  music: 'Musik',
  countdown: 'Countdown',
  story: 'Love Story',
  gallery: 'Gallery',
  video: 'Video',
  maps: 'Maps',
  rsvp: 'RSVP',
  wishes: 'Wishes',
  gift: 'Wedding Gift',
  livestream: 'Livestream',
}
const isWedding = computed(
  () => !form.value?.event_type || form.value.event_type === 'wedding',
)
const profile = computed(() => eventProfile(form.value?.event_type))
const tabs = computed(() =>
  baseTabs.map(([key, label]) => [
    key,
    !isWedding.value
      ? { couple: 'Data Acara', story: 'Tentang Acara', gift: 'Hadiah' }[key] ||
        label
      : label,
  ]),
)
const basicFields = computed(() =>
  baseBasicFields.map(([key, label, type]) => [
    key,
    !isWedding.value
      ? {
          wedding_date: 'Tanggal Acara',
          hashtag: 'Hashtag Acara',
          quote: 'Kutipan',
        }[key] || label
      : label,
    type,
  ]),
)
const dirty = computed(
  () => form.value && JSON.stringify(form.value) !== baseline.value,
)
const checklist = computed(() =>
  form.value
    ? [
        {
          label: isWedding.value ? 'Pengantin' : 'Data Acara',
          done: isWedding.value
            ? Boolean(form.value.bride.full_name && form.value.groom.full_name)
            : Boolean(
                form.value.event_details.host_name &&
                (!profile.value.honoree ||
                  form.value.event_details.honoree_name),
              ),
        },
        { label: 'Tanggal', done: Boolean(form.value.wedding_date) },
        { label: 'Acara', done: form.value.events.length > 0 },
        {
          label: 'Gallery',
          done:
            !form.value.settings.enable_gallery ||
            form.value.gallery.length > 0,
        },
        {
          label: 'Music',
          done:
            !form.value.settings.enable_music ||
            Boolean(form.value.music.music_url),
        },
        {
          label: 'Gift',
          done:
            !form.value.settings.enable_gift ||
            form.value.gift_methods.length > 0 ||
            Boolean(form.value.shipping_gift.address),
        },
        { label: 'Preview', done: previewed.value },
        { label: 'Publish', done: form.value.status === 'PUBLISHED' },
      ]
    : [],
)
const progress = computed(() =>
  Math.round(
    (checklist.value.filter((x) => x.done).length /
      Math.max(1, checklist.value.length)) *
      100,
  ),
)
function normalize(data) {
  const result = JSON.parse(JSON.stringify(data))
  result.events = result.events.map((event, index) => ({
    ...event,
    is_visible: event.is_visible ?? true,
    show_on_map: event.show_on_map ?? index === 0,
    start_time: event.start_time.slice(0, 5),
    end_time: event.end_time.slice(0, 5),
  }))
  result.event_type ||= 'wedding'
  result.event_details ||= {}
  result.settings.enable_parents ??= true
  result.settings.enable_family ??= result.settings.enable_parents
  result.settings.enable_social ??= true
  result.section_content ||= {}
  result.music.playlist ||= []
  result.gift_methods ||= []
  result.shipping_gift ||= { recipient: '', address: '', phone: '' }
  for (const role of ['bride', 'groom'])
    result[role] ||= {
      full_name: '',
      nickname: '',
      father_name: '',
      mother_name: '',
      photo: '',
      instagram: '',
      family_order: '',
    }
  return result
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const [w, t] = await Promise.all([
      api.get(`/admin/weddings/${route.params.id}`),
      api.get('/admin/templates'),
    ])
    form.value = normalize(w.data.data)
    templates.value = t.data.data
    baseline.value = JSON.stringify(form.value)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
async function save() {
  if (pending.value) return false
  pending.value = true
  error.value = ''
  const snapshot = JSON.stringify(form.value),
    data = JSON.parse(snapshot)
  try {
    const result = (
      await api.put(`/admin/weddings/${route.params.id}`, {
        ...data,
        template_id: Number(data.template_id),
        expected_updated_at: data.updated_at,
      })
    ).data.data
    if (JSON.stringify(form.value) === snapshot) {
      form.value = normalize(result)
      baseline.value = JSON.stringify(form.value)
    } else {
      form.value.updated_at = result.updated_at
      const saved = normalize(result)
      baseline.value = JSON.stringify(saved)
    }
    ui.toast('Konten undangan berhasil disimpan.')
    return true
  } catch (e) {
    error.value = errorMessage(e)
    return false
  } finally {
    pending.value = false
  }
}
function reorder(list, index, direction) {
  const next = index + direction
  if (next < 0 || next >= list.length) return
  ;[list[index], list[next]] = [list[next], list[index]]
}
function addEvent() {
  form.value.events.push({
    is_visible: true,
    show_on_map: form.value.events.length === 0,
    type: isWedding.value ? 'reception' : 'other',
    title: '',
    date: form.value.wedding_date || '',
    start_time: '11:00',
    end_time: '14:00',
    timezone: 'Asia/Jakarta',
    venue: '',
    address: '',
    google_maps_url: '',
  })
}
function addStory() {
  form.value.stories.push({
    date_label: '',
    title: '',
    description: '',
    image: '',
  })
}
function addGift() {
  form.value.gifts.push({
    bank: '',
    account_number: '',
    account_name: '',
    logo: '',
  })
}
function addGallery(media) {
  form.value.gallery.push(
    ...media.map((item) => ({ image: item.url, caption: '' })),
  )
}
async function openPreview() {
  tab.value = 'preview'
  previewed.value = true
}
async function publish() {
  if (dirty.value && !(await save())) return
  pending.value = true
  error.value = ''
  try {
    form.value = normalize(
      (await api.post(`/admin/weddings/${route.params.id}/publish`)).data.data,
    )
    baseline.value = JSON.stringify(form.value)
    confirmPublish.value = false
    ui.toast('Undangan dipublish dan siap dibagikan.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
watch(tab, () => {
  error.value = ''
})
function beforeUnload(event) {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
window.addEventListener('beforeunload', beforeUnload)
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(
  () =>
    !dirty.value ||
    window.confirm('Ada perubahan belum disimpan. Tetap tinggalkan halaman?'),
)

const templatePicker = ref(false),
  selectedTemplate = ref(null),
  liveRenderer = ref(null)
const previewWedding = computed(() => ({
  ...form.value,
  template:
    templates.value.find((t) => t.id === Number(form.value?.template_id)) ||
    form.value?.template,
}))
function giftsUpdated(result) {
  form.value.gift_methods = result.methods
  form.value.updated_at = result.updated_at
  const previous = JSON.parse(baseline.value)
  previous.gift_methods = JSON.parse(JSON.stringify(result.methods))
  previous.updated_at = result.updated_at
  baseline.value = JSON.stringify(previous)
}
function contentImported(result) {
  form.value = normalize(result)
  baseline.value = JSON.stringify(form.value)
}
function requestTemplate(t) {
  templatePicker.value = false
  selectedTemplate.value = t
}
async function chooseTemplate() {
  form.value.template_id = selectedTemplate.value.id
  selectedTemplate.value = null
  templatePicker.value = false
  ui.toast('Template dipilih. Simpan untuk menerapkan pada undangan publik.')
  tab.value = 'preview'
  previewed.value = true
}
async function liveSection(key) {
  if (key === 'cover') {
    liveRenderer.value?.showCover()
    return
  }
  liveRenderer.value?.showInvitation()
  await nextTick()
  setTimeout(() => scrollToSection(key), 400)
}
watch(tab, (value) => {
  if (value === 'preview') previewed.value = true
})
</script>
<template>
  <div>
    <PageState
      v-if="loading || !form"
      :loading="loading"
      :error="error"
      @retry="load"
    /><template v-else
      ><div class="admin-title editor-title">
        <div>
          <p class="p-eyebrow">
            {{ isWedding ? 'WEDDING STUDIO' : 'INVITATION STUDIO' }}
            ? {{ profile.label }}
          </p>
          <h1>
            {{
              isWedding
                ? `${form.bride.nickname || form.bride.full_name} & ${form.groom.nickname || form.groom.full_name}`
                : form.title
            }}
          </h1>
          <div class="editor-state">
            <StatusBadge :status="form.status" /><span
              :class="{ unsaved: dirty }"
              role="status"
              >{{
                pending ? 'Menyimpan…' : dirty ? 'Belum disimpan' : 'Tersimpan'
              }}</span
            >
          </div>
        </div>
        <div class="action-group">
          <button
            class="p-button secondary"
            :disabled="pending"
            @click="openPreview"
          >
            <Eye :size="16" />Preview</button
          ><button class="p-button" :disabled="pending || !dirty" @click="save">
            <Save :size="16" />Simpan
          </button>
        </div>
      </div>
      <div class="completion surface">
        <div>
          <strong>Kelengkapan undangan</strong><span>{{ progress }}%</span>
        </div>
        <progress :value="progress" max="100"></progress>
        <ul>
          <li
            v-for="item in checklist"
            :key="item.label"
            :class="{ complete: item.done }"
          >
            <Check v-if="item.done" :size="12" /><span v-else>○</span
            >{{ item.label }}
          </li>
        </ul>
      </div>
      <nav class="editor-tabs" aria-label="Bagian editor">
        <button
          v-for="item in tabs"
          :key="item[0]"
          :class="{ selected: tab === item[0] }"
          :disabled="pending"
          @click="item[0] === 'preview' ? openPreview() : (tab = item[0])"
        >
          {{ item[1] }}
        </button>
      </nav>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <section class="surface editor-panel">
        <template v-if="tab === 'basic'"
          ><h2>Informasi dasar</h2>
          <p class="panel-subtitle">
            Cerita Anda, dimulai dari detail yang personal.
          </p>
          <div class="form-grid">
            <label class="form-field"
              >Jenis acara<select
                v-model="form.event_type"
                aria-label="Jenis acara"
              >
                <option
                  v-for="option in eventOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select></label
            >
            <FormField
              v-for="field in basicFields"
              :key="field[0]"
              v-model="form[field[0]]"
              :label="field[1]"
              :type="field[2]"
              :required="field[0] === 'title'"
            /><FormField
              v-model="form.slug"
              label="Slug undangan"
              required
            /><button
              class="p-button secondary small"
              @click="tab = 'template'"
            >
              Ganti Template
            </button>
          </div>
          <div class="media-grid">
            <div
              v-for="[key, label] in [
                ['cover_image', 'Cover'],
                ['hero_image', 'Hero'],
                ['closing_image', 'Closing'],
              ]"
              :key="key"
            >
              <h3>Foto {{ label }}</h3>
              <MediaUploader
                v-model="form[key]"
                :wedding-id="form.id"
                collection="covers"
                :label="`Upload foto ${label}`"
              />
            </div>
          </div>
          <h3>
            {{ isWedding ? 'Video prewedding' : 'Video acara' }}
          </h3>
          <FormField
            v-model="form.video_url"
            label="URL MP4 atau YouTube"
            type="url" /><MediaUploader
            v-model="form.video_url"
            :wedding-id="form.id"
            collection="video"
            label="Upload video MP4"
        /></template>
        <WeddingAnalytics
          v-else-if="tab === 'analytics'"
          :base="`/admin/weddings/${form.id}`"
          :wedding-id="form.id"
          admin
        />
        <WeddingImportExport
          v-else-if="tab === 'import-export'"
          :wedding="form"
          :blocked="Boolean(dirty) || pending"
          @updated="contentImported"
          @busy="pending = $event"
        />
        <CustomerPortalManager
          v-else-if="tab === 'customer'"
          :wedding="form"
          :blocked="Boolean(dirty)"
          @updated="contentImported"
          @busy="pending = $event"
        />
        <template v-else-if="tab === 'couple'"
          ><h2>
            {{ isWedding ? 'Dua hati, satu cerita.' : 'Data Acara' }}
          </h2>
          <EventDetailsForm
            v-if="!isWedding"
            v-model="form.event_details"
            :event-type="form.event_type"
            :wedding-id="form.id"
            :disabled="pending" />
          <div v-if="isWedding" class="couple-visibility repeater-card">
            <h3>Tampilan pada undangan</h3>
            <p class="panel-subtitle">
              Berlaku untuk kedua pengantin. Data tetap tersimpan ketika disembunyikan.
              Klik Simpan untuk menerapkan perubahan.
            </p>
            <label class="toggle-row">
              <span>Tampilkan orang tua</span>
              <input
                v-model="form.settings.enable_parents"
                type="checkbox"
                role="switch"
                :disabled="pending"
              />
            </label>
            <label class="toggle-row">
              <span>Tampilkan keterangan keluarga</span>
              <input
                v-model="form.settings.enable_family"
                type="checkbox"
                role="switch"
                :disabled="pending"
              />
            </label>
            <label class="toggle-row">
              <span>Tampilkan media sosial pengantin</span>
              <input
                v-model="form.settings.enable_social"
                type="checkbox"
                role="switch"
                :disabled="pending"
              />
            </label>
          </div>
          <div v-if="isWedding" class="couple-editor-grid">
            <section
              v-for="[role, label] in [
                ['bride', 'Pengantin Wanita'],
                ['groom', 'Pengantin Pria'],
              ]"
              :key="role"
            >
              <h3>{{ label }}</h3>
              <MediaUploader
                v-model="form[role].photo"
                :wedding-id="form.id"
                collection="couple"
                :label="`Foto ${label}`"
              /><FormField
                v-for="field in coupleFields"
                :key="field[0]"
                v-model="form[role][field[0]]"
                :label="field[1]"
                :required="field[0] === 'full_name'"
              />
            </section></div
        ></template>
        <template v-else-if="tab === 'events'"
          ><div class="panel-title">
            <h2>
              {{ isWedding ? 'Acara pernikahan' : 'Agenda Acara' }}
            </h2>
            <button class="p-button small" @click="addEvent">
              <Plus :size="16" />Tambah Acara
            </button>
          </div>
          <article
            v-for="(event, i) in form.events"
            :key="i"
            class="repeater-card"
          >
            <div class="repeater-header">
              <h3>Acara {{ i + 1 }}</h3>
              <div>
                <button
                  class="icon-button"
                  aria-label="Naikkan acara"
                  :disabled="i === 0"
                  @click="reorder(form.events, i, -1)"
                >
                  <ArrowUp :size="16" /></button
                ><button
                  class="icon-button"
                  aria-label="Turunkan acara"
                  :disabled="i === form.events.length - 1"
                  @click="reorder(form.events, i, 1)"
                >
                  <ArrowDown :size="16" /></button
                ><button
                  class="icon-button"
                  aria-label="Hapus acara"
                  @click="form.events.splice(i, 1)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
            <label class="toggle-row">
              <span>Tampilkan acara di undangan</span>
              <input v-model="event.is_visible" type="checkbox" role="switch" :disabled="pending" />
            </label>
            <label class="toggle-row">
              <span>Tampilkan lokasi di Meet us here</span>
              <input v-model="event.show_on_map" type="checkbox" role="switch" :disabled="pending || !event.is_visible" />
            </label>
            <p class="panel-subtitle">
              Data tetap tersimpan saat acara disembunyikan. Aktifkan lokasi yang ingin tampil
              di bagian Lokasi (Meet us here), lalu klik Simpan.
            </p>
            <div class="form-grid">
              <FormField
                v-model="event.title"
                label="Nama Acara"
                required
              /><FormField
                v-model="event.type"
                label="Jenis Acara"
                type="select"
                :options="
                  agendaOptions.map(([value, label]) => ({
                    value,
                    label,
                  }))
                "
              /><FormField
                v-model="event.date"
                label="Tanggal"
                type="date"
                required
              /><FormField
                v-model="event.start_time"
                label="Waktu Mulai"
                type="time"
                required
              /><FormField
                v-model="event.end_time"
                label="Waktu Selesai"
                type="time"
                required
              /><FormField
                v-model="event.timezone"
                label="Zona Waktu"
                type="select"
                :options="[
                  { value: 'Asia/Jakarta', label: 'WIB' },
                  { value: 'Asia/Makassar', label: 'WITA' },
                  { value: 'Asia/Jayapura', label: 'WIT' },
                ]"
              /><FormField
                v-model="event.venue"
                label="Venue"
                required
              /><FormField
                v-model="event.address"
                label="Alamat"
                type="textarea"
              /><FormField
                v-model="event.google_maps_url"
                label="URL Google Maps"
                type="url"
              />
            </div>
          </article>
          <p v-if="!form.events.length" class="empty-note">
            Tambahkan acara pertama untuk hari bahagia ini.
          </p></template
        >
        <template v-else-if="tab === 'story'"
          ><div class="panel-title">
            <h2>
              {{ isWedding ? 'Love story' : 'Tentang Acara' }}
            </h2>
            <button class="p-button small" @click="addStory">
              <Plus :size="16" />Tambah Cerita
            </button>
          </div>
          <article
            v-for="(story, i) in form.stories"
            :key="i"
            class="repeater-card"
          >
            <div class="repeater-header">
              <h3>Bab {{ i + 1 }}</h3>
              <div>
                <button
                  class="icon-button"
                  aria-label="Naikkan cerita"
                  :disabled="i === 0"
                  @click="reorder(form.stories, i, -1)"
                >
                  <ArrowUp :size="16" /></button
                ><button
                  class="icon-button"
                  aria-label="Turunkan cerita"
                  :disabled="i === form.stories.length - 1"
                  @click="reorder(form.stories, i, 1)"
                >
                  <ArrowDown :size="16" /></button
                ><button
                  class="icon-button"
                  aria-label="Hapus cerita"
                  @click="form.stories.splice(i, 1)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
            <FormField
              v-model="story.date_label"
              label="Tanggal / tahun"
              required
            /><FormField
              v-model="story.title"
              label="Judul"
              required
            /><FormField
              v-model="story.description"
              label="Deskripsi"
              type="textarea"
              required
            /><MediaUploader
              v-model="story.image"
              :wedding-id="form.id"
              collection="story"
              label="Foto cerita (opsional)"
            />
          </article>
          <p v-if="!form.stories.length" class="empty-note">
            Setiap cinta memiliki cerita. Tambahkan bab pertama.
          </p></template
        >
        <template v-else-if="tab === 'gallery'"
          ><h2>Galeri kenangan</h2>
          <p class="panel-subtitle">
            Pilih beberapa foto sekaligus. Gunakan tombol panah untuk mengatur
            urutan.
          </p>
          <MediaUploader
            :wedding-id="form.id"
            collection="gallery"
            multiple
            label="Upload foto gallery"
            @uploaded="addGallery" />
          <div class="editor-gallery">
            <article v-for="(photo, i) in form.gallery" :key="photo.image + i">
              <img
                :src="photo.image"
                :alt="photo.caption || `Foto ${i + 1}`"
                loading="lazy"
              /><FormField v-model="photo.caption" label="Caption" />
              <div class="gallery-edit-actions">
                <button
                  class="icon-button"
                  aria-label="Naikkan foto"
                  :disabled="i === 0"
                  @click="reorder(form.gallery, i, -1)"
                >
                  <ArrowUp :size="16" /></button
                ><button
                  class="icon-button"
                  aria-label="Turunkan foto"
                  :disabled="i === form.gallery.length - 1"
                  @click="reorder(form.gallery, i, 1)"
                >
                  <ArrowDown :size="16" /></button
                ><button
                  class="icon-button"
                  aria-label="Hapus foto gallery"
                  @click="form.gallery.splice(i, 1)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </article></div
        ></template>
        <template v-else-if="tab === 'sections'"
          ><SectionManager
            v-model="form"
            :template-key="previewWedding.template?.template_key"
        /></template>
        <template v-else-if="tab === 'music'"
          ><h2>Soundtrack cerita Anda</h2>
          <MusicSelector
            v-model="form.music"
            :wedding-id="form.id"
            :template-key="previewWedding.template?.template_key" />
          <FormField
            v-model="form.music.music_url"
            label="URL audio"
            type="url" /><MediaUploader
            v-model="form.music.music_url"
            :wedding-id="form.id"
            collection="music"
            label="Upload musik" /><FormField
            v-model="form.music.volume"
            label="Volume (0–100%)"
            type="number" /><label class="toggle-row"
            ><span>Putar setelah Buka Undangan</span
            ><input
              v-model="form.music.autoplay_after_open"
              type="checkbox" /></label
          ><audio
            v-if="form.music.music_url"
            :src="form.music.music_url"
            controls
            preload="none"
            class="music-preview"
            aria-label="Preview Music"
          ></audio
        ></template>
        <template v-else-if="tab === 'gift'"
          ><label class="toggle-row"
            ><span>Enable Wedding Gift</span
            ><input
              v-model="form.settings.enable_gift"
              type="checkbox" /></label
          ><WeddingGiftManager
            :wedding-id="form.id"
            :methods="form.gift_methods"
            @updated="giftsUpdated"
        /></template>
        <template v-else-if="tab === 'livestream'"
          ><h2>Rayakan dari mana saja.</h2>
          <FormField
            v-model="form.livestream.platform"
            label="Platform"
            placeholder="YouTube, Zoom, Instagram" /><FormField
            v-model="form.livestream.url"
            label="URL Live Streaming"
            type="url"
        /></template>
        <template v-else-if="tab === 'responses'">
          <GuestResponses :base="`/admin/weddings/${form.id}`" admin />
        </template>
        <template v-else-if="tab === 'settings'"
          ><h2>Fitur undangan</h2>
          <p class="panel-subtitle">
            Section yang dinonaktifkan otomatis disembunyikan dari undangan.
          </p>
          <label
            v-for="(label, key) in featureLabels"
            :key="key"
            class="toggle-row"
            ><span>{{ label }}</span
            ><input
              v-model="form.settings[`enable_${key}`]"
              type="checkbox" /></label
        ></template>
        <template v-else-if="tab === 'template'"
          ><div class="panel-title">
            <h2>Template Radina</h2>
            <button class="p-button small" @click="templatePicker = true">
              Ganti Template
            </button>
          </div>
          <p>
            Current Template:
            <strong>{{
              templates.find((t) => t.id === Number(form.template_id))?.name
            }}</strong>
          </p>
          <p>
            Seluruh konten, hadiah, RSVP dan ucapan tetap tersimpan saat
            tampilan diganti.
          </p>
          <div class="template-choice-grid">
            <article
              v-for="t in templates.filter((x) => x.status === 'ACTIVE')"
              :key="t.id"
              class="template-choice"
            >
              <img :src="t.thumbnail" :alt="t.name" loading="lazy" />
              <h3>{{ t.name }}</h3>
              <RouterLink
                :to="`/templates/${t.slug}/preview`"
                target="_blank"
                class="p-button secondary small"
                >Preview</RouterLink
              ><button
                class="p-button small"
                :disabled="Number(form.template_id) === t.id"
                @click="requestTemplate(t)"
              >
                Gunakan Template
              </button>
            </article>
          </div></template
        >
        <template v-else-if="tab === 'preview'"
          ><div class="panel-title">
            <h2>Live Preview</h2>
            <RouterLink
              :to="`/admin/weddings/${form.id}/preview`"
              target="_blank"
              class="p-button secondary small"
              >Layar Penuh</RouterLink
            >
          </div>
          <p class="panel-subtitle">
            Preview memakai konten editor, termasuk perubahan yang belum
            disimpan. Gunakan Simpan untuk memperbarui undangan publik.
          </p>
          <div class="preview-controls">
            <button
              v-for="item in [
                ['cover', 'Preview Cover'],
                ['couple', 'Couple'],
                ['event', 'Event'],
                ['gallery', 'Gallery'],
                ['gift', 'Gift'],
                ['closing', 'Closing'],
              ]"
              :key="item[0]"
              @click="liveSection(item[0])"
            >
              {{ item[1] }}
            </button>
          </div>
          <div class="live-wedding-preview">
            <WeddingRenderer
              ref="liveRenderer"
              :wedding="previewWedding"
              preview
              start-open
            /></div
        ></template>
        <template v-else-if="tab === 'publish'"
          ><div class="publish-panel">
            <Send :size="30" />
            <p class="p-eyebrow">READY FOR YOUR FOREVER</p>
            <h2>
              {{
                form.status === 'PUBLISHED'
                  ? 'Cerita Anda sudah aktif.'
                  : 'Siap membagikan cerita ini?'
              }}
            </h2>
            <p>
              Pastikan data undangan, tanggal, agenda, template, dan slug sudah
              benar.
            </p>
            <div class="slug-preview">
              {{ window?.location?.origin || '' }}/w/{{ form.slug }}
            </div>
            <button
              v-if="form.status !== 'PUBLISHED'"
              class="p-button"
              :disabled="pending"
              @click="confirmPublish = true"
            >
              <Send :size="17" />Publish Website</button
            ><RouterLink
              v-else
              :to="`/w/${form.slug}`"
              target="_blank"
              class="p-button"
              >Lihat Undangan<ExternalLink :size="17"
            /></RouterLink></div
        ></template>
      </section>
      <BaseModal
        :open="confirmPublish"
        title="Publish undangan"
        @close="confirmPublish = false"
        ><div class="platform">
          <h2>Publish undangan?</h2>
          <p class="modal-description">
            Undangan akan dapat diakses publik di /w/{{ form.slug }}. Perubahan
            yang belum disimpan akan disimpan terlebih dahulu.
          </p>
          <p v-if="error" class="alert error">{{ error }}</p>
          <button
            class="p-button full-width"
            :disabled="pending"
            @click="publish"
          >
            {{ pending ? 'Memproses…' : 'Ya, Publish Website' }}
          </button>
        </div></BaseModal
      >
    </template>
    <BaseModal
      :open="templatePicker"
      title="Pilih Template Radina"
      wide
      @close="templatePicker = false"
      ><div class="platform">
        <h2>Koleksi Radina</h2>
        <div class="template-choice-grid">
          <article
            v-for="t in templates.filter((x) => x.status === 'ACTIVE')"
            :key="t.id"
            class="template-choice"
          >
            <img :src="t.thumbnail" :alt="t.name" loading="lazy" />
            <h3>{{ t.name }}</h3>
            <RouterLink
              :to="`/templates/${t.slug}/preview`"
              target="_blank"
              class="p-button secondary small"
              >Preview</RouterLink
            ><button class="p-button small" @click="requestTemplate(t)">
              Gunakan Template
            </button>
          </article>
        </div>
      </div></BaseModal
    >
    <BaseModal
      :open="Boolean(selectedTemplate)"
      title="Konfirmasi ganti template"
      @close="selectedTemplate = null"
      ><div class="platform">
        <h2>Ganti template ke {{ selectedTemplate?.name }}?</h2>
        <p>
          Seluruh data undangan akan tetap tersimpan. Hanya tampilan website
          yang akan berubah.
        </p>
        <button class="p-button" @click="chooseTemplate">
          Ya, Gunakan Template
        </button>
      </div></BaseModal
    >
  </div>
</template>
