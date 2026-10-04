<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Download, Upload, Copy, Search, MessageCircle, Eye, ExternalLink, Trash2 } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
import { useUiStore } from '../stores/ui'
import BaseModal from './BaseModal.vue'
const props = defineProps({
  base: { type: String, required: true },
  allowDelete: Boolean,
  blocked: Boolean,
})
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
  result = ref(''),
  format = ref('xlsx')
const sharing = ref({}),
  messageDraft = ref(''),
  selectedGuest = ref(null),
  phoneDraft = ref('')
const disabled = computed(() => busy.value || props.blocked)
const messageDirty = computed(() => messageDraft.value !== sharing.value.message_template)
watch(busy, (value) => emit('busy', value))
function message(guest, template = sharing.value.message_template || '') {
  const values = {
    nama_tamu: guest.name,
    nama_acara: sharing.value.event_title || '',
    tanggal_acara: sharing.value.event_date || '',
    link_undangan: guest.link,
  }
  return template.replace(
    /\{(nama_tamu|nama_acara|tanggal_acara|link_undangan)\}/g,
    (_, key) => values[key],
  )
}
function whatsappUrl(guest) {
  return `https://wa.me/${guest.whatsapp}?text=${encodeURIComponent(message(guest))}`
}
const example = computed(() =>
  message(
    guests.value[0] || {
      name: 'Bapak/Ibu Tamu Undangan',
      link: `${location.origin}/i/contoh-tautan`,
    },
    messageDraft.value,
  ),
)
function selectFile(event) {
  preview.value = null
  result.value = ''
  error.value = ''
  file.value = null
  const selected = event.target.files?.[0]
  if (!selected) return
  if (!/\.(csv|xlsx)$/i.test(selected.name) || selected.size > 2 * 1024 * 1024) {
    error.value = 'Pilih file Excel .xlsx atau CSV maksimal 2 MB.'
    event.target.value = ''
    return
  }
  file.value = selected
}
async function download(action) {
  if (disabled.value) return
  busy.value = true
  error.value = ''
  try {
    const response = await api.get(`${props.base}/invitees/${action}`, {
      responseType: 'blob',
      params: { format: format.value },
    })
    const url = URL.createObjectURL(response.data),
      a = document.createElement('a')
    a.href = url
    a.download = `${action === 'template' ? 'template-tamu' : 'tautan-tamu'}.${format.value}`
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
  if (!file.value || disabled.value) return
  busy.value = true
  error.value = ''
  preview.value = null
  try {
    const data = new FormData()
    data.append('file', file.value)
    preview.value = (await api.post(`${props.base}/invitees/preview`, data)).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function apply() {
  if (!file.value || !preview.value || disabled.value) return
  busy.value = true
  error.value = ''
  try {
    const data = new FormData()
    data.append('file', file.value)
    const response = (await api.post(`${props.base}/invitees/import`, data)).data.data
    result.value = `${response.imported} tamu ditambahkan; ${response.updated} nomor WA dilengkapi; ${response.skipped} duplikat dilewati; ${response.conflicts} perbedaan nomor dilewati.`
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
  const dirty = messageDirty.value
  sharing.value = response.sharing
  if (!dirty || !messageDraft.value) messageDraft.value = response.sharing.message_template
}
async function find(number = 1) {
  if (disabled.value) return
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
async function saveMessage(reset = false) {
  if (disabled.value) return
  busy.value = true
  error.value = ''
  try {
    sharing.value = (
      await api.patch(`${props.base}/invitees/message`, {
        message_template: reset ? null : messageDraft.value,
      })
    ).data.data
    messageDraft.value = sharing.value.message_template
    ui.toast('Kata-kata undangan disimpan.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
function inspectGuest(guest) {
  selectedGuest.value = guest
  phoneDraft.value = guest.whatsapp || ''
  error.value = ''
}
async function savePhone() {
  if (disabled.value || !selectedGuest.value) return
  busy.value = true
  error.value = ''
  try {
    const guest = (
      await api.patch(`${props.base}/invitees/${selectedGuest.value.id}/phone`, {
        whatsapp: phoneDraft.value,
        expected_whatsapp: selectedGuest.value.whatsapp,
      })
    ).data.data
    const index = guests.value.findIndex((item) => item.id === guest.id)
    if (index >= 0) guests.value[index] = guest
    selectedGuest.value = guest
    phoneDraft.value = guest.whatsapp || ''
    ui.toast('Nomor WhatsApp disimpan.')
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
async function copyMessage(guest) {
  try {
    await navigator.clipboard.writeText(message(guest))
    ui.toast('Pesan undangan disalin.')
  } catch {
    ui.toast('Pilih dan salin teks pada pratinjau pesan.')
  }
}
async function remove(guest) {
  if (
    disabled.value ||
    !props.allowDelete ||
    !window.confirm(`Hapus ${guest.name} dari daftar tamu?`)
  )
    return
  busy.value = true
  error.value = ''
  try {
    await api.delete(`${props.base}/invitees/${guest.id}`)
    await load(guests.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
onMounted(() => find())
</script>
<template>
  <div class="customer-guests">
    <h2>Daftar tamu &amp; kirim undangan</h2>
    <p>
      Unduh template, isi nama, alamat, dan nomor WhatsApp di Excel atau Google Sheets. Nama wajib;
      alamat dan nomor WA boleh kosong. Tautan pendek dibuat otomatis dan dapat dibuka setelah
      undangan dipublish.
    </p>
    <div class="action-group">
      <label class="format-choice"
        >Format unduhan
        <select v-model="format" :disabled="disabled">
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="csv">CSV UTF-8</option>
        </select></label
      >
      <button
        type="button"
        class="p-button secondary"
        :disabled="disabled"
        @click="download('template')"
      >
        <Download :size="16" />Unduh Template Tamu
      </button>
      <button
        type="button"
        class="p-button secondary"
        :disabled="disabled || !total"
        @click="download('export')"
      >
        <Download :size="16" />Unduh Tautan Tamu
      </button>
    </div>
    <div class="guest-import">
      <label for="customer-guest-csv">File daftar tamu (Excel / CSV)</label>
      <input
        id="customer-guest-csv"
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :disabled="disabled"
        @change="selectFile"
      />
      <p>
        Maksimal 1.000 baris per file, 2 MB; total 10.000 tamu. Nama dan alamat yang sama tidak
        dibuat ulang. Nomor kosong bisa dilengkapi melalui impor; nomor yang berbeda perlu diperiksa
        dan diedit secara manual.
      </p>
      <button
        type="button"
        class="p-button secondary"
        :disabled="disabled || !file"
        @click="inspect"
      >
        <Upload :size="16" />Periksa Daftar Tamu
      </button>
      <div v-if="preview" class="guest-inspection">
        <p role="status">
          <strong>{{ preview.new_count }}</strong> tamu baru,
          <strong>{{ preview.update_count }}</strong> nomor WA dilengkapi,
          <strong>{{ preview.duplicate_count }}</strong> duplikat,
          <strong>{{ preview.conflict_count }}</strong> perbedaan nomor. Contoh hingga 10 baris:
        </p>
        <ul>
          <li v-for="guest in preview.rows.slice(0, 10)" :key="guest.row">
            {{ guest.name }} ? {{ guest.address || 'Tanpa alamat' }} ?
            {{ guest.whatsapp || 'Tanpa nomor WA' }}
            <span
              >({{
                {
                  new: 'tamu baru',
                  update: 'lengkapi nomor WA',
                  skip: 'duplikat dilewati',
                  conflict: 'nomor berbeda, dilewati',
                }[guest.action]
              }})</span
            >
          </li>
        </ul>
        <button
          type="button"
          class="p-button"
          :disabled="disabled || !(preview.new_count + preview.update_count)"
          @click="apply"
        >
          Impor &amp; Buat Tautan Tamu
        </button>
      </div>
    </div>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <p v-if="result" class="alert" role="status">{{ result }}</p>
    <details class="guest-composer">
      <summary>Atur kata-kata undangan WhatsApp</summary>
      <label for="guest-message-template">Teks undangan</label>
      <textarea
        id="guest-message-template"
        v-model="messageDraft"
        rows="12"
        maxlength="3000"
        :disabled="disabled"
      />
      <p>
        Variabel: <code>{nama_tamu}</code>, <code>{nama_acara}</code>, <code>{tanggal_acara}</code>,
        <code>{link_undangan}</code>. Nama tamu dan tautan wajib ada.
      </p>
      <div class="action-group">
        <button
          type="button"
          class="p-button"
          :disabled="disabled || !messageDirty"
          @click="saveMessage()"
        >
          Simpan Kata-kata</button
        ><button
          type="button"
          class="p-button secondary"
          :disabled="disabled"
          @click="saveMessage(true)"
        >
          Gunakan Pesan Bawaan
        </button>
      </div>
      <p v-if="messageDirty" role="status">
        Perubahan belum disimpan. Tombol Kirim WA dan ekspor memakai pesan yang terakhir disimpan.
      </p>
      <h3>Contoh pesan</h3>
      <pre class="guest-message-preview">{{ example }}</pre>
    </details>
    <form class="guest-search" @submit.prevent="find()">
      <label for="customer-guest-search">Cari nama tamu</label
      ><input
        id="customer-guest-search"
        v-model="search"
        type="search"
        maxlength="120"
        :disabled="disabled"
      /><button type="submit" class="p-button secondary" :disabled="disabled">
        <Search :size="16" />Cari Tamu
      </button>
    </form>
    <p role="status">
      {{ total }} tamu {{ search ? 'ditemukan' : 'tersimpan' }}. Ekspor memuat seluruh daftar tamu,
      pesan, dan tautannya.
    </p>
    <div v-if="guests.length" class="guest-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Alamat</th>
            <th>WhatsApp</th>
            <th>Tautan &amp; kirim undangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in guests" :key="guest.id">
            <td>{{ guest.name }}</td>
            <td>{{ guest.address || '?' }}</td>
            <td>
              {{ guest.whatsapp ? '+' + guest.whatsapp : 'Belum diisi'
              }}<button
                type="button"
                class="text-link"
                :disabled="disabled"
                @click="inspectGuest(guest)"
              >
                {{ guest.whatsapp ? 'Edit Nomor WA' : 'Lengkapi Nomor WA' }}
              </button>
            </td>
            <td>
              <div class="guest-link-actions">
                <button type="button" class="text-link" @click="copy(guest)">
                  <Copy :size="14" />Salin Link
                </button>
                <a
                  class="guest-view-button"
                  :href="guest.link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink :size="16" />Lihat Undangan
                </a>
                <a
                  v-if="guest.whatsapp"
                  class="guest-wa-button"
                  :href="whatsappUrl(guest)"
                  target="_blank"
                  rel="noopener noreferrer"
                  ><MessageCircle :size="16" />Kirim WA</a
                >
                <button
                  type="button"
                  class="text-link"
                  :disabled="disabled"
                  @click="inspectGuest(guest)"
                >
                  <Eye :size="14" />Preview Pesan
                </button>
                <button
                  v-if="allowDelete"
                  type="button"
                  class="text-link"
                  :disabled="disabled"
                  :aria-label="`Hapus tamu ${guest.name}`"
                  @click="remove(guest)"
                >
                  <Trash2 :size="14" />Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>
      {{
        search
          ? 'Nama tamu tidak ditemukan.'
          : 'Belum ada tamu. Unggah daftar tamu untuk membuat tautan otomatis.'
      }}
    </p>
    <p class="guest-wa-note">
      Kirim WA membuka WhatsApp dengan pesan dan tautan siap dikirim. Periksa penerima, lalu tekan
      Kirim di WhatsApp.
    </p>
    <div v-if="lastPage > 1" class="action-group guest-pagination">
      <button
        type="button"
        class="p-button secondary"
        :disabled="disabled || page === 1"
        @click="find(page - 1)"
      >
        Sebelumnya</button
      ><span>{{ page }} / {{ lastPage }}</span
      ><button
        type="button"
        class="p-button secondary"
        :disabled="disabled || page >= lastPage"
        @click="find(page + 1)"
      >
        Berikutnya
      </button>
    </div>
    <BaseModal
      :open="Boolean(selectedGuest)"
      title="Preview pesan undangan"
      @close="!busy && (selectedGuest = null)"
      ><div v-if="selectedGuest" class="platform guest-message-modal">
        <h2>{{ selectedGuest.name }}</h2>
        <form @submit.prevent="savePhone">
          <label for="guest-wa-phone">Nomor WhatsApp tamu</label
          ><input
            id="guest-wa-phone"
            v-model="phoneDraft"
            type="tel"
            maxlength="40"
            placeholder="081234567890"
            :disabled="disabled"
          /><button
            type="submit"
            class="p-button secondary"
            :disabled="disabled || phoneDraft === (selectedGuest.whatsapp || '')"
          >
            Simpan Nomor WA
          </button>
        </form>
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <pre class="guest-message-preview">{{ message(selectedGuest) }}</pre>
        <div class="action-group">
          <button type="button" class="p-button secondary" @click="copyMessage(selectedGuest)">
            <Copy :size="16" />Salin Pesan</button
          ><a
            v-if="selectedGuest.whatsapp && phoneDraft === selectedGuest.whatsapp"
            :href="whatsappUrl(selectedGuest)"
            target="_blank"
            rel="noopener noreferrer"
            class="guest-wa-button"
            ><MessageCircle :size="16" />Kirim WA</a
          >
        </div>
        <p>
          Simpan perubahan nomor terlebih dahulu. Pesan dikirim setelah Anda menekan Kirim di
          WhatsApp.
        </p>
      </div></BaseModal
    >
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
  align-items: center;
  gap: 12px;
  min-width: 100px;
}
.guest-pagination {
  align-items: center;
}
@media (max-width: 700px) {
  .guest-table-wrap {
    overflow: visible;
  }
  table thead {
    display: none;
  }
  table tbody tr {
    display: grid;
    gap: 8px;
    margin: 12px 0;
    padding: 14px;
    border: 1px solid #d8dfcd;
    border-radius: 8px;
  }
  table td {
    display: block;
    min-width: 0;
    padding: 0;
    border: 0;
  }
  table td:first-child {
    font-weight: 600;
  }
  table td:nth-child(2)::before {
    content: 'Alamat: ';
  }
  table td:nth-child(3)::before {
    content: 'WhatsApp: ';
  }
  .guest-link-actions {
    margin-top: 10px;
  }
  .customer-guests .action-group .p-button {
    width: 100%;
  }
  .guest-import {
    padding: 14px;
  }
}
.format-choice {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
select,
.guest-composer textarea,
.guest-message-modal input {
  font: inherit;
  padding: 12px;
  border: 1px solid #d8dfcd;
  border-radius: 6px;
  background: #fffef9;
  color: #40352e;
}
.guest-composer {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #d8dfcd;
  border-radius: 8px;
}
.guest-composer summary {
  cursor: pointer;
  font-weight: 600;
}
.guest-composer label {
  display: block;
  margin: 18px 0 10px;
}
.guest-composer textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
}
.guest-composer p,
.guest-message-modal p {
  font-size: 13px;
  line-height: 1.8;
}
.guest-message-preview {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  font-size: 13px;
  line-height: 1.8;
  background: #f3f5ed;
  border-radius: 8px;
  padding: 18px;
}
.guest-view-button,
.guest-wa-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}
.guest-view-button {
  border: 1px solid #d8dfcd;
  background: #fffef9;
  color: #526949;
}
.guest-view-button:hover {
  border-color: #93ad78;
  background: #f3f5ed;
}
.guest-view-button:focus-visible,
.guest-wa-button:focus-visible {
  outline: 2px solid #227c4f;
  outline-offset: 3px;
}
.guest-view-button svg,
.guest-wa-button svg {
  flex-shrink: 0;
}
.guest-wa-button {
  background: #227c4f;
  color: white;
}
.guest-wa-button:hover {
  background: #185e3a;
}
td > .text-link {
  display: block;
  margin-top: 8px;
}
.guest-message-modal form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.guest-message-modal label {
  flex-basis: 100%;
}
.guest-message-modal input {
  flex: 1;
  min-width: 0;
}
.guest-message-modal .action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
