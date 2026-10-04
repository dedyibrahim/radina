<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { api, errorMessage } from '../../services/api'
import WeddingAnalytics from '../../components/WeddingAnalytics.vue'
const route = useRoute(),
  code = ref(''),
  people = ref(1),
  guest = ref(null),
  error = ref(''),
  message = ref(''),
  busy = ref(false),
  scanning = ref(false),
  video = ref(null),
  cameraError = ref(''),
  title = ref('Check-in Tamu'),
  refresh = ref(0)
const base = `/admin/weddings/${route.params.id}`
let controls,
  reader,
  disposed = false,
  requestVersion = 0
onMounted(async () => {
  try {
    title.value = (await api.get(base)).data.data.title
  } catch (e) {
    error.value = errorMessage(e)
  }
})
function stop() {
  controls?.stop()
  controls = null
  for (const track of video.value?.srcObject?.getTracks?.() || []) track.stop()
  if (video.value) video.value.srcObject = null
  scanning.value = false
}
onUnmounted(() => {
  disposed = true
  requestVersion++
  stop()
})
function clearGuest() {
  guest.value = null
  requestVersion++
}
async function lookup() {
  const version = ++requestVersion
  busy.value = true
  guest.value = null
  error.value = ''
  message.value = ''
  try {
    const result = (
      await api.post(`${base}/check-in/lookup`, { code: code.value })
    ).data.data
    if (version === requestVersion) {
      guest.value = result
      people.value = result.check_in?.people_count || 1
    }
  } catch (e) {
    if (version === requestVersion) error.value = errorMessage(e)
  } finally {
    if (version === requestVersion) busy.value = false
  }
}
async function acceptCode(value) {
  stop()
  code.value = value
  await lookup()
}
async function camera() {
  cameraError.value = ''
  scanning.value = true
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    if (disposed || !scanning.value) return
    reader = new BrowserMultiFormatReader()
    const active = await reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      video.value,
      (result) => {
        if (result && scanning.value) acceptCode(result.getText())
      },
    )
    if (disposed || !scanning.value) active.stop()
    else controls = active
  } catch {
    stop()
    cameraError.value =
      'Kamera tidak dapat dibuka. Izinkan akses kamera atau gunakan foto QR/kode tamu.'
  }
}
async function image(event) {
  cameraError.value = ''
  const file = event.target.files?.[0]
  if (!file) return
  stop()
  let url
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    url = URL.createObjectURL(file)
    const result = await new BrowserMultiFormatReader().decodeFromImageUrl(url)
    await acceptCode(result.getText())
  } catch {
    cameraError.value =
      'QR pada gambar tidak terbaca. Gunakan gambar QR asli yang diunduh.'
  } finally {
    if (url) URL.revokeObjectURL(url)
    event.target.value = ''
  }
}
async function check() {
  if (!guest.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const result = (
      await api.post(`${base}/check-in`, {
        code: code.value,
        people_count: Number(people.value),
      })
    ).data
    guest.value.check_in = result.data
    message.value = result.message
    refresh.value++
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div>
    <RouterLink :to="`/admin/weddings/${route.params.id}`" class="text-link"
      >← Kelola undangan</RouterLink
    >
    <div class="admin-title">
      <div>
        <p class="p-eyebrow">GUEST ARRIVAL</p>
        <h1>Check-in Tamu</h1>
        <p>{{ title }}</p>
      </div>
    </div>
    <section class="surface check-in">
      <div class="action-group">
        <button
          type="button"
          class="p-button"
          :disabled="scanning || busy"
          @click="camera"
        >
          Buka Kamera</button
        ><button
          v-if="scanning"
          type="button"
          class="p-button secondary"
          @click="stop"
        >
          Tutup Kamera</button
        ><label class="p-button secondary"
          >Pilih Foto QR<input type="file" accept="image/*" @change="image"
        /></label>
      </div>
      <video
        ref="video"
        v-show="scanning"
        autoplay
        playsinline
        muted
        aria-label="Kamera pemindai QR"
      ></video>
      <p v-if="cameraError" class="alert error" role="alert">
        {{ cameraError }}
      </p>
      <form class="manual-code" @submit.prevent="lookup">
        <label class="form-field"
          >Tautan atau kode QR tamu<input
            v-model="code"
            :disabled="busy"
            required
            placeholder="Tempel tautan /tamu/… atau kode tamu"
            @input="clearGuest" /></label
        ><button class="p-button secondary" :disabled="busy">Cari Tamu</button>
      </form>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <p v-if="message" class="alert" role="status">{{ message }}</p>
      <article v-if="guest" class="guest-result">
        <h2>{{ guest.name }}</h2>
        <p>{{ guest.address }}</p>
        <p v-if="guest.check_in" class="alert">
          Sudah check-in · {{ guest.check_in.people_count }} orang ·
          {{ new Date(guest.check_in.checked_in_at).toLocaleString('id-ID') }}
        </p>
        <template v-else
          ><label class="form-field"
            >Jumlah orang yang datang<input
              v-model="people"
              type="number"
              min="1"
              max="100" /></label
          ><button class="p-button" :disabled="busy" @click="check">
            {{ busy ? 'Mencatat…' : 'Konfirmasi Kehadiran' }}
          </button></template
        >
      </article>
    </section>
    <section class="surface analytics-panel">
      <WeddingAnalytics
        :key="refresh"
        :base="base"
        :wedding-id="route.params.id"
        admin
      />
    </section>
  </div>
</template>
<style scoped>
.check-in,
.analytics-panel {
  padding: 28px;
  margin-bottom: 24px;
}
.action-group {
  flex-wrap: wrap;
}
.action-group input[type='file'] {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
video {
  width: 100%;
  max-width: 520px;
  max-height: 400px;
  margin: 20px 0;
  border-radius: 12px;
  background: #14251b;
}
.manual-code {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin: 24px 0;
}
.manual-code label {
  flex: 1;
  margin: 0;
}
.guest-result {
  padding: 20px;
  background: #f0f5e9;
  border-radius: 12px;
}
.guest-result input {
  max-width: 160px;
}
@media (max-width: 650px) {
  .manual-code {
    display: block;
  }
  .manual-code button {
    margin-top: 12px;
  }
  .check-in,
  .analytics-panel {
    padding: 20px;
  }
}
</style>
