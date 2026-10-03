<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Search, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-vue-next'
import { api, errorMessage, formatMoney, statusLabels } from '../../services/api'
import StatusBadge from '../../components/StatusBadge.vue'
import PageState from '../../components/PageState.vue'
const orders = ref([]),
  templates = ref([]),
  loading = ref(true),
  error = ref(''),
  meta = ref({}),
  page = ref(1),
  filter = reactive({ search: '', status: '', template: '', date: '' })
let timer,
  sequence = 0
async function load() {
  const current = ++sequence
  loading.value = true
  error.value = ''
  try {
    const result = (
      await api.get('/admin/orders', {
        params: { ...filter, page: page.value },
      })
    ).data
    if (current !== sequence) return
    orders.value = result.data
    meta.value = result.meta
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    if (current === sequence) loading.value = false
  }
}
function changePage(direction) {
  page.value += direction
  load()
}
watch(filter, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load()
  }, 250)
})
onMounted(async () => {
  load()
  templates.value = (await api.get('/admin/templates')).data.data
})
</script>
<template>
  <div>
    <div class="admin-title">
      <div>
        <p class="p-eyebrow">ORDER MANAGEMENT</p>
        <h1>Setiap pesanan, sebuah cerita.</h1>
        <p>Kelola pembayaran dan persiapan undangan.</p>
      </div>
      <span class="count-label">{{ meta.total || 0 }} pesanan</span>
    </div>
    <div class="admin-filters surface">
      <label class="search-control"
        ><Search :size="17" /><input
          v-model="filter.search"
          aria-label="Cari pesanan"
          placeholder="Order ID, nama, WhatsApp…" /></label
      ><select v-model="filter.status" class="control" aria-label="Filter status">
        <option value="">Semua status</option>
        <option v-for="(label, status) in statusLabels" :key="status" :value="status">
          {{ label }}
        </option></select
      ><select v-model="filter.template" class="control" aria-label="Filter template">
        <option value="">Semua template</option>
        <option v-for="template in templates" :key="template.id" :value="template.id">
          {{ template.name }}
        </option></select
      ><input v-model="filter.date" type="date" class="control" aria-label="Filter tanggal" />
    </div>
    <PageState v-if="loading || error" :loading="loading" :error="error" @retry="load" />
    <div v-else class="surface orders-panel">
      <div class="order-grid-header">
        <span>Order / tanggal</span><span>Customer / WhatsApp</span><span>Acara / pengantin</span
        ><span>Template</span><span>Total</span><span>Pembayaran</span><span>Status</span
        ><span></span>
      </div>
      <article v-for="order in orders" :key="order.id" class="order-row">
        <div>
          <small>Order ID</small><strong>{{ order.order_number }}</strong>
          <p>
            {{ new Date(order.created_at).toLocaleDateString('id-ID') }}
          </p>
        </div>
        <div>
          <small>Customer</small><strong>{{ order.customer_name }}</strong>
          <p>{{ order.whatsapp }}</p>
        </div>
        <div>
          <small>{{ order.event_type === 'wedding' ? 'Pengantin' : 'Acara' }}</small>
          <p v-if="!order.event_type || order.event_type === 'wedding'">
            {{ order.bride_name }}<br />& {{ order.groom_name }}
          </p>
          <p v-else>{{ order.event_title }}<br />{{ order.host_name }}</p>
        </div>
        <div>
          <small>Template</small>
          <p>{{ order.template.name }}</p>
        </div>
        <div>
          <small>Total</small><strong>{{ formatMoney(order.total) }}</strong>
        </div>
        <div><small>Pembayaran</small><StatusBadge :status="order.payment.status" /></div>
        <div><small>Status</small><StatusBadge :status="order.status" /></div>
        <RouterLink
          :to="`/admin/orders/${order.id}`"
          class="order-open"
          aria-label="Lihat detail pesanan"
          ><ArrowUpRight :size="19" /><span>Detail</span></RouterLink
        >
      </article>
      <p v-if="!orders.length" class="empty-note">Tidak ada pesanan sesuai pencarian Anda.</p>
      <div class="pagination">
        <span>Halaman {{ meta.current_page }} dari {{ meta.last_page }}</span
        ><button
          class="icon-button"
          aria-label="Halaman sebelumnya"
          :disabled="page <= 1"
          @click="changePage(-1)"
        >
          <ChevronLeft :size="19" /></button
        ><button
          class="icon-button"
          aria-label="Halaman berikutnya"
          :disabled="page >= meta.last_page"
          @click="changePage(1)"
        >
          <ChevronRight :size="19" />
        </button>
      </div>
    </div>
  </div>
</template>
