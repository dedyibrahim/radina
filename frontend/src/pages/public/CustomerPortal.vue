<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import {
  Save,
  Send,
  Plus,
  Trash2,
  Eye,
  Check,
  RefreshCw,
} from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { useUiStore } from '../../stores/ui'
import RadinaLogo from '../../components/RadinaLogo.vue'
import FormField from '../../components/FormField.vue'
import MediaUploader from '../../components/MediaUploader.vue'
import PageState from '../../components/PageState.vue'
import EventDetailsForm from '../../components/EventDetailsForm.vue'
import EventCountdownSelector from '../../components/EventCountdownSelector.vue'
import { eventProfile, agendaOptions } from '../../services/invitationEvents'
import WeddingAnalytics from '../../components/WeddingAnalytics.vue'
import ReminderList from '../../components/ReminderList.vue'
import OrderDocuments from '../../components/OrderDocuments.vue'
import CustomerGuestImport from '../../components/CustomerGuestImport.vue'
import GuestResponses from '../../components/GuestResponses.vue'

const route = useRoute(),
  ui = useUiStore()
const portal = ref(null),
  form = ref(null),
  baseline = ref(''),
  loading = ref(true),
  busy = ref(false),
  uploads = ref(0),
  error = ref(''),
  tab = ref('data'),
  preview = ref(null),
  previewFrame = ref(null),
  previewPanel = ref(null),
  previewReady = ref(false),
  previewRevision = ref(0),
  previewError = ref(''),
  notes = ref('')
const previewUrl = computed(
  () => `/pelanggan/${route.params.token}/preview?v=${previewRevision.value}`,
)
const base = () => `/customer-portals/${route.params.token}`
const mediaPath = computed(() => `${base()}/media`)
const dirty = computed(
  () => form.value && JSON.stringify(form.value) !== baseline.value,
)
const locked = computed(() => busy.value || uploads.value > 0)
const labels = {
  DRAFT: 'Draf data Anda',
  SUBMITTED: 'Data dikirim ke admin',
  IN_REVIEW: 'Siap ditinjau',
  CHANGES_REQUESTED: 'Revisi diminta',
  APPROVED: 'Sudah disetujui',
}
const canRespond = computed(
  () =>
    preview.value &&
    previewReady.value &&
    ['IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED'].includes(
      preview.value.status,
    ) &&
    !dirty.value,
)
const baseBasicFields = [
  ['title', 'Judul undangan', 'text'],
  ['wedding_date', 'Tanggal pernikahan', 'date'],
  ['hashtag', 'Hashtag', 'text'],
  ['opening_text', 'Kalimat pembuka', 'textarea'],
  ['quote', 'Kutipan', 'textarea'],
  ['quote_source', 'Sumber kutipan', 'text'],
  ['closing_text', 'Kalimat penutup', 'textarea'],
]
const isWedding = computed(
  () => !portal.value?.event_type || portal.value.event_type === 'wedding',
)
const profile = computed(() => eventProfile(portal.value?.event_type))
const basicFields = computed(() =>
  baseBasicFields.map(([key, label, type]) => [
    key,
    key === 'wedding_date' && !isWedding.value ? 'Tanggal acara' : label,
    type,
  ]),
)
const coupleFields = [
  ['full_name', 'Nama lengkap'],
  ['nickname', 'Nama panggilan'],
  ['father_name', 'Nama ayah'],
  ['mother_name', 'Nama ibu'],
  ['family_order', 'Keterangan keluarga'],
  ['instagram', 'Instagram tanpa @'],
]
function accept(data) {
  portal.value = data
  form.value = JSON.parse(JSON.stringify(data.form))
  form.value.event_details ||= {}
  for (const key of ['events', 'stories', 'gallery', 'gift_methods'])
    form.value[key] ||= []
  form.value.events = form.value.events.map((event, index) => ({
    ...event,
    is_visible: event.is_visible ?? true,
    show_on_map: event.show_on_map ?? index === 0,
    use_for_countdown: event.use_for_countdown ?? false,
  }))
  for (const role of ['bride', 'groom']) form.value[role] ||= {}
  baseline.value = JSON.stringify(form.value)
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    accept((await api.get(base())).data.data)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
async function save(submit) {
  if (locked.value) return
  busy.value = true
  error.value = ''
  const snapshot = JSON.stringify(form.value)
  try {
    const data = (
      await api.put(base(), {
        data: JSON.parse(snapshot),
        expected_submission_version: portal.value.submission_version,
        submit,
      })
    ).data.data
    portal.value = data
    baseline.value = JSON.stringify(data.form)
    if (JSON.stringify(form.value) === snapshot) accept(data)
    preview.value = null
    ui.toast(
      submit
        ? 'Data terkirim. Admin akan menyiapkan preview untuk Anda.'
        : 'Draf Anda tersimpan.',
    )
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function openPreview() {
  if (locked.value) return
  tab.value = 'preview'
  busy.value = true
  error.value = ''
  preview.value = null
  previewReady.value = false
  previewError.value = ''
  previewRevision.value++
  try {
    preview.value = (await api.get(`${base()}/preview`)).data.data
    portal.value.status = preview.value.status
    await nextTick()
    previewPanel.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
function previewMessage(event) {
  if (
    event.origin !== window.location.origin ||
    event.source !== previewFrame.value?.contentWindow ||
    event.data?.type !== 'radina:customer-preview'
  )
    return
  if (event.data.error) {
    previewReady.value = false
    previewError.value = String(event.data.error)
  } else if (event.data.fingerprint === preview.value?.fingerprint) {
    previewReady.value = true
    previewError.value = ''
  } else {
    previewReady.value = false
    previewError.value =
      'Preview berubah saat dimuat. Pilih Muat Preview Terbaru sebelum menyetujui.'
  }
}
async function respond(decision) {
  if (locked.value || !canRespond.value) return
  if (
    decision === 'approve' &&
    !window.confirm(
      'Nama, tanggal, lokasi, foto, dan rekening hadiah sudah sesuai? Persetujuan ini berlaku untuk preview yang sedang Anda lihat.',
    )
  )
    return
  busy.value = true
  error.value = ''
  try {
    accept(
      (
        await api.post(`${base()}/response`, {
          decision,
          fingerprint: preview.value.fingerprint,
          notes: decision === 'revision' ? notes.value : null,
        })
      ).data.data,
    )
    preview.value.status = portal.value.status
    notes.value = ''
    ui.toast(
      decision === 'approve'
        ? 'Persetujuan tersimpan. Admin dapat mempublish undangan Anda.'
        : 'Catatan revisi terkirim ke admin.',
    )
  } catch (e) {
    error.value = errorMessage(e)
    if (e.response?.status === 409) preview.value = null
  } finally {
    busy.value = false
  }
}
function addEvent() {
  form.value.events.push({
    is_visible: true,
    show_on_map: form.value.events.length === 0,
    use_for_countdown: false,
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
  form.value.gift_methods.push({
    type: 'BANK',
    provider: '',
    account_number: '',
    account_name: '',
    logo: '',
    qr_image: '',
    recipient_name: '',
    phone: '',
    address: '',
    description: '',
    is_active: true,
  })
}
function galleryUploaded(files) {
  const available = 50 - form.value.gallery.length
  form.value.gallery.push(
    ...files
      .slice(0, available)
      .map((file) => ({ image: file.url, caption: '' })),
  )
  if (files.length > available) ui.toast('Galeri maksimal 50 foto.')
}
function uploadBusy(value) {
  uploads.value = Math.max(0, uploads.value + (value ? 1 : -1))
}
function beforeUnload(event) {
  if (dirty.value || locked.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => {
  window.addEventListener('message', previewMessage)
  document.title = 'Data & Persetujuan Undangan | Radina'
  window.addEventListener('beforeunload', beforeUnload)
  load()
})
onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnload)
  window.removeEventListener('message', previewMessage)
})
onBeforeRouteLeave(
  () =>
    (!dirty.value && !locked.value) ||
    window.confirm('Ada perubahan belum tersimpan. Tinggalkan halaman?'),
)
</script>

<template>
  <main class="platform customer-portal">
    <header class="customer-header p-container">
      <RadinaLogo /><span>RUANG PELANGGAN</span>
    </header>
    <div class="p-container customer-container">
      <PageState
        v-if="loading || !portal"
        :loading="loading"
        :error="error"
        title="Tautan pelanggan tidak tersedia"
        @retry="load"
      />
      <template v-else>
        <div class="customer-title">
          <p class="p-eyebrow">CERITA ANDA, DIMULAI DI SINI</p>
          <h1>Data &amp; persetujuan undangan</h1>
          <p>
            Isi detail {{ isWedding ? 'pernikahan' : 'acara' }}, simpan draf,
            lalu kirim ke admin. Setelah dirapikan, periksa preview dan berikan
            persetujuan atau catatan revisi.
          </p>
          <span class="customer-status" role="status">{{
            labels[portal.status]
          }}</span>
        </div>
        <nav class="customer-tabs" aria-label="Halaman pelanggan">
          <button
            type="button"
            :disabled="locked"
            :class="{ selected: tab === 'responses' }"
            @click="tab = 'responses'"
          >
            RSVP &amp; Ucapan
          </button>
          <button
            type="button"
            :disabled="locked"
            :class="{ selected: tab === 'guests' }"
            @click="tab = 'guests'"
          >
            Daftar Tamu / Impor &amp; Ekspor
          </button>
          <button
            type="button"
            :disabled="locked"
            :class="{ selected: tab === 'data' }"
            @click="tab = 'data'"
          >
            {{ isWedding ? 'Isi Data Pernikahan' : 'Isi Data Acara' }}</button
          ><button
            type="button"
            :disabled="locked"
            :class="{ selected: tab === 'preview' }"
            @click="openPreview"
          >
            <Eye :size="16" />Preview &amp; Persetujuan
          </button>
          <button
            type="button"
            :disabled="locked"
            :class="{ selected: tab === 'analytics' }"
            @click="tab = 'analytics'"
          >
            Statistik & Tamu
          </button>
          <button
            type="button"
            :disabled="locked"
            :class="{ selected: tab === 'tools' }"
            @click="tab = 'tools'"
          >
            Dokumen & Pengingat
          </button>
        </nav>
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <p
          v-if="portal.status === 'CHANGES_REQUESTED' && portal.revision_notes"
          class="alert"
        >
          Catatan revisi Anda: {{ portal.revision_notes }}
        </p>
        <p v-if="dirty" class="customer-unsaved" role="status">
          Ada perubahan belum disimpan.
        </p>
        <section v-if="tab === 'guests'" class="surface customer-section">
          <CustomerGuestImport :base="base()" @busy="busy = $event" />
        </section>
        <section v-else-if="tab === 'responses'" class="surface customer-section">
          <GuestResponses :base="base()" />
        </section>
        <section
          v-else-if="tab === 'analytics'"
          class="surface customer-section"
        >
          <WeddingAnalytics :base="base()" />
        </section>
        <section v-else-if="tab === 'tools'" class="surface customer-section">
          <h2>Dokumen pesanan</h2>
          <OrderDocuments :base="base()" paid /><ReminderList :base="base()" />
        </section>
        <template v-else-if="tab === 'data'">
          <form novalidate @submit.prevent="save(true)">
            <fieldset :disabled="busy" class="customer-fields">
              <section class="surface customer-section">
                <h2>Informasi dasar</h2>
                <div class="form-grid">
                  <FormField
                    v-for="[key, label, type] in basicFields"
                    :key="key"
                    v-model="form[key]"
                    :label="label"
                    :type="type"
                    :help="key === 'quote' ? 'Gunakan Enter atau /n untuk memisahkan teks Arab dan artinya ke baris baru.' : undefined"
                  />
                </div>
                <div class="customer-photo-grid">
                  <div
                    v-for="[key, label] in [
                      ['cover_image', 'Foto cover'],
                      ['hero_image', 'Foto utama'],
                      ['closing_image', 'Foto penutup'],
                    ]"
                    :key="key"
                  >
                    <h3>{{ label }}</h3>
                    <MediaUploader
                      v-model="form[key]"
                      collection="covers"
                      :label="`Unggah ${label.toLowerCase()}`"
                      :upload-path="mediaPath"
                      :disabled="busy"
                      @busy="uploadBusy"
                    />
                  </div>
                </div>
              </section>
              <section class="surface customer-section">
                <h2>
                  {{ isWedding ? 'Pengantin' : 'Data Acara' }}
                </h2>
                <EventDetailsForm
                  v-if="!isWedding"
                  v-model="form.event_details"
                  :event-type="portal.event_type"
                  :upload-path="mediaPath"
                  :disabled="busy"
                  @busy="uploadBusy"
                />
                <div v-if="isWedding" class="couple-editor-grid">
                  <div
                    v-for="[role, label] in [
                      ['bride', 'pengantin wanita'],
                      ['groom', 'pengantin pria'],
                    ]"
                    :key="role"
                  >
                    <h3>
                      {{
                        label === 'pengantin wanita'
                          ? 'Pengantin wanita'
                          : 'Pengantin pria'
                      }}
                    </h3>
                    <MediaUploader
                      v-model="form[role].photo"
                      collection="couple"
                      :label="`Unggah foto ${label}`"
                      :upload-path="mediaPath"
                      :disabled="busy"
                      @busy="uploadBusy"
                    /><FormField
                      v-for="[key, fieldLabel] in coupleFields"
                      :key="key"
                      v-model="form[role][key]"
                      :label="`${fieldLabel} ${label}`"
                    />
                  </div>
                </div>
              </section>
              <section class="surface customer-section">
                <div class="panel-title">
                  <h2>
                    {{ isWedding ? 'Acara pernikahan' : 'Agenda Acara' }}
                  </h2>
                  <button
                    type="button"
                    class="p-button secondary small"
                    :disabled="form.events.length >= 20"
                    @click="addEvent"
                  >
                    <Plus :size="16" />Tambah Acara
                  </button>
                </div>
                <EventCountdownSelector v-model="form.events" :disabled="busy" />
                <article
                  v-for="(event, i) in form.events"
                  :key="i"
                  class="repeater-card"
                >
                  <div class="repeater-header">
                    <h3>Acara {{ i + 1 }}</h3>
                    <button
                      type="button"
                      class="icon-button"
                      :aria-label="`Hapus acara ${i + 1}`"
                      @click="form.events.splice(i, 1)"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                  <label class="toggle-row">
                    <span>Tampilkan acara di undangan</span>
                    <input v-model="event.is_visible" type="checkbox" role="switch" :disabled="busy" />
                  </label>
                  <label class="toggle-row">
                    <span>Tampilkan lokasi di Meet us here</span>
                    <input v-model="event.show_on_map" type="checkbox" role="switch" :disabled="busy || !event.is_visible" />
                  </label>
                  <p class="panel-subtitle">
                    Data tetap tersimpan saat acara disembunyikan. Pilih lokasi yang ingin
                    tampil di bagian Lokasi (Meet us here).
                  </p>
                  <div class="form-grid">
                    <FormField
                      v-model="event.title"
                      :label="`Nama acara ${i + 1}`"
                    /><FormField
                      v-model="event.type"
                      :label="`Jenis acara ${i + 1}`"
                      type="select"
                      :options="
                        agendaOptions.map(([value, label]) => ({
                          value,
                          label,
                        }))
                      "
                    /><FormField
                      v-model="event.date"
                      :label="`Tanggal acara ${i + 1}`"
                      type="date"
                    /><FormField
                      v-model="event.start_time"
                      :label="`Jam mulai acara ${i + 1}`"
                      type="time"
                    /><FormField
                      v-model="event.end_time"
                      :label="`Jam selesai acara ${i + 1}`"
                      type="time"
                    /><FormField
                      v-model="event.timezone"
                      :label="`Zona waktu acara ${i + 1}`"
                      type="select"
                      :options="[
                        {
                          value: 'Asia/Jakarta',
                          label: 'WIB',
                        },
                        {
                          value: 'Asia/Makassar',
                          label: 'WITA',
                        },
                        {
                          value: 'Asia/Jayapura',
                          label: 'WIT',
                        },
                      ]"
                    /><FormField
                      v-model="event.venue"
                      :label="`Lokasi acara ${i + 1}`"
                    /><FormField
                      v-model="event.address"
                      :label="`Alamat acara ${i + 1}`"
                      type="textarea"
                    /><FormField
                      v-model="event.google_maps_url"
                      :label="`URL Google Maps acara ${i + 1}`"
                      type="url"
                    />
                  </div>
                </article>
              </section>
              <section class="surface customer-section">
                <div class="panel-title">
                  <h2>Cerita cinta</h2>
                  <button
                    type="button"
                    class="p-button secondary small"
                    :disabled="form.stories.length >= 30"
                    @click="addStory"
                  >
                    <Plus :size="16" />Tambah Cerita
                  </button>
                </div>
                <article
                  v-for="(story, i) in form.stories"
                  :key="i"
                  class="repeater-card"
                >
                  <div class="repeater-header">
                    <h3>Cerita {{ i + 1 }}</h3>
                    <button
                      type="button"
                      class="icon-button"
                      :aria-label="`Hapus cerita ${i + 1}`"
                      @click="form.stories.splice(i, 1)"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                  <div class="form-grid">
                    <FormField
                      v-model="story.date_label"
                      :label="`Tanggal atau tahun cerita ${i + 1}`"
                    /><FormField
                      v-model="story.title"
                      :label="`Judul cerita ${i + 1}`"
                    /><FormField
                      v-model="story.description"
                      :label="`Isi cerita ${i + 1}`"
                      type="textarea"
                    />
                  </div>
                  <MediaUploader
                    v-model="story.image"
                    collection="story"
                    :label="`Unggah foto cerita ${i + 1}`"
                    :upload-path="mediaPath"
                    :disabled="busy"
                    @busy="uploadBusy"
                  />
                </article>
              </section>
              <section class="surface customer-section">
                <h2>Galeri foto</h2>
                <p>
                  Maksimal 50 foto, unggah hingga 10 foto sekaligus. JPG, PNG,
                  WebP, atau AVIF, maksimal 12 MB per foto.
                </p>
                <MediaUploader
                  v-if="form.gallery.length < 50"
                  multiple
                  collection="gallery"
                  label="Unggah foto galeri"
                  :upload-path="mediaPath"
                  :disabled="busy"
                  @uploaded="galleryUploaded"
                  @busy="uploadBusy"
                />
                <div class="customer-gallery">
                  <article v-for="(photo, i) in form.gallery" :key="i">
                    <img
                      :src="photo.image"
                      :alt="`Foto galeri ${i + 1}`"
                    /><FormField
                      v-model="photo.caption"
                      :label="`Keterangan foto ${i + 1}`"
                    /><button
                      type="button"
                      class="text-link"
                      @click="form.gallery.splice(i, 1)"
                    >
                      <Trash2 :size="14" />Hapus foto
                      {{ i + 1 }}
                    </button>
                  </article>
                </div>
              </section>
              <section class="surface customer-section">
                <div class="panel-title">
                  <h2>Hadiah</h2>
                  <button
                    type="button"
                    class="p-button secondary small"
                    :disabled="form.gift_methods.length >= 30"
                    @click="addGift"
                  >
                    <Plus :size="16" />Tambah Metode Hadiah
                  </button>
                </div>
                <p>
                  Isi rekening atau alamat penerima hadiah untuk ditampilkan
                  kepada tamu.
                </p>
                <article
                  v-for="(gift, i) in form.gift_methods"
                  :key="i"
                  class="repeater-card"
                >
                  <div class="repeater-header">
                    <h3>Hadiah {{ i + 1 }}</h3>
                    <button
                      type="button"
                      class="icon-button"
                      :aria-label="`Hapus hadiah ${i + 1}`"
                      @click="form.gift_methods.splice(i, 1)"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                  <FormField
                    v-model="gift.type"
                    :label="`Jenis hadiah ${i + 1}`"
                    type="select"
                    :options="[
                      {
                        value: 'BANK',
                        label: 'Transfer Bank',
                      },
                      {
                        value: 'EWALLET',
                        label: 'E-wallet',
                      },
                      { value: 'QRIS', label: 'QRIS' },
                      {
                        value: 'PHYSICAL',
                        label: 'Hadiah Fisik',
                      },
                    ]"
                  />
                  <div v-if="gift.type !== 'PHYSICAL'" class="form-grid">
                    <FormField
                      v-model="gift.provider"
                      :label="`Bank atau penyedia hadiah ${i + 1}`"
                    /><FormField
                      v-if="gift.type !== 'QRIS'"
                      v-model="gift.account_number"
                      :label="`Nomor rekening hadiah ${i + 1}`"
                    /><FormField
                      v-model="gift.account_name"
                      :label="`Pemilik rekening hadiah ${i + 1}`"
                    />
                  </div>
                  <MediaUploader
                    v-if="gift.type === 'QRIS'"
                    v-model="gift.qr_image"
                    collection="gift"
                    :label="`Unggah QRIS hadiah ${i + 1}`"
                    :upload-path="mediaPath"
                    :disabled="busy"
                    @busy="uploadBusy"
                  />
                  <div v-if="gift.type === 'PHYSICAL'" class="form-grid">
                    <FormField
                      v-model="gift.recipient_name"
                      :label="`Penerima hadiah ${i + 1}`"
                    /><FormField
                      v-model="gift.phone"
                      :label="`Telepon penerima hadiah ${i + 1}`"
                    /><FormField
                      v-model="gift.address"
                      :label="`Alamat penerima hadiah ${i + 1}`"
                      type="textarea"
                    />
                  </div>
                  <FormField
                    v-model="gift.description"
                    :label="`Catatan hadiah ${i + 1}`"
                    type="textarea"
                  />
                </article>
              </section>
            </fieldset>
            <div class="surface customer-save">
              <p>
                Data dan foto yang dikirim akan diperiksa admin sebelum
                diterapkan ke undangan.
              </p>
              <div class="action-group">
                <button
                  type="button"
                  class="p-button secondary"
                  :disabled="locked || !dirty"
                  @click="save(false)"
                >
                  <Save :size="16" />Simpan Draf</button
                ><button
                  type="submit"
                  class="p-button"
                  :disabled="
                    locked ||
                    (!dirty &&
                      ['SUBMITTED', 'APPROVED'].includes(portal.status))
                  "
                >
                  <Send :size="16" />{{
                    busy ? 'Menyimpan…' : 'Kirim Data ke Admin'
                  }}
                </button>
              </div>
            </div>
          </form>
        </template>
        <template v-else>
          <section
            ref="previewPanel"
            class="surface customer-section customer-approval"
          >
            <div class="panel-title">
              <h2>Periksa undangan Anda</h2>
              <button
                type="button"
                class="p-button secondary small"
                :disabled="locked"
                @click="openPreview"
              >
                <RefreshCw :size="16" />Muat Preview Terbaru
              </button>
            </div>
            <p>
              Preview menampilkan versi yang telah disiapkan admin. Periksa
              nama, tanggal, lokasi, foto, dan rekening hadiah sebelum
              menyetujui.
            </p>
            <p v-if="dirty" class="alert">
              Simpan atau kirim perubahan data Anda sebelum memberikan
              persetujuan.
            </p>
            <p v-if="previewError" class="alert error" role="alert">
              {{ previewError }}
            </p>
            <p v-else-if="preview && !previewReady" class="alert" role="status">
              Memuat preview undangan…
            </p>
            <p
              v-if="preview && previewReady && !canRespond && !dirty"
              class="alert"
            >
              Admin sedang menyiapkan undangan. Persetujuan tersedia setelah
              undangan dikirim untuk ditinjau.
            </p>
            <template v-if="canRespond"
              ><p
                v-if="preview.status === 'APPROVED'"
                class="alert"
                role="status"
              >
                Preview ini sudah Anda setujui.
              </p>
              <div v-else class="customer-decisions">
                <button
                  type="button"
                  class="p-button"
                  :disabled="locked"
                  @click="respond('approve')"
                >
                  <Check :size="16" />Sudah Sesuai, Saya Setujui</button
                ><FormField
                  v-model="notes"
                  label="Catatan revisi"
                  type="textarea"
                  placeholder="Contoh: ubah jam acara menjadi 09.00 WIB."
                /><button
                  type="button"
                  class="p-button secondary"
                  :disabled="locked || notes.trim().length < 5"
                  @click="respond('revision')"
                >
                  Kirim Catatan Revisi
                </button>
              </div></template
            >
          </section>
          <div v-if="preview" class="customer-preview">
            <iframe
              ref="previewFrame"
              :key="preview.fingerprint"
              :src="previewUrl"
              title="Preview undangan pelanggan"
              referrerpolicy="no-referrer"
            />
          </div>
        </template>
      </template>
    </div>
  </main>
</template>

<style scoped>
.customer-portal {
  min-height: 100vh;
  background: #f4f5ed;
  padding-bottom: 70px;
}
.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-top: 28px;
  padding-bottom: 28px;
}
.customer-header > span {
  font-size: 9px;
  letter-spacing: 2px;
  color: #91a17d;
}
.customer-container {
  max-width: 1040px;
}
.customer-title {
  padding: 35px 0;
}
.customer-title h1 {
  font-size: clamp(30px, 5vw, 46px);
  margin: 15px 0;
}
.customer-title > p:not(.p-eyebrow),
.customer-section > p,
.customer-save > p {
  color: #7a8869;
  font-size: 13px;
  line-height: 1.9;
}
.customer-status {
  display: inline-block;
  padding: 9px 14px;
  margin-top: 20px;
  background: #e7eedc;
  border-radius: 22px;
  color: #647e4d;
  font-size: 12px;
}
.customer-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 25px;
}
.customer-tabs button {
  padding: 13px 16px;
  border: 1px solid #d8dfcd;
  background: #fffef9;
  color: #7a8869;
  border-radius: 5px;
  font: inherit;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.customer-tabs .selected {
  background: #e3ecd5;
  color: #617d47;
}
.customer-fields {
  padding: 0;
  margin: 0;
  border: 0;
  min-width: 0;
}
.customer-section {
  padding: 30px;
  margin-bottom: 22px;
  min-width: 0;
}
.customer-section h2 {
  margin-bottom: 22px;
}
.customer-section h3 {
  margin: 18px 0;
}
.customer-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.customer-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 20px;
}
.customer-gallery img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
}
.customer-save {
  padding: 25px;
}
.customer-save .action-group {
  margin-top: 16px;
  flex-wrap: wrap;
}
.customer-unsaved {
  font-size: 12px;
  color: #b17953;
  margin-bottom: 18px;
}
.customer-decisions {
  margin-top: 22px;
  display: grid;
  gap: 20px;
  max-width: 620px;
}
.customer-preview {
  background: #fff;
  border: 1px solid #dce3d3;
  border-radius: 10px;
  overflow: hidden;
}
.customer-preview iframe {
  display: block;
  width: 100%;
  height: min(780px, 85svh);
  min-height: 480px;
  border: 0;
}
.customer-approval {
  scroll-margin-top: 20px;
}
@media (max-width: 700px) {
  .customer-photo-grid,
  .customer-gallery {
    grid-template-columns: 1fr;
  }
  .customer-section {
    padding: 20px;
  }
  .customer-tabs button {
    width: 100%;
    justify-content: center;
  }
  .customer-section .panel-title {
    flex-wrap: wrap;
    gap: 12px;
  }
  .customer-save .p-button {
    width: 100%;
  }
  .customer-header > span {
    font-size: 8px;
    letter-spacing: 1px;
  }
}
</style>
