<script setup>
import { ref, computed } from 'vue'
import CustomerGuestImport from './CustomerGuestImport.vue'
import { Download, Upload } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  wedding: { type: Object, required: true },
  blocked: Boolean,
})
const isWedding = computed(
  () => !props.wedding.event_type || props.wedding.event_type === 'wedding',
)
const emit = defineEmits(['updated', 'busy'])
const ui = useUiStore()
const selected = ref({ content: null })
const previews = ref({ content: null })
const errors = ref({ content: '' })
const busy = ref(''),
  guestBusy = ref(false)
function handleGuestBusy(value) {
  guestBusy.value = value
  emit('busy', value)
}
const base = () => `/admin/weddings/${props.wedding.id}`

function selectFile(kind, event) {
  previews.value[kind] = null
  errors.value[kind] = ''
  const file = event.target.files?.[0]
  selected.value[kind] = null
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.csv') || file.size > 2 * 1024 * 1024) {
    errors.value[kind] = 'Pilih file CSV berukuran maksimal 2 MB.'
    event.target.value = ''
    return
  }
  selected.value[kind] = file
}
async function download(kind, action) {
  busy.value = `download-${kind}-${action}`
  errors.value[kind] = ''
  try {
    const response = await api.get(`${base()}/${kind}/${action}`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download =
      action === 'template'
        ? kind === 'content'
          ? 'template-data-pernikahan.csv'
          : 'template-tamu.csv'
        : `${kind === 'content' ? 'data-pernikahan' : 'tautan-tamu'}-${props.wedding.slug}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text())
      } catch {
        /* Use the connection error fallback. */
      }
    }
    errors.value[kind] = errorMessage(error)
  } finally {
    busy.value = ''
  }
}
async function preview(kind) {
  if (
    !selected.value[kind] ||
    busy.value ||
    guestBusy.value ||
    (kind === 'content' && props.blocked)
  )
    return
  busy.value = `preview-${kind}`
  errors.value[kind] = ''
  previews.value[kind] = null
  try {
    const body = new FormData()
    body.append('file', selected.value[kind])
    previews.value[kind] = (await api.post(`${base()}/${kind}/preview`, body)).data.data
  } catch (error) {
    errors.value[kind] = errorMessage(error)
  } finally {
    busy.value = ''
  }
}
async function apply(kind) {
  if (
    !previews.value[kind] ||
    busy.value ||
    guestBusy.value ||
    (kind === 'content' && props.blocked)
  )
    return
  busy.value = `import-${kind}`
  errors.value[kind] = ''
  emit('busy', true)
  try {
    const body = new FormData()
    body.append('file', selected.value[kind])
    if (kind === 'content')
      body.append('expected_updated_at', previews.value.content.expected_updated_at)
    const result = (await api.post(`${base()}/${kind}/import`, body)).data.data
    previews.value[kind] = null
    emit('updated', result)
    ui.toast('Data pernikahan berhasil diimpor dan disimpan.')
  } catch (error) {
    errors.value[kind] = errorMessage(error)
    if (error.response?.status === 409) previews.value[kind] = null
  } finally {
    busy.value = ''
    emit('busy', false)
  }
}
</script>

<template>
  <div class="wedding-import-export">
    <h2>Impor &amp; ekspor</h2>
    <p class="panel-subtitle">
      Bagikan template kepada pelanggan, lalu unggah hasilnya di sini. Buka CSV di Excel atau Google
      Sheets dan simpan kembali sebagai CSV UTF-8.
    </p>

    <section class="import-section" aria-labelledby="content-import-title">
      <p class="p-eyebrow">01 / DATA PERNIKAHAN</p>
      <h3 id="content-import-title">Satu file untuk cerita mereka.</h3>
      <p>
        Isi kolom <strong>nilai</strong> pada template. Kolom kosong mempertahankan data lama.
        Tanggal: YYYY-MM-DD, jam: HH:MM. Foto dan audio bisa diisi dengan URL atau diunggah melalui
        editor. Format nomor rekening dan telepon sebagai Teks agar angka nol di depan tetap
        tersimpan.
      </p>
      <div class="action-group import-actions">
        <button
          type="button"
          class="p-button secondary small"
          :disabled="Boolean(busy) || guestBusy"
          @click="download('content', 'template')"
        >
          <Download :size="16" />{{
            isWedding ? 'Unduh Template Pernikahan' : 'Unduh Template Acara'
          }}
        </button>
        <button
          type="button"
          class="p-button secondary small"
          :disabled="Boolean(busy) || guestBusy"
          @click="download('content', 'export')"
        >
          <Download :size="16" />{{ isWedding ? 'Ekspor Data Pernikahan' : 'Ekspor Data Acara' }}
        </button>
      </div>
      <p v-if="blocked && !busy" class="alert" role="alert">
        Simpan perubahan editor terlebih dahulu sebelum mengimpor data undangan.
      </p>
      <label class="import-file-label" for="wedding-content-csv">{{
        isWedding ? 'File data pernikahan' : 'File data acara'
      }}</label>
      <input
        id="wedding-content-csv"
        class="import-file"
        type="file"
        accept=".csv,text/csv"
        :disabled="Boolean(busy) || guestBusy || blocked"
        @change="selectFile('content', $event)"
      />
      <button
        type="button"
        class="p-button small"
        :disabled="!selected.content || Boolean(busy) || guestBusy || blocked"
        @click="preview('content')"
      >
        <Upload :size="16" />{{
          busy === 'preview-content'
            ? 'Memeriksaâ€¦'
            : isWedding
              ? 'Periksa Data Pernikahan'
              : 'Periksa Data Acara'
        }}
      </button>
      <p v-if="errors.content" class="alert error" role="alert">
        {{ errors.content }}
      </p>
      <div v-if="previews.content" class="import-preview">
        <h4>{{ previews.content.changes.length }} perubahan siap diimpor</h4>
        <p>
          Periksa perubahan berikut. Impor akan langsung menyimpan konten, termasuk pada undangan
          yang sudah aktif.
        </p>
        <div class="import-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kolom</th>
                <th>Sebelum</th>
                <th>Sesudah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="change in previews.content.changes" :key="change.key">
                <td>{{ change.label }}</td>
                <td>{{ change.before || 'â€”' }}</td>
                <td>{{ change.after }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          class="p-button small"
          :disabled="Boolean(busy) || guestBusy || blocked"
          @click="apply('content')"
        >
          {{
            busy === 'import-content'
              ? 'Mengimporâ€¦'
              : isWedding
                ? 'Impor & Simpan Pernikahan'
                : 'Impor & Simpan Acara'
          }}
        </button>
      </div>
    </section>

    <section class="import-section">
      <CustomerGuestImport
        :base="base()"
        allow-delete
        :blocked="Boolean(busy)"
        @busy="handleGuestBusy"
      />
    </section>
  </div>
</template>

<style scoped>
.wedding-import-export {
  min-width: 0;
}
.import-section {
  padding: 30px 0;
  border-top: 1px solid #e0e5d7;
}
.import-section h3 {
  margin: 10px 0 16px;
}
.import-section > p,
.import-preview > p {
  font-size: 13px;
  line-height: 1.9;
  color: #788568;
  overflow-wrap: anywhere;
}
.import-actions {
  margin: 22px 0;
  flex-wrap: wrap;
}
.import-file-label {
  display: block;
  font-size: 13px;
  margin: 18px 0 10px;
}
.import-file {
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 14px;
  border: 1px dashed #b9c6aa;
  border-radius: 6px;
  margin-bottom: 14px;
  font: inherit;
  font-size: 12px;
  background: #f8faf3;
}
.import-preview {
  margin-top: 24px;
  padding: 20px;
  background: #f8faf3;
  border-radius: 8px;
  min-width: 0;
}
.import-preview h4 {
  margin: 0 0 10px;
  font-size: 14px;
}
.import-table-wrap {
  overflow-x: auto;
  max-width: 100%;
  margin: 18px 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 540px;
  table-layout: fixed;
}
th,
td {
  padding: 13px 12px;
  text-align: left;
  vertical-align: top;
  font-size: 12px;
  line-height: 1.7;
  border-bottom: 1px solid #e0e5d7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
th {
  color: #788568;
  font-weight: 600;
}
td p {
  margin: 5px 0 0;
  color: #788568;
}
.guest-directory th:last-child {
  width: 92px;
}
.guest-link {
  color: #995e4c;
  overflow-wrap: anywhere;
}
.guest-link svg {
  vertical-align: middle;
  margin-left: 4px;
}
.guest-link-actions {
  display: flex;
  gap: 4px;
}
.invitee-search {
  margin: 22px 0;
}
.invitee-search label {
  display: block;
  font-size: 13px;
  margin-bottom: 10px;
}
.invitee-search > div {
  display: flex;
  gap: 12px;
  max-width: 450px;
}
.invitee-search input {
  width: 100%;
  min-width: 0;
  border: 1px solid #d8dfce;
  border-radius: 5px;
  padding: 12px;
  font: inherit;
  font-size: 13px;
}
.invitee-total {
  margin: 16px 0;
}
@media (max-width: 500px) {
  .import-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .import-actions .p-button {
    width: 100%;
  }
  .import-preview {
    padding: 14px;
  }
}
</style>
