<script setup>
import { ref, computed, watch } from 'vue'
import { api, errorMessage } from '../services/api'
import GuestQr from './GuestQr.vue'
import BaseModal from './BaseModal.vue'
import PageState from './PageState.vue'
const props = defineProps({
  base: String,
  admin: Boolean,
  weddingId: [String, Number],
})
const stats = ref(null),
  guests = ref(null),
  days = ref(30),
  error = ref(''),
  search = ref(''),
  loading = ref(false),
  selected = ref(null)
const cards = computed(() =>
  stats.value
    ? [
        ['Pengunjung unik', stats.value.visitors],
        ['Halaman dilihat', stats.value.views],
        ['Undangan dibuka', stats.value.opens],
        ['Link tamu dibuka', stats.value.guest_links_opened],
        ['Undangan tamu', stats.value.registered_guests],
        ['RSVP hadir', stats.value.rsvp.attending],
        ['Estimasi orang (RSVP)', stats.value.rsvp.people],
        ['Tamu check-in', stats.value.check_ins],
        ['Orang tiba', stats.value.actual_people],
      ]
    : [],
)
const peak = computed(() =>
  Math.max(1, ...(stats.value?.daily || []).map((row) => row.views)),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    stats.value = (
      await api.get(`${props.base}/analytics`, {
        params: { days: days.value },
      })
    ).data.data
    await loadGuests()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
async function loadGuests(page = 1) {
  try {
    const r = (
      await api.get(`${props.base}/guest-statistics`, {
        params: { page, search: search.value },
      })
    ).data
    guests.value = props.admin ? r : r.data
  } catch (e) {
    error.value = errorMessage(e)
  }
}
watch(() => props.base, load, { immediate: true })
watch(days, load)
async function exportGuests() {
  error.value = ''
  try {
    let rows = [],
      page = 1,
      last = 1
    do {
      const raw = (
        await api.get(`${props.base}/guest-statistics`, {
          params: { page, search: search.value },
        })
      ).data
      const result = props.admin ? raw : raw.data
      rows.push(...result.data)
      last = result.last_page
      page++
    } while (page <= last)
    const cell = (v) => {
      let value = String(v ?? '')
      if (/^[=+@\-\t\r]/.test(value)) value = `'${value}`
      return `"${value.replaceAll('"', '""')}"`
    }
    const csv =
      '\uFEFF' +
      [
        [
          'nama',
          'alamat',
          'link_undangan',
          'link_qr',
          'dibuka_pada',
          'rsvp',
          'check_in',
          'jumlah_hadir',
        ],
        ...rows.map((r) => [
          r.name,
          r.address,
          r.invitation_url,
          r.pass_url,
          r.opened_at,
          r.attendance,
          r.checked_in_at,
          r.people_count,
        ]),
      ]
        .map((row) => row.map(cell).join(','))
        .join('\r\n')
    const link = document.createElement('a'),
      url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      )
    link.href = url
    link.download = 'statistik-tamu.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    error.value = errorMessage(e)
  }
}
</script>
<template>
  <section class="analytics">
    <div class="panel-title">
      <div>
        <h2>Statistik & Tamu</h2>
        <p>
          Kunjungan dan pembukaan sesuai periode; RSVP terbaru serta check-in
          sepanjang masa.
        </p>
      </div>
      <div class="action-group">
        <select
          class="business-select"
          v-model="days"
          aria-label="Periode statistik"
        >
          <option :value="7">7 hari</option>
          <option :value="30">30 hari</option>
          <option :value="90">90 hari</option></select
        ><button
          type="button"
          class="p-button secondary"
          :disabled="loading"
          @click="load"
        >
          Perbarui</button
        ><RouterLink
          v-if="admin"
          :to="`/admin/weddings/${weddingId}/check-in`"
          class="p-button"
          >Check-in QR</RouterLink
        >
      </div>
    </div>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <PageState v-if="!stats && loading" loading /><template v-if="stats"
      ><div class="analytics-cards">
        <article v-for="[label, value] in cards" :key="label">
          <p>{{ label }}</p>
          <strong>{{ value }}</strong>
        </article>
      </div>
      <div class="visit-chart" aria-label="Grafik kunjungan harian">
        <div
          v-for="row in stats.daily"
          :key="row.date"
          class="visit-bar"
          :title="`${row.date}: ${row.views} dilihat, ${row.visitors} pengunjung`"
        >
          <span
            :style="{
              height: `${Math.max(row.views ? 3 : 0, (row.views / peak) * 100)}%`,
            }"
          ></span>
        </div>
      </div>
      <p class="chart-caption">
        {{ stats.daily[0]?.date }} — {{ stats.daily.at(-1)?.date }} · Jumlah
        halaman dilihat per hari
      </p>
      <p class="analytics-note">
        Pengunjung unik menggunakan identitas anonim browser. RSVP tidak hadir:
        {{ stats.rsvp.declined }} · Masih ragu: {{ stats.rsvp.undecided }}.
        Tautan yang belum dibuka dapat dibagikan kembali.
      </p>
      <p v-if="stats.invitation_expires_at" class="alert">
        Masa aktif undangan sampai
        {{ new Date(stats.invitation_expires_at).toLocaleString('id-ID') }}.
      </p></template
    >
    <form class="guest-search action-group" @submit.prevent="loadGuests()">
      <input
        class="business-search"
        v-model="search"
        placeholder="Cari nama tamu"
        aria-label="Cari nama tamu"
      /><button class="p-button secondary">Cari</button
      ><button type="button" class="p-button secondary" @click="exportGuests">
        Download Statistik CSV
      </button>
    </form>
    <div class="table-scroll">
      <table v-if="guests" class="guest-table">
        <thead>
          <tr>
            <th>Tamu</th>
            <th>Undangan</th>
            <th>RSVP</th>
            <th>Check-in</th>
            <th>QR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in guests.data" :key="guest.id">
            <td>
              <strong>{{ guest.name }}</strong
              ><small>{{ guest.address }}</small>
            </td>
            <td>
              {{
                guest.opened_at
                  ? 'Sudah dibuka'
                  : guest.seen_at
                    ? 'Dilihat'
                    : 'Belum dibuka'
              }}
            </td>
            <td>{{ guest.attendance || 'Belum mengisi' }}</td>
            <td>
              {{
                guest.checked_in_at
                  ? `${guest.people_count} orang`
                  : 'Belum tiba'
              }}
            </td>
            <td>
              <button
                type="button"
                class="p-button secondary"
                @click="selected = guest"
              >
                QR Tamu
              </button>
            </td>
          </tr>
          <tr v-if="!guests.data.length">
            <td colspan="5">
              Belum ada tamu. Impor daftar tamu pada tab Impor / Ekspor.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="guests?.last_page > 1" class="action-group">
      <button
        type="button"
        class="p-button secondary"
        :disabled="guests.current_page <= 1"
        @click="loadGuests(guests.current_page - 1)"
      >
        Sebelumnya</button
      ><span>{{ guests.current_page }} / {{ guests.last_page }}</span
      ><button
        type="button"
        class="p-button secondary"
        :disabled="guests.current_page >= guests.last_page"
        @click="loadGuests(guests.current_page + 1)"
      >
        Berikutnya
      </button>
    </div>
    <BaseModal :open="!!selected" title="QR Tamu" @close="selected = null"
      ><template v-if="selected"
        ><h2>{{ selected.name }}</h2>
        <GuestQr :url="selected.pass_url" :name="selected.name" /><a
          :href="selected.invitation_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-link"
          >Lihat tautan undangan</a
        ></template
      ></BaseModal
    >
  </section>
</template>
<style scoped>
.panel-title {
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}
.panel-title p,
.analytics-note,
.chart-caption {
  font-size: 13px;
  color: #6b7c62;
}
.action-group {
  flex-wrap: wrap;
}
.analytics-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 24px 0;
}
.analytics-cards article {
  border: 1px solid #dce5d6;
  border-radius: 12px;
  padding: 20px;
}
.analytics-cards strong {
  font-size: 30px;
}
.visit-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 150px;
  padding: 12px 0;
  border-bottom: 1px solid #ccd6c6;
}
.visit-bar {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
}
.visit-bar span {
  width: 100%;
  display: block;
  background: #90ad78;
  border-radius: 4px 4px 0 0;
}
.chart-caption {
  margin: 8px 0 20px;
}
.guest-search {
  margin: 25px 0 15px;
}
.table-scroll {
  overflow: auto;
}
.guest-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}
.guest-table td,
.guest-table th {
  text-align: left;
  padding: 14px 10px;
  border-bottom: 1px solid #e1e7db;
}
.guest-table small {
  display: block;
  color: #6b7c62;
}
@media (max-width: 650px) {
  .analytics-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
