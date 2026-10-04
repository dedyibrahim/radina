<script setup>
import { ref, onMounted, watch } from 'vue'
import { Download, Upload, Copy, Search } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
import { useUiStore } from '../stores/ui'
const props = defineProps({ base: { type: String, required: true } })
const emit = defineEmits(['busy'])
const ui = useUiStore(),
  file = ref(null),
  preview = ref(null),
  busy = ref(false),
  error = ref(''),
  guests = ref([]),
  total = ref(0),
  page = ref(1),
  lastPage = ref(1),
  search = ref(''),
  result = ref('')
watch(busy, (value) => emit('busy', value))
function selectFile(event) {
  preview.value = null
  result.value = ''
  error.value = ''
  file.value = null
  const selected = event.target.files?.[0]
  if (!selected) return
  if (
    !selected.name.toLowerCase().endsWith('.csv') ||
    selected.size > 2 * 1024 * 1024
  ) {
    error.value = 'Pilih file CSV maksimal 2 MB.'
    event.target.value = ''
    return
  }
  file.value = selected
}
async function download(action) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const response = await api.get(`${props.base}/invitees/${action}`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data),
      a = document.createElement('a')
    a.href = url
    a.download = action === 'template' ? 'template-tamu.csv' : 'tautan-tamu.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    if (e.response?.data instanceof Blob) {
      try {
        e.response.data = JSON.parse(await e.response.data.text())
      } catch {}
    }
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function inspect() {
  if (!file.value || busy.value) return
  busy.value = true
  error.value = ''
  preview.value = null
  try {
    const data = new FormData()
    data.append('file', file.value)
    preview.value = (
      await api.post(`${props.base}/invitees/preview`, data)
    ).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function apply() {
  if (!file.value || !preview.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const data = new FormData()
    data.append('file', file.value)
    const response = (await api.post(`${props.base}/invitees/import`, data))
      .data.data
    result.value = `${response.imported} tamu ditambahkan; ${response.skipped} duplikat dilewati.`
    preview.value = null
    search.value = ''
    await load(1)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function load(number = 1) {
  const response = (
    await api.get(`${props.base}/invitees`, {
      params: { page: number, search: search.value || undefined },
    })
  ).data
  guests.value = response.data
  total.value = response.total
  page.value = response.current_page
  lastPage.value = response.last_page
}
async function find(number = 1) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await load(number)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function copy(guest) {
  try {
    await navigator.clipboard.writeText(guest.link)
    ui.toast('Tautan tamu disalin.')
  } catch {
    ui.toast('Buka tautan tamu dan salin alamat dari browser.')
  }
}
onMounted(() => find())
</script>
<template>
  <div class="customer-guests">
    <h2>Daftar tamu undangan</h2>
    <p>
      Unduh template, isi nama dan alamat di Excel atau Google Sheets, lalu
      simpan sebagai CSV UTF-8. Link personal dibuat otomatis untuk setiap tamu.
      Tautan dapat dibuka setelah undangan dipublish.
    </p>
    <div class="action-group">
      <button
        type="button"
        class="p-button secondary"
        :disabled="busy"
        @click="download('template')"
      >
        <Download :size="16" />Unduh Template Tamu
      </button>
      <button
        type="button"
        class="p-button secondary"
        :disabled="busy || !total"
        @click="download('export')"
      >
        <Download :size="16" />Unduh Tautan Tamu
      </button>
    </div>
    <div class="guest-import">
      <label for="customer-guest-csv">File daftar tamu (CSV)</label>
      <input
        id="customer-guest-csv"
        type="file"
        accept=".csv,text/csv"
        :disabled="busy"
        @change="selectFile"
      />
      <p>
        Maksimal 1.000 baris per file, 2 MB; total 10.000 tamu. Nama dan alamat
        yang sama dilewati. Data tamu sebelumnya tetap tersimpan.
      </p>
      <button
        type="button"
        class="p-button secondary"
        :disabled="busy || !file"
        @click="inspect"
      >
        <Upload :size="16" />Periksa Daftar Tamu
      </button>
      <div v-if="preview" class="guest-inspection">
        <p role="status">
          <strong>{{ preview.new_count }}</strong> tamu baru,
          <strong>{{ preview.duplicate_count }}</strong> duplikat. Berikut
          contoh hingga 10 baris:
        </p>
        <ul>
          <li v-for="guest in preview.rows.slice(0, 10)" :key="guest.row">
            {{ guest.name }} — {{ guest.address }}
            <span v-if="guest.duplicate">(duplikat)</span>
          </li>
        </ul>
        <button
          type="button"
          class="p-button"
          :disabled="busy || !preview.new_count"
          @click="apply"
        >
          Impor &amp; Buat Tautan Tamu
        </button>
      </div>
    </div>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <p v-if="result" class="alert" role="status">{{ result }}</p>
    <form class="guest-search" @submit.prevent="find()">
      <label for="customer-guest-search">Cari nama tamu</label>
      <input
        id="customer-guest-search"
        v-model="search"
        type="search"
        maxlength="120"
        :disabled="busy"
      />
      <button class="p-button secondary" :disabled="busy">
        <Search :size="16" />Cari Tamu
      </button>
    </form>
    <p>
      {{ total }} tamu{{ search ? ' sesuai pencarian' : ' tersimpan' }}. Ekspor
      memuat seluruh daftar tamu.
    </p>
    <div v-if="guests.length" class="guest-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Alamat</th>
            <th>Tautan undangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in guests" :key="guest.id">
            <td>{{ guest.name }}</td>
            <td>{{ guest.address }}</td>
            <td>
              <div class="guest-link-actions">
                <button type="button" class="text-link" @click="copy(guest)">
                  <Copy :size="14" />Salin Link</button
                ><a :href="guest.link" target="_blank" rel="noopener noreferrer"
                  >Lihat Undangan</a
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="lastPage > 1" class="action-group guest-pagination">
      <button
        type="button"
        class="p-button secondary"
        :disabled="busy || page === 1"
        @click="find(page - 1)"
      >
        Sebelumnya</button
      ><span>{{ page }} / {{ lastPage }}</span
      ><button
        type="button"
        class="p-button secondary"
        :disabled="busy || page >= lastPage"
        @click="find(page + 1)"
      >
        Berikutnya
      </button>
    </div>
  </div>
</template>
<style scoped>
.customer-guests > p,
.guest-import p {
  font-size: 13px;
  line-height: 1.8;
  color: #7a8869;
}
.customer-guests .action-group {
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}
.guest-import {
  margin: 28px 0;
  padding: 20px;
  border: 1px solid #d8dfcd;
  border-radius: 8px;
}
.guest-import label,
.guest-search label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
}
.guest-import input {
  max-width: 100%;
}
.guest-inspection {
  margin-top: 20px;
}
.guest-inspection ul {
  margin: 15px 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
.guest-search {
  margin: 24px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.guest-search label {
  width: 100%;
}
.guest-search input {
  min-width: 0;
  flex: 1;
  border: 1px solid #d8dfcd;
  background: #fffef9;
  padding: 12px;
  border-radius: 5px;
  font: inherit;
}
.guest-table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}
th,
td {
  padding: 14px 10px;
  border-bottom: 1px solid #d8dfcd;
  vertical-align: top;
  overflow-wrap: anywhere;
}
.guest-link-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 100px;
}
.guest-pagination {
  align-items: center;
}
@media (max-width: 700px) {
  .customer-guests .action-group .p-button {
    width: 100%;
  }
  .guest-import {
    padding: 14px;
  }
}
</style>
