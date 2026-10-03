<script setup>
import { ref, computed, onMounted } from 'vue'
import { Copy, ExternalLink, RefreshCw, Send, Eye } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
import { useUiStore } from '../stores/ui'
import BaseModal from './BaseModal.vue'
import WeddingRenderer from './WeddingRenderer.vue'

const props = defineProps({
  wedding: { type: Object, required: true },
  blocked: Boolean,
})
const emit = defineEmits(['updated', 'busy'])
const ui = useUiStore(),
  portal = ref(null),
  loading = ref(true),
  busy = ref(false),
  error = ref(''),
  confirmApply = ref(false),
  showProposal = ref(false)
const labels = {
  DRAFT: 'Belum dikirim pelanggan',
  SUBMITTED: 'Data siap diterapkan',
  IN_REVIEW: 'Menunggu persetujuan',
  CHANGES_REQUESTED: 'Pelanggan meminta revisi',
  APPROVED: 'Preview terbaru disetujui',
}
const base = () => `/admin/weddings/${props.wedding.id}/customer-portal`
const active = computed(() => portal.value && !portal.value.revoked_at)
const expired = computed(
  () => portal.value && new Date(portal.value.expires_at).getTime() < Date.now(),
)
const proposal = computed(() => {
  const data = portal.value?.submission
  if (!data) return null
  const wedding = { ...props.wedding, ...data }
  wedding.gifts = data.gift_methods
    .filter((gift) => gift.is_active && gift.type === 'BANK')
    .map((gift) => ({
      bank: gift.provider,
      account_number: gift.account_number,
      account_name: gift.account_name,
      logo: gift.logo,
    }))
  const physical = data.gift_methods.find((gift) => gift.is_active && gift.type === 'PHYSICAL')
  wedding.shipping_gift = physical
    ? {
        recipient: physical.recipient_name,
        address: physical.address,
        phone: physical.phone,
      }
    : null
  return wedding
})
const summary = computed(() =>
  portal.value?.submission
    ? [
        [
          props.wedding.event_type === 'wedding' ? 'Pengantin wanita' : 'Penyelenggara',
          props.wedding.event_type === 'wedding'
            ? portal.value.submission.bride?.full_name
            : portal.value.submission.event_details?.host_name,
        ],
        [
          props.wedding.event_type === 'wedding' ? 'Pengantin pria' : 'Nama tokoh acara',
          props.wedding.event_type === 'wedding'
            ? portal.value.submission.groom?.full_name
            : portal.value.submission.event_details?.honoree_name,
        ],
        ['Tanggal', portal.value.submission.wedding_date],
        ['Judul undangan', portal.value.submission.title],
        ['Acara', `${portal.value.submission.events.length} acara`],
        ['Galeri', `${portal.value.submission.gallery.length} foto`],
        ['Cerita', `${portal.value.submission.stories.length} cerita`],
        ['Metode hadiah', `${portal.value.submission.gift_methods.length} metode`],
      ]
    : [],
)
const shareLink = computed(() =>
  portal.value?.link
    ? `https://wa.me/${props.wedding.customer_whatsapp || ''}?text=${encodeURIComponent(`Halo, silakan isi data pernikahan dan unggah foto melalui tautan pribadi berikut. Setelah kami siapkan, Anda juga bisa memeriksa preview dan memberikan persetujuan di sini:\n${portal.value.link}`)}`
    : '',
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    portal.value = (await api.get(base())).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
async function action(name) {
  if (busy.value || (['apply', 'review'].includes(name) && props.blocked)) return
  if (
    name === 'issue' &&
    portal.value &&
    !window.confirm(
      'Buat tautan baru? Tautan sebelumnya tidak bisa dipakai lagi; data pelanggan tetap tersimpan.',
    )
  )
    return
  if (
    name === 'revoke' &&
    !window.confirm(
      'Nonaktifkan tautan pelanggan? Pelanggan tidak bisa membukanya lagi dan persetujuan pelanggan tidak diwajibkan saat publish.',
    )
  )
    return
  busy.value = true
  error.value = ''
  emit('busy', true)
  try {
    const response =
      name === 'revoke'
        ? await api.delete(base())
        : await api.post(
            name === 'issue' ? base() : `${base()}/${name}`,
            name === 'apply'
              ? {
                  expected_updated_at: props.wedding.updated_at,
                  expected_submission_version: portal.value.submission_version,
                }
              : {},
          )
    if (name === 'apply') {
      portal.value = response.data.data.portal
      emit('updated', response.data.data.wedding)
      confirmApply.value = false
    } else portal.value = response.data.data
    ui.toast(
      {
        issue: 'Tautan pribadi pelanggan siap dibagikan.',
        revoke: 'Tautan pelanggan dinonaktifkan.',
        apply: 'Data pelanggan diterapkan. Preview siap ditinjau.',
        review: 'Pelanggan dapat meninjau dan menyetujui preview terbaru.',
      }[name],
    )
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
    emit('busy', false)
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(portal.value.link)
    ui.toast('Tautan pelanggan disalin.')
  } catch {
    ui.toast('Salin tautan dari kolom di atas.')
  }
}
function date(value) {
  return value
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—'
}
onMounted(load)
</script>

<template>
  <div class="customer-manager">
    <div class="panel-title">
      <h2>Ruang pelanggan</h2>
      <button type="button" class="p-button secondary small" :disabled="busy" @click="load">
        <RefreshCw :size="15" />Muat Data Pelanggan
      </button>
    </div>
    <p class="panel-subtitle">
      Bagikan satu tautan pribadi untuk pengisian data, unggahan foto, preview, dan persetujuan
      pelanggan.
    </p>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <p v-if="loading">Memuat data pelanggan…</p>
    <template v-else>
      <div class="customer-manager-actions">
        <button type="button" class="p-button" :disabled="busy" @click="action('issue')">
          {{ portal ? 'Buat Ulang Tautan Pelanggan' : 'Buat Tautan Pelanggan' }}</button
        ><button
          v-if="active"
          type="button"
          class="p-button secondary"
          :disabled="busy"
          @click="action('revoke')"
        >
          Nonaktifkan Tautan
        </button>
      </div>
      <template v-if="portal">
        <p class="customer-manager-status" role="status">
          {{ portal.revoked_at ? 'Tautan dinonaktifkan' : labels[portal.status] }}
        </p>
        <p v-if="expired && active" class="alert">
          Tautan kedaluwarsa. Buat ulang tautan agar pelanggan dapat membukanya lagi.
        </p>
        <div v-if="active" class="customer-private-link">
          <label for="customer-private-link">Tautan pribadi pelanggan</label
          ><input id="customer-private-link" :value="portal.link" readonly />
          <div class="customer-manager-actions">
            <button
              type="button"
              class="p-button secondary small"
              :disabled="expired"
              @click="copy"
            >
              <Copy :size="15" />Salin Tautan Pelanggan</button
            ><a
              :href="portal.link"
              target="_blank"
              rel="noopener noreferrer"
              class="p-button secondary small"
              ><ExternalLink :size="15" />Buka Ruang Pelanggan</a
            ><a
              :href="shareLink"
              target="_blank"
              rel="noopener noreferrer"
              class="p-button secondary small"
              ><Send :size="15" />Bagikan lewat WhatsApp</a
            >
          </div>
          <p>
            Berlaku sampai {{ date(portal.expires_at) }}. Tautan yang sama dipakai pelanggan untuk
            mengisi data dan meninjau undangan.
          </p>
        </div>
        <p v-if="props.blocked && !busy" class="alert" role="alert">
          Simpan perubahan editor sebelum menerapkan pengajuan atau meminta persetujuan.
        </p>
        <div v-if="portal.submission" class="customer-proposal">
          <h3>Pengajuan pelanggan</h3>
          <dl>
            <div v-for="[label, value] in summary" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ value || '—' }}</dd>
            </div>
          </dl>
          <p>
            {{
              portal.submitted_at
                ? `Dikirim ${date(portal.submitted_at)}`
                : 'Masih draf. Pelanggan belum mengirim data ke admin.'
            }}
          </p>
          <div class="customer-manager-actions">
            <button type="button" class="p-button secondary small" @click="showProposal = true">
              <Eye :size="16" />Preview Pengajuan</button
            ><button
              v-if="active && portal.status === 'SUBMITTED'"
              type="button"
              class="p-button small"
              :disabled="busy || blocked"
              @click="confirmApply = true"
            >
              Terapkan Data Pelanggan
            </button>
          </div>
        </div>
        <div v-if="portal.revision_notes" class="customer-revision">
          <h3>Catatan revisi terakhir</h3>
          <p>{{ portal.revision_notes }}</p>
          <small>{{ date(portal.revision_requested_at) }}</small>
        </div>
        <div v-if="active" class="customer-review">
          <h3>Persetujuan sebelum publish</h3>
          <p v-if="portal.status === 'APPROVED'">
            Pelanggan menyetujui preview terbaru pada
            {{ date(portal.approved_at) }}.
          </p>
          <p v-else>
            Periksa konten di editor, lalu kirim untuk ditinjau. Pelanggan memilih “Sudah sesuai”
            atau mengirim catatan revisi dari tautan pribadinya. Perubahan konten setelah disetujui
            membutuhkan persetujuan ulang.
          </p>
          <button
            type="button"
            class="p-button secondary"
            :disabled="busy || blocked || expired"
            @click="action('review')"
          >
            Kirim Preview untuk Ditinjau
          </button>
        </div>
      </template>
    </template>
    <BaseModal
      :open="confirmApply"
      title="Terapkan pengajuan pelanggan"
      @close="!busy && (confirmApply = false)"
      ><div class="platform">
        <h2>Terapkan data pelanggan?</h2>
        <p class="modal-description">
          Nama, acara, foto, cerita, dan metode hadiah pada pengajuan akan diterapkan. Template dan
          pengaturan tampilan tetap mengikuti editor.
        </p>
        <p v-if="wedding.status === 'PUBLISHED'" class="alert">
          Undangan sudah aktif. Data yang diterapkan langsung memperbarui halaman publik.
        </p>
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <button
          type="button"
          class="p-button full-width"
          :disabled="busy || blocked"
          @click="action('apply')"
        >
          {{ busy ? 'Menerapkan…' : 'Ya, Terapkan Data Pelanggan' }}
        </button>
      </div></BaseModal
    >
    <BaseModal
      :open="showProposal"
      title="Preview pengajuan pelanggan"
      wide
      @close="showProposal = false"
      ><WeddingRenderer v-if="proposal" :wedding="proposal" preview start-open
    /></BaseModal>
  </div>
</template>

<style scoped>
.customer-manager {
  min-width: 0;
}
.customer-manager .panel-title {
  flex-wrap: wrap;
  gap: 15px;
}
.customer-manager-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 20px 0;
}
.customer-manager-status {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 20px;
  background: #e7eedc;
  color: #67834d;
  font-size: 12px;
}
.customer-private-link,
.customer-proposal,
.customer-review,
.customer-revision {
  margin-top: 25px;
  padding: 24px;
  background: #f7f9f2;
  border: 1px solid #e0e5d7;
  border-radius: 7px;
  min-width: 0;
}
.customer-private-link label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
}
.customer-private-link input {
  width: 100%;
  min-width: 0;
  padding: 14px;
  border: 1px solid #d8dfcd;
  border-radius: 5px;
  font: inherit;
  font-size: 12px;
  color: #8a5745;
}
.customer-manager p:not(.customer-manager-status),
.customer-manager small {
  font-size: 13px;
  line-height: 1.9;
  color: #788568;
  overflow-wrap: anywhere;
}
.customer-revision p {
  white-space: pre-wrap;
}
.customer-proposal dl {
  margin: 18px 0;
}
.customer-proposal dl > div {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 15px;
  padding: 9px 0;
  border-bottom: 1px solid #e0e5d7;
  font-size: 13px;
}
.customer-proposal dt {
  color: #788568;
}
.customer-proposal dd {
  margin: 0;
  overflow-wrap: anywhere;
}
@media (max-width: 600px) {
  .customer-manager-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .customer-manager-actions .p-button {
    width: 100%;
  }
  .customer-private-link,
  .customer-proposal,
  .customer-review,
  .customer-revision {
    padding: 16px;
  }
  .customer-proposal dl > div {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>
