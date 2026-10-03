<script setup>
import { ref, onMounted, computed } from 'vue'
import { ShoppingBag, Wallet, Clock, ArrowUpRight } from 'lucide-vue-next'
import { api, errorMessage, formatMoney } from '../../services/api'
import PageState from '../../components/PageState.vue'
import StatusBadge from '../../components/StatusBadge.vue'
const data = ref(null),
  loading = ref(true),
  error = ref('')
async function load() {
  try {
    data.value = (await api.get('/admin/dashboard')).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
const stats = computed(() =>
  data.value
    ? [
        { label: 'Total pesanan', value: data.value.total_orders, icon: ShoppingBag },
        { label: 'Pesanan hari ini', value: data.value.today_orders, icon: Clock },
        { label: 'Pendapatan terkonfirmasi', value: formatMoney(data.value.revenue), icon: Wallet },
      ]
    : [],
)
</script>
<template>
  <div>
    <div class="admin-title">
      <div>
        <p class="p-eyebrow">YOUR WORKSPACE</p>
        <h1>Setiap cerita dimulai di sini.</h1>
        <p>Kelola momen bahagia, satu undangan pada satu waktu.</p>
      </div>
      <RouterLink to="/admin/orders" class="p-button"
        >Lihat Pesanan<ArrowUpRight :size="16"
      /></RouterLink>
    </div>
    <PageState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template
      v-else
      ><div class="stats-grid">
        <article v-for="stat in stats" :key="stat.label" class="surface">
          <component :is="stat.icon" :size="21" />
          <p>{{ stat.label }}</p>
          <strong>{{ stat.value }}</strong>
        </article>
      </div>
      <div class="status-stats">
        <article
          v-for="[key, label] in [
            ['WAITING_PAYMENT', 'Menunggu pembayaran'],
            ['PAYMENT_REVIEW', 'Perlu verifikasi'],
            ['PAID', 'Pembayaran berhasil'],
            ['CONTENT_PROCESS', 'Sedang dikerjakan'],
            ['PUBLISHED', 'Sudah dipublish'],
          ]"
          :key="key"
        >
          <span>{{ data.statuses[key] || 0 }}</span>
          <p>{{ label }}</p>
        </article>
      </div>
      <section class="surface dashboard-orders">
        <div class="panel-title">
          <h2>Pesanan terbaru</h2>
          <RouterLink to="/admin/orders" class="text-link">Lihat semua →</RouterLink>
        </div>
        <div class="admin-order-list">
          <RouterLink
            v-for="order in data.recent_orders"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            ><div>
              <strong>{{ order.customer_name }}</strong>
              <p>{{ order.order_number }} · {{ order.template.name }}</p>
            </div>
            <StatusBadge :status="order.status"
          /></RouterLink>
          <p v-if="!data.recent_orders.length" class="empty-note">
            Belum ada pesanan. Cerita pertama Anda segera datang.
          </p>
        </div>
      </section>
      <section class="surface dashboard-orders">
        <div class="panel-title">
          <h2>Perlu perhatian Anda</h2>
          <Clock :size="18" />
        </div>
        <div class="admin-order-list">
          <RouterLink
            v-for="order in data.attention_orders"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            ><div>
              <strong>{{ order.customer_name }}</strong>
              <p>{{ order.order_number }}</p>
            </div>
            <StatusBadge :status="order.status"
          /></RouterLink>
          <p v-if="!data.attention_orders.length" class="empty-note">
            Semua pesanan sudah ditangani.
          </p>
        </div>
      </section></template
    >
  </div>
</template>
