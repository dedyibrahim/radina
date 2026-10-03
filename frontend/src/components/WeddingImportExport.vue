<script setup>
import { ref, onMounted, computed } from 'vue'
import { Download, Upload, Copy, ExternalLink, Trash2, Search } from 'lucide-vue-next'
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
const selected = ref({ content: null, invitees: null })
const previews = ref({ content: null, invitees: null })
const errors = ref({ content: '', invitees: '', list: '' })
const busy = ref('')
const guests = ref([]),
  total = ref(0),
  page = ref(1),
  lastPage = ref(1),
  search = ref('')
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
  if (!selected.value[kind] || busy.value || (kind === 'content' && props.blocked)) return
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
  if (!previews.value[kind] || busy.value || (kind === 'content' && props.blocked)) return
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
    if (kind === 'content') {
      emit('updated', result)
      ui.toast('Data pernikahan berhasil diimpor dan disimpan.')
    } else {
      ui.toast(`${result.imported} tamu ditambahkan. ${result.skipped} data duplikat dilewati.`)
      search.value = ''
      await loadGuests(1)
    }
  } catch (error) {
    errors.value[kind] = errorMessage(error)
    if (error.response?.status === 409) previews.value[kind] = null
  } finally {
    busy.value = ''
    emit('busy', false)
  }
}
async function loadGuests(number = 1) {
  errors.value.list = ''
  try {
    const result = (
      await api.get(`${base()}/invitees`, {
        params: { page: number, search: search.value || undefined },
      })
    ).data
    guests.value = result.data
    total.value = result.total
    page.value = result.current_page
    lastPage.value = result.last_page
  } catch (error) {
    errors.value.list = errorMessage(error)
  }
}
async function copy(guest) {
  try {
    await navigator.clipboard.writeText(guest.link)
    ui.toast(`Tautan untuk ${guest.name} disalin.`)
  } catch {
    ui.toast('Buka tautan dan salin alamat dari browser.')
  }
}
async function remove(guest) {
  if (busy.value || !window.confirm(`Hapus ${guest.name} dari daftar tamu?`)) return
  busy.value = 'delete'
  try {
    await api.delete(`${base()}/invitees/${guest.id}`)
    await loadGuests(guests.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
  } catch (error) {
    errors.value.list = errorMessage(error)
  } finally {
    busy.value = ''
  }
}
onMounted(() => loadGuests())
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
          :disabled="Boolean(busy)"
          @click="download('content', 'template')"
        >
          <Download :size="16" />{{
            isWedding ? 'Unduh Template Pernikahan' : 'Unduh Template Acara'
          }}
        </button>
        <button
          type="button"
          class="p-button secondary small"
          :disabled="Boolean(busy)"
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
        :disabled="Boolean(busy) || blocked"
        @change="selectFile('content', $event)"
      />
      <button
        type="button"
        class="p-button small"
        :disabled="!selected.content || Boolean(busy) || blocked"
        @click="preview('content')"
      >
        <Upload :size="16" />{{
          busy === 'preview-content'
            ? 'Memeriksa…'
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
                <td>{{ change.before || '—' }}</td>
                <td>{{ change.after }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          class="p-button small"
          :disabled="Boolean(busy) || blocked"
          @click="apply('content')"
        >
          {{
            busy === 'import-content'
              ? 'Mengimpor…'
              : isWedding
                ? 'Impor & Simpan Pernikahan'
                : 'Impor & Simpan Acara'
          }}
        </button>
      </div>
    </section>

    <section class="import-section" aria-labelledby="invitee-import-title">
      <p class="p-eyebrow">02 / DAFTAR TAMU</p>
      <h3 id="invitee-import-title">Nama, alamat, tautan personal.</h3>
      <p>
        Isi kolom <strong>nama</strong> dan <strong>alamat</strong>, satu tamu atau keluarga per
        baris. Maksimal 1.000 baris per file. Data dengan nama dan alamat yang sama dilewati. Alamat
        tersimpan di dashboard dan hasil ekspor; tautan publik hanya memuat nama tamu.
      </p>
      <div class="action-group import-actions">
        <button
          type="button"
          class="p-button secondary small"
          :disabled="Boolean(busy)"
          @click="download('invitees', 'template')"
        >
          <Download :size="16" />Unduh Template Tamu
        </button>
        <button
          type="button"
          class="p-button secondary small"
          :disabled="Boolean(busy)"
          @click="download('invitees', 'export')"
        >
          <Download :size="16" />Unduh Tautan Tamu
        </button>
      </div>
      <label class="import-file-label" for="wedding-invitees-csv">File daftar tamu</label>
      <input
        id="wedding-invitees-csv"
        class="import-file"
        type="file"
        accept=".csv,text/csv"
        :disabled="Boolean(busy)"
        @change="selectFile('invitees', $event)"
      />
      <button
        type="button"
        class="p-button small"
        :disabled="!selected.invitees || Boolean(busy)"
        @click="preview('invitees')"
      >
        <Upload :size="16" />{{
          busy === 'preview-invitees' ? 'Memeriksa…' : 'Periksa Daftar Tamu'
        }}
      </button>
      <p v-if="errors.invitees" class="alert error" role="alert">
        {{ errors.invitees }}
      </p>
      <div v-if="previews.invitees" class="import-preview">
        <h4>
          {{ previews.invitees.new_count }} tamu baru ·
          {{ previews.invitees.duplicate_count }} duplikat dilewati
        </h4>
        <div class="import-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Alamat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="guest in previews.invitees.rows.slice(0, 20)" :key="guest.row">
                <td>{{ guest.name }}</td>
                <td>{{ guest.address }}</td>
                <td>
                  {{ guest.duplicate ? 'Dilewati' : 'Tamu baru' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="previews.invitees.rows.length > 20">
          Menampilkan 20 baris pertama. Semua
          {{ previews.invitees.rows.length }} baris sudah diperiksa.
        </p>
        <button
          type="button"
          class="p-button small"
          :disabled="Boolean(busy) || !previews.invitees.new_count"
          @click="apply('invitees')"
        >
          {{ busy === 'import-invitees' ? 'Mengimpor…' : 'Impor Tamu & Buat Tautan' }}
        </button>
      </div>
    </section>

    <section class="import-section guest-directory" aria-labelledby="invitee-directory-title">
      <h3 id="invitee-directory-title">Daftar tamu &amp; tautan undangan</h3>
      <p v-if="wedding.status !== 'PUBLISHED'" class="alert">
        Tautan sudah dapat dibuat dan diunduh. Tamu bisa membukanya setelah undangan dipublish.
      </p>
      <form class="invitee-search" @submit.prevent="loadGuests(1)">
        <label for="invitee-search">Cari nama tamu</label>
        <div>
          <input
            id="invitee-search"
            v-model="search"
            type="search"
            maxlength="120"
            placeholder="Nama tamu"
          /><button type="submit" class="p-button secondary small">
            <Search :size="16" />Cari
          </button>
        </div>
      </form>
      <p v-if="errors.list" class="alert error" role="alert">
        {{ errors.list }}
      </p>
      <p class="invitee-total" role="status">
        {{ total }} tamu{{ search ? ' ditemukan' : ' tersimpan' }}
      </p>
      <div v-if="guests.length" class="import-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama &amp; alamat</th>
              <th>Tautan undangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="guest in guests" :key="guest.id">
              <td>
                <strong>{{ guest.name }}</strong>
                <p>{{ guest.address }}</p>
              </td>
              <td>
                <a :href="guest.link" target="_blank" rel="noopener" class="guest-link"
                  >{{ guest.link }}<ExternalLink :size="13"
                /></a>
              </td>
              <td>
                <div class="guest-link-actions">
                  <button
                    type="button"
                    class="icon-button"
                    :aria-label="`Salin tautan ${guest.name}`"
                    @click="copy(guest)"
                  >
                    <Copy :size="16" /></button
                  ><button
                    type="button"
                    class="icon-button"
                    :disabled="Boolean(busy)"
                    :aria-label="`Hapus tamu ${guest.name}`"
                    @click="remove(guest)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-note">
        {{
          search
            ? 'Nama tamu tidak ditemukan.'
            : 'Belum ada tamu. Unggah daftar tamu untuk membuat tautan otomatis.'
        }}
      </p>
      <div v-if="lastPage > 1" class="action-group import-actions">
        <button
          type="button"
          class="p-button secondary small"
          :disabled="page <= 1"
          @click="loadGuests(page - 1)"
        >
          Sebelumnya</button
        ><span>{{ page }} / {{ lastPage }}</span
        ><button
          type="button"
          class="p-button secondary small"
          :disabled="page >= lastPage"
          @click="loadGuests(page + 1)"
        >
          Berikutnya
        </button>
      </div>
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
