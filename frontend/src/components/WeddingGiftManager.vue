<script setup>
import { ref, watch } from 'vue'
import { Plus, Trash2, ArrowUp, ArrowDown, PenLine } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
import FormField from './FormField.vue'
import MediaUploader from './MediaUploader.vue'
import BaseModal from './BaseModal.vue'
import { useUiStore } from '../stores/ui'
const props = defineProps({
  weddingId: [Number, String],
  methods: { type: Array, default: () => [] },
})
const emit = defineEmits(['updated'])
const ui = useUiStore(),
  items = ref([]),
  form = ref(null),
  pending = ref(false),
  error = ref(''),
  deleteTarget = ref(null)
const types = [
  { value: 'BANK', label: 'Transfer Bank' },
  { value: 'EWALLET', label: 'E-Wallet' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'PHYSICAL', label: 'Hadiah Fisik' },
]
watch(
  () => props.methods,
  (value) => (items.value = JSON.parse(JSON.stringify(value))),
  { immediate: true, deep: true },
)
function edit(gift) {
  error.value = ''
  form.value = gift
    ? JSON.parse(JSON.stringify(gift))
    : {
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
      }
}
function sync(version) {
  emit('updated', { methods: items.value, updated_at: version })
}
async function save() {
  pending.value = true
  error.value = ''
  try {
    const url = `/admin/weddings/${props.weddingId}/gifts`
    const result = (
      await (form.value.id
        ? api.put(`${url}/${form.value.id}`, form.value)
        : api.post(url, form.value))
    ).data
    const index = items.value.findIndex((x) => x.id === result.data.id)
    if (index < 0) items.value.push(result.data)
    else items.value[index] = result.data
    sync(result.updated_at)
    form.value = null
    ui.toast('Metode hadiah berhasil disimpan.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
async function remove() {
  pending.value = true
  try {
    const result = (
      await api.delete(`/admin/weddings/${props.weddingId}/gifts/${deleteTarget.value.id}`)
    ).data
    items.value = items.value.filter((x) => x.id !== deleteTarget.value.id)
    sync(result.updated_at)
    deleteTarget.value = null
    ui.toast('Metode hadiah dihapus.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
async function move(index, direction) {
  const next = index + direction
  if (next < 0 || next >= items.value.length || pending.value) return
  pending.value = true
  error.value = ''
  const reordered = [...items.value]
  ;[reordered[index], reordered[next]] = [reordered[next], reordered[index]]
  try {
    const result = (
      await api.patch(`/admin/weddings/${props.weddingId}/gifts/reorder`, {
        ids: reordered.map((x) => x.id),
      })
    ).data
    items.value = result.data
    sync(result.updated_at)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <div>
    <div class="panel-title">
      <h2>Tanda kasih.</h2>
      <button class="p-button small" :disabled="pending" @click="edit()">
        <Plus :size="16" />Tambah Metode
      </button>
    </div>
    <p class="panel-subtitle">
      Hadiah langsung untuk mempelai. Radina hanya menampilkan tujuan transfer dan tidak menyimpan
      uang tamu. Perubahan metode disimpan langsung; tombol Simpan di editor menyimpan pengaturan
      ON/OFF.
    </p>
    <p v-if="error && !form" class="alert error" role="alert">{{ error }}</p>
    <article v-for="(gift, i) in items" :key="gift.id" class="repeater-card">
      <div class="repeater-header">
        <h3>{{ gift.provider || gift.recipient_name || 'Hadiah Fisik' }}</h3>
        <span>{{ gift.is_active ? 'Aktif' : 'Nonaktif' }}</span>
      </div>
      <p>
        {{ types.find((x) => x.value === gift.type)?.label }} ·
        {{ gift.account_number || gift.account_name || 'Alamat pengiriman' }}
      </p>
      <img
        v-if="gift.type === 'QRIS' && gift.qr_image"
        :src="gift.qr_image"
        alt="QRIS"
        class="gift-qr-preview"
      />
      <div class="gift-edit-actions">
        <button class="p-button secondary small" :disabled="pending" @click="edit(gift)">
          <PenLine :size="14" />Edit</button
        ><button
          class="icon-button"
          :disabled="pending || i === 0"
          aria-label="Naikkan metode"
          @click="move(i, -1)"
        >
          <ArrowUp :size="17" /></button
        ><button
          class="icon-button"
          :disabled="pending || i === items.length - 1"
          aria-label="Turunkan metode"
          @click="move(i, 1)"
        >
          <ArrowDown :size="17" /></button
        ><button
          class="icon-button"
          :disabled="pending"
          aria-label="Hapus metode hadiah"
          @click="deleteTarget = gift"
        >
          <Trash2 :size="17" />
        </button>
      </div>
    </article>
    <p v-if="!items.length" class="empty-note">
      Belum ada metode hadiah. Tambahkan rekening, e-wallet, QRIS atau alamat pengiriman.
    </p>
    <BaseModal :open="Boolean(form)" title="Metode Wedding Gift" @close="!pending && (form = null)"
      ><form v-if="form" class="platform" @submit.prevent="save">
        <h2>{{ form.id ? 'Edit' : 'Tambah' }} metode hadiah</h2>
        <FormField
          v-model="form.type"
          label="Jenis Metode"
          type="select"
          :options="types"
          required
        /><template v-if="['BANK', 'EWALLET'].includes(form.type)"
          ><FormField
            v-model="form.provider"
            :label="form.type === 'BANK' ? 'Nama Bank' : 'Provider E-Wallet'"
            :placeholder="
              form.type === 'BANK' ? 'BCA, Mandiri, BNI' : 'DANA, GoPay, OVO, ShopeePay'
            "
            required /><FormField
            v-model="form.account_number"
            :label="form.type === 'BANK' ? 'Nomor Rekening' : 'Nomor E-Wallet'"
            required /><FormField
            v-model="form.account_name"
            label="Nama Pemilik"
            required /><MediaUploader
            v-model="form.logo"
            :wedding-id="weddingId"
            collection="gift"
            label="Logo Bank / Provider" /></template
        ><template v-else-if="form.type === 'QRIS'"
          ><FormField v-model="form.provider" label="QRIS Name" required /><FormField
            v-model="form.account_name"
            label="Account / Merchant Name"
            required
          /><MediaUploader
            v-model="form.qr_image"
            :wedding-id="weddingId"
            collection="gift"
            label="Upload QRIS Image"
          />
          <p>Pastikan QRIS dapat dipindai dan milik mempelai.</p></template
        ><template v-else
          ><FormField v-model="form.recipient_name" label="Nama Penerima" required /><FormField
            v-model="form.phone"
            label="Nomor Telepon"
            type="tel"
            required /><FormField
            v-model="form.address"
            label="Alamat Lengkap"
            type="textarea"
            required /></template
        ><FormField v-model="form.description" label="Deskripsi / Catatan" type="textarea" /><label
          class="toggle-row"
          ><span>Status Aktif</span><input v-model="form.is_active" type="checkbox"
        /></label>
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <button class="p-button full-width" :disabled="pending">
          {{ pending ? 'Menyimpan…' : 'Simpan Metode Hadiah' }}
        </button>
      </form></BaseModal
    ><BaseModal
      :open="Boolean(deleteTarget)"
      title="Hapus metode hadiah"
      @close="!pending && (deleteTarget = null)"
      ><div class="platform">
        <h2>Hapus metode ini?</h2>
        <p>Tujuan hadiah ini tidak akan ditampilkan lagi pada undangan.</p>
        <button class="p-button" :disabled="pending" @click="remove">Ya, Hapus Metode</button>
      </div></BaseModal
    >
  </div>
</template>
