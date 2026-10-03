<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Copy, PenLine, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { useUiStore } from '../../stores/ui'
import FormField from '../../components/FormField.vue'
import BaseModal from '../../components/BaseModal.vue'
import PageState from '../../components/PageState.vue'
const ui = useUiStore()
const licenses = ref([]), stats = ref({}), meta = ref({}), defaults = ref({})
const loading = ref(true), error = ref(''), formError = ref(''), pending = ref(false), open = ref(false), id = ref(null), confirmation = ref(null)
const form = reactive({ customer_name: '', product_name: '', max_activations: 1, expires_at: '', notes: '' })
async function load(page = 1) {
  loading.value = true
  error.value = ''
  try {
    const result = (await api.get('/admin/licenses', { params: { page } })).data
    licenses.value = result.data.data
    meta.value = result.data
    stats.value = result.stats
    defaults.value = result.defaults
  } catch (e) { error.value = errorMessage(e) }
  finally { loading.value = false }
}
onMounted(() => load())
function edit(license) {
  id.value = license?.id || null
  Object.assign(form, {
    customer_name: license?.customer_name || '',
    product_name: license?.product_name || defaults.value.product_name || '',
    max_activations: license?.max_activations || defaults.value.max_activations || 1,
    expires_at: license?.expires_at?.slice(0, 10) || '',
    notes: license?.notes || '',
  })
  formError.value = ''
  open.value = true
}
async function save() {
  pending.value = true
  formError.value = ''
  try {
    const payload = { ...form, expires_at: form.expires_at || null }
    const result = id.value ? await api.patch(`/admin/licenses/${id.value}`, payload) : await api.post('/admin/licenses', payload)
    open.value = false
    ui.toast(id.value ? 'Lisensi berhasil diperbarui.' : `Lisensi dibuat: ${result.data.data.key}`)
    await load(meta.value.current_page || 1)
  } catch (e) { formError.value = errorMessage(e) }
  finally { pending.value = false }
}
async function copy(key) {
  try { await navigator.clipboard.writeText(key); ui.toast('License key disalin.') }
  catch { ui.toast('Pilih dan salin license key dari daftar.') }
}
async function toggle(license) {
  pending.value = true
  try { await api.patch(`/admin/licenses/${license.id}/toggle-status`); await load(meta.value.current_page); ui.toast('Status lisensi berhasil diubah.') }
  catch (e) { error.value = errorMessage(e) }
  finally { pending.value = false }
}
async function remove() {
  pending.value = true
  formError.value = ''
  try {
    await api.delete(`/admin/licenses/${confirmation.value.id}`)
    confirmation.value = null
    await load(licenses.value.length === 1 ? Math.max(1, meta.value.current_page - 1) : meta.value.current_page)
    ui.toast('Lisensi berhasil dihapus.')
  } catch (e) { formError.value = errorMessage(e) }
  finally { pending.value = false }
}
</script>
<template>
  <div>
    <div class="admin-title">
      <div><p class="p-eyebrow">LICENSE MANAGEMENT</p><h1>Lisensi aplikasi.</h1><p>Kelola pelanggan, masa berlaku, dan aktivasi perangkat.</p></div>
      <button class="p-button" @click="edit()"><Plus :size="17" />Buat Lisensi</button>
    </div>
    <div class="stats-grid license-stats">
      <article v-for="[key, label] in [['total', 'Total lisensi'], ['active', 'Aktif'], ['expired', 'Kedaluwarsa'], ['revoked', 'Dicabut']]" :key="key" class="surface"><p>{{ label }}</p><strong>{{ stats[key] || 0 }}</strong></article>
    </div>
    <PageState v-if="loading || error" :loading="loading" :error="error" @retry="load(meta.current_page || 1)" />
    <div v-else class="surface license-panel">
      <article v-for="license in licenses" :key="license.id" class="license-row">
        <div class="license-identity"><code>{{ license.key }}</code><strong>{{ license.customer_name }}</strong><span>{{ license.product_name }}</span><small v-if="license.notes">{{ license.notes }}</small></div>
        <div><small>Status</small><span class="license-badge" :class="license.is_expired ? 'expired' : license.status">{{ license.is_expired ? 'Expired' : license.status === 'active' ? 'Active' : 'Revoked' }}</span></div>
        <div><small>Perangkat</small><strong>{{ license.activations_count }} / {{ license.max_activations }}</strong></div>
        <div><small>Berlaku sampai</small><span>{{ license.expires_at?.slice(0, 10) || 'Tanpa batas' }}</span></div>
        <div class="license-actions">
          <button class="p-button secondary small" :aria-label="`Salin ${license.key}`" @click="copy(license.key)"><Copy :size="14" />Salin</button>
          <button class="p-button secondary small" @click="edit(license)"><PenLine :size="14" />Edit</button>
          <button class="p-button secondary small" :disabled="pending" @click="toggle(license)">{{ license.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}</button>
          <button class="p-button secondary small" :disabled="pending" @click="confirmation = license; formError = ''">Hapus</button>
        </div>
      </article>
      <p v-if="!licenses.length" class="empty-note">Belum ada lisensi.</p>
      <div class="pagination"><span>Halaman {{ meta.current_page }} dari {{ meta.last_page }}</span><button class="icon-button" aria-label="Halaman sebelumnya" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)"><ChevronLeft :size="19" /></button><button class="icon-button" aria-label="Halaman berikutnya" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)"><ChevronRight :size="19" /></button></div>
    </div>
    <BaseModal :open="open" title="Kelola lisensi" @close="!pending && (open = false)">
      <form class="platform" @submit.prevent="save">
        <h2>{{ id ? 'Edit Lisensi' : 'Buat Lisensi' }}</h2>
        <FormField v-model="form.customer_name" label="Nama pelanggan" required />
        <FormField v-model="form.product_name" label="Nama produk" required />
        <FormField v-model="form.max_activations" label="Maksimum perangkat" type="number" required />
        <FormField v-model="form.expires_at" label="Tanggal kedaluwarsa" type="date" help="Kosongkan untuk lisensi tanpa batas waktu." />
        <FormField v-model="form.notes" label="Catatan" type="textarea" />
        <p v-if="formError" class="alert error" role="alert">{{ formError }}</p>
        <button class="p-button" :disabled="pending">{{ pending ? 'Menyimpan...' : 'Simpan Lisensi' }}</button>
      </form>
    </BaseModal>
    <BaseModal :open="!!confirmation" title="Hapus lisensi" @close="!pending && (confirmation = null)">
      <div class="platform"><h2>Hapus lisensi?</h2><p>Lisensi {{ confirmation?.key }} milik {{ confirmation?.customer_name }} beserta riwayat aktivasi perangkat akan dihapus.</p><p v-if="formError" class="alert error" role="alert">{{ formError }}</p><div class="license-actions"><button class="p-button secondary" :disabled="pending" @click="confirmation = null">Batal</button><button class="p-button" :disabled="pending" @click="remove">{{ pending ? 'Menghapus...' : 'Hapus Lisensi' }}</button></div></div>
    </BaseModal>
  </div>
</template>
<style scoped>
.license-stats{grid-template-columns:repeat(4,minmax(0,1fr))}.license-panel{margin-top:24px;overflow:hidden}.license-row{display:grid;grid-template-columns:minmax(230px,2fr) 100px 90px 130px minmax(190px,1fr);gap:18px;padding:24px;border-bottom:1px solid #eee7e2;align-items:center}.license-row>div{display:flex;flex-direction:column;gap:6px;min-width:0}.license-row small{color:#817772}.license-identity code{font-size:12px;overflow-wrap:anywhere;user-select:all}.license-identity span,.license-identity small{overflow-wrap:anywhere}.license-row .license-actions,.license-actions{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px}.license-badge{align-self:flex-start;border-radius:20px;padding:5px 10px;font-size:12px;background:#f5e6e6;color:#9c3434}.license-badge.active{background:#e5efe6;color:#357149}.license-badge.expired{background:#fff1d5;color:#93650d}@media(max-width:1100px){.license-row{grid-template-columns:repeat(3,minmax(0,1fr))}.license-identity,.license-row .license-actions{grid-column:1/-1}}@media(max-width:600px){.license-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.license-row{padding:18px;gap:12px}.license-row strong,.license-row span{font-size:13px}.license-identity strong{font-size:16px}}
</style>
