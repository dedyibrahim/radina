<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { api, errorMessage } from '../services/api'
const props = defineProps({
  base: { type: String, default: '/admin' },
  admin: Boolean,
  compact: Boolean,
})
const reminders = ref([]),
  count = ref(0),
  scope = ref('due'),
  error = ref(''),
  busy = ref(false),
  pagination = ref(null)
let timer
function due(row) {
  return (
    new Date(row.due_at) <= new Date() &&
    (!row.snoozed_until || new Date(row.snoozed_until) <= new Date())
  )
}
async function load(page = 1) {
  try {
    const result = (
      await api.get(`${props.base}/reminders`, {
        params: props.admin ? { scope: scope.value, page } : {},
      })
    ).data
    if (props.admin) {
      count.value = result.due_count
      reminders.value = result.reminders.data
      pagination.value = result.reminders
    } else {
      reminders.value = result.data
      count.value = reminders.value.filter(due).length
    }
    error.value = ''
  } catch (e) {
    error.value = errorMessage(e)
  }
}
async function action(id, value) {
  busy.value = true
  try {
    await api.patch(`/admin/reminders/${id}`, { action: value })
    await load(pagination.value?.current_page || 1)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
watch(
  () => props.base,
  () => {
    load()
    clearInterval(timer)
    timer = setInterval(() => {
      if (!document.hidden) load(pagination.value?.current_page || 1)
    }, 60000)
  },
  { immediate: true },
)
watch(scope, () => load())
onUnmounted(() => clearInterval(timer))
</script>
<template>
  <section class="reminder-list">
    <div class="panel-title">
      <div>
        <h2>
          Pengingat <span>{{ count }}</span>
        </h2>
        <p v-if="!compact">
          Pembayaran, kelengkapan data, persetujuan, jadwal acara, dan masa
          aktif undangan.
        </p>
      </div>
      <RouterLink
        v-if="compact && admin"
        to="/admin/reminders"
        class="text-link"
        >Lihat semua →</RouterLink
      >
      <div v-else class="action-group">
        <select
          v-if="admin"
          class="business-select"
          v-model="scope"
          aria-label="Filter pengingat"
        >
          <option value="due">Perlu ditindaklanjuti</option>
          <option value="scheduled">Terjadwal / ditunda</option>
          <option value="all">Semua aktif</option></select
        ><button type="button" class="p-button secondary" @click="load()">
          Perbarui
        </button>
      </div>
    </div>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <p v-if="!error && !reminders.length" class="empty-note">
      {{
        scope === 'scheduled'
          ? 'Belum ada pengingat terjadwal.'
          : 'Tidak ada pengingat yang perlu ditindaklanjuti.'
      }}
    </p>
    <article
      v-for="item in compact ? reminders.slice(0, 4) : reminders"
      :key="item.id"
    >
      <div>
        <span class="reminder-kind">{{
          {
            PAYMENT: 'Pembayaran',
            CONTENT: 'Data undangan',
            APPROVAL: 'Persetujuan',
            EVENT: 'Acara',
            EXPIRY: 'Masa aktif',
          }[item.kind]
        }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.message }}</p>
        <small
          >{{ due(item) ? 'Perlu ditindaklanjuti' : 'Terjadwal' }} ·
          {{
            new Date(item.snoozed_until || item.due_at).toLocaleString('id-ID')
          }}</small
        ><RouterLink
          v-if="admin"
          :to="`/admin/orders/${item.order_id}`"
          class="text-link"
          >{{ item.order?.order_number }} ·
          {{ item.order?.customer_name }}</RouterLink
        >
      </div>
      <div v-if="admin && !compact" class="action-group">
        <button
          type="button"
          class="p-button secondary"
          :disabled="busy"
          @click="action(item.id, 'snooze')"
        >
          Tunda 1 hari</button
        ><button
          type="button"
          class="text-link"
          :disabled="busy"
          @click="action(item.id, 'dismiss')"
        >
          Selesai
        </button>
      </div>
    </article>
    <div v-if="pagination?.last_page > 1 && !compact" class="action-group">
      <button
        class="p-button secondary"
        :disabled="pagination.current_page <= 1"
        @click="load(pagination.current_page - 1)"
      >
        Sebelumnya</button
      ><span>{{ pagination.current_page }} / {{ pagination.last_page }}</span
      ><button
        class="p-button secondary"
        :disabled="pagination.current_page >= pagination.last_page"
        @click="load(pagination.current_page + 1)"
      >
        Berikutnya
      </button>
    </div>
  </section>
</template>
<style scoped>
.panel-title {
  flex-wrap: wrap;
  gap: 16px;
}
.panel-title p {
  font-size: 13px;
}
.reminder-list h2 span {
  font-size: 14px;
  background: #e5eedb;
  padding: 4px 10px;
  border-radius: 30px;
}
.reminder-list article {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid #e0e7d9;
  padding: 20px 0;
}
.reminder-list h3 {
  font-size: 20px;
  margin: 6px 0;
}
.reminder-list p {
  max-width: 620px;
}
.reminder-list small {
  display: block;
  margin: 10px 0;
  color: #728666;
}
.reminder-kind {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94766a;
}
.action-group {
  flex-wrap: wrap;
}
@media (max-width: 650px) {
  .reminder-list article {
    display: block;
  }
  .reminder-list article .action-group {
    margin-top: 12px;
  }
}
</style>
