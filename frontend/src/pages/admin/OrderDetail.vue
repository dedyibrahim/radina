<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, PenLine, ExternalLink } from 'lucide-vue-next'
import { api, errorMessage, formatMoney, statusLabels } from '../../services/api'
import { useUiStore } from '../../stores/ui'
import PageState from '../../components/PageState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import BaseModal from '../../components/BaseModal.vue'
import FormField from '../../components/FormField.vue'
const route = useRoute(),
  router = useRouter(),
  ui = useUiStore(),
  order = ref(null),
  loading = ref(true),
  pending = ref(false),
  error = ref(''),
  dialog = ref(''),
  reference = ref('')
const transitions = {
  WAITING_PAYMENT: ['PAYMENT_REVIEW', 'CANCELLED'],
  PAYMENT_REVIEW: ['CANCELLED'],
  PAID: ['CANCELLED'],
  CONTENT_PROCESS: ['READY', 'CANCELLED'],
  READY: ['CONTENT_PROCESS', 'CANCELLED'],
  PUBLISHED: ['CANCELLED'],
  CANCELLED: [],
}
const allowed = computed(() => transitions[order.value?.status] || [])
async function load() {
  try {
    order.value = (await api.get(`/admin/orders/${route.params.id}`)).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
async function confirm() {
  pending.value = true
  try {
    order.value = (
      await api.patch(`/admin/orders/${order.value.id}/payment`, { reference: reference.value })
    ).data.data
    dialog.value = ''
    ui.toast('Pembayaran dikonfirmasi. Undangan dapat dikelola.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
async function manage() {
  pending.value = true
  try {
    const wedding = (await api.post(`/admin/orders/${order.value.id}/wedding`)).data.data
    router.push(`/admin/weddings/${wedding.id}`)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
async function changeStatus(status) {
  if (!status) return
  if (status === 'CANCELLED' && dialog.value !== 'cancel') {
    dialog.value = 'cancel'
    return
  }
  pending.value = true
  try {
    order.value = (await api.patch(`/admin/orders/${order.value.id}/status`, { status })).data.data
    dialog.value = ''
    ui.toast('Status pesanan diperbarui.')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
function handleStatusChange(event) {
  changeStatus(event.target.value)
  event.target.value = ''
}
</script>
<template>
  <div>
    <RouterLink to="/admin/orders" class="text-link"
      ><ArrowLeft :size="16" />Semua pesanan</RouterLink
    ><PageState
      v-if="loading || (!order && error)"
      :loading="loading"
      :error="error"
      @retry="load"
    /><template v-else-if="order"
      ><div class="admin-title">
        <div>
          <p class="p-eyebrow">ORDER DETAILS</p>
          <h1>{{ order.order_number }}</h1>
          <StatusBadge :status="order.status" />
        </div>
        <div class="action-group">
          <button
            v-if="order.payment.status !== 'PAID' && order.status !== 'CANCELLED'"
            class="p-button"
            @click="dialog = 'payment'"
          >
            <CheckCircle2 :size="17" />Konfirmasi Pembayaran</button
          ><button
            v-if="order.payment.status === 'PAID' && order.status !== 'CANCELLED'"
            class="p-button"
            :disabled="pending"
            @click="manage"
          >
            <PenLine :size="17" />{{ pending ? 'Membuka…' : 'Kelola Undangan' }}
          </button>
        </div>
      </div>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <div class="detail-panels">
        <section class="surface">
          <h2>Informasi pesanan</h2>
          <dl class="summary-list">
            <div>
              <dt>Customer</dt>
              <dd>{{ order.customer_name }}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a
                  :href="`https://wa.me/${order.whatsapp}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ order.whatsapp }} ↗</a
                >
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ order.email || '—' }}</dd>
            </div>
            <div>
              <dt>Tanggal</dt>
              <dd>{{ new Date(order.created_at).toLocaleString('id-ID') }}</dd>
            </div>
          </dl>
          <h2>Pengantin</h2>
          <dl class="summary-list">
            <div>
              <dt>Wanita</dt>
              <dd>{{ order.bride_name }}</dd>
            </div>
            <div>
              <dt>Pria</dt>
              <dd>{{ order.groom_name }}</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>/w/{{ order.slug }}</dd>
            </div>
          </dl>
          <RouterLink
            v-if="order.status === 'PUBLISHED'"
            :to="`/w/${order.slug}`"
            target="_blank"
            class="p-button secondary"
            ><ExternalLink :size="16" />Lihat Undangan</RouterLink
          >
        </section>
        <section class="surface">
          <h2>Template & pembayaran</h2>
          <dl class="summary-list">
            <div>
              <dt>Template</dt>
              <dd>{{ order.template.name }}</dd>
            </div>
            <div>
              <dt>Metode</dt>
              <dd>Transfer Manual</dd>
            </div>
            <div>
              <dt>Total pesanan</dt>
              <dd>{{ formatMoney(order.total) }}</dd>
            </div>
            <div>
              <dt>Status pembayaran</dt>
              <dd><StatusBadge :status="order.payment.status" /></dd>
            </div>
            <div v-if="order.payment.confirmed_at">
              <dt>Dikonfirmasi</dt>
              <dd>{{ new Date(order.payment.confirmed_at).toLocaleString('id-ID') }}</dd>
            </div>
            <div v-if="order.payment.confirmed_by">
              <dt>Oleh admin</dt>
              <dd>#{{ order.payment.confirmed_by }}</dd>
            </div>
          </dl>
          <div v-if="allowed.length" class="field">
            <label for="status-update">Ubah status</label
            ><select id="status-update" :disabled="pending" @change="handleStatusChange">
              <option value="">Pilih tindakan…</option>
              <option v-for="status in allowed" :key="status" :value="status">
                {{ statusLabels[status] }}
              </option>
            </select>
          </div>
        </section>
      </div>
      <section class="surface history-panel">
        <h2>Perjalanan pesanan</h2>
        <ol>
          <li v-for="history in order.histories" :key="history.id">
            <StatusBadge :status="history.new_status" /><span>{{
              new Date(history.created_at).toLocaleString('id-ID')
            }}</span
            ><small>{{
              history.changed_by ? `Admin #${history.changed_by}` : 'Customer / sistem'
            }}</small>
          </li>
        </ol>
      </section>
      <BaseModal :open="Boolean(dialog)" title="Konfirmasi tindakan" @close="dialog = ''"
        ><div class="platform">
          <h2>{{ dialog === 'payment' ? 'Konfirmasi pembayaran?' : 'Batalkan pesanan?' }}</h2>
          <p class="modal-description">
            {{
              dialog === 'payment'
                ? 'Pastikan transfer sudah masuk dan sesuai total pesanan. Tindakan ini membuka akses pengelolaan undangan.'
                : 'Pesanan akan dibatalkan dan undangan publik dinonaktifkan. Tindakan ini tidak mengembalikan dana secara otomatis.'
            }}
          </p>
          <FormField
            v-if="dialog === 'payment'"
            v-model="reference"
            label="Referensi transfer (opsional)"
          />
          <p v-if="error" class="alert error">{{ error }}</p>
          <button
            class="p-button full-width"
            :disabled="pending"
            @click="dialog === 'payment' ? confirm() : changeStatus('CANCELLED')"
          >
            {{
              pending
                ? 'Memproses…'
                : dialog === 'payment'
                  ? 'Pembayaran Sudah Diterima'
                  : 'Ya, Batalkan'
            }}
          </button>
        </div></BaseModal
      ></template
    >
  </div>
</template>
