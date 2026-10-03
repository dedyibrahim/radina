<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api, errorMessage } from '../../services/api'
import MediaUploader from '../../components/MediaUploader.vue'
import BaseModal from '../../components/BaseModal.vue'
import FormField from '../../components/FormField.vue'
const tracks = ref([]),
  categories = ref([]),
  search = ref(''),
  category = ref(''),
  form = ref(null),
  pending = ref(false),
  error = ref(''),
  playing = ref(null),
  deleteTrack = ref(null)
let audio
const filtered = computed(() =>
  tracks.value.filter(
    (t) =>
      (!category.value || t.category === category.value) &&
      `${t.title} ${t.artist}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
)
async function load() {
  try {
    const response = await api.get('/admin/music')
    tracks.value = response.data.data
    categories.value = response.data.categories
  } catch (e) {
    error.value = errorMessage(e)
  }
}
function edit(track) {
  form.value = track
    ? { ...track }
    : {
        title: '',
        artist: '',
        file_url: '',
        cover_image: '',
        category: 'Romantic',
        duration: null,
        is_active: true,
        is_featured: false,
      }
}
async function save() {
  pending.value = true
  error.value = ''
  try {
    const data = {
      ...form.value,
      duration: form.value.duration ? Number(form.value.duration) : null,
    }
    if (data.id) await api.put(`/admin/music/${data.id}`, data)
    else await api.post('/admin/music', data)
    form.value = null
    await load()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
async function remove() {
  try {
    await api.delete(`/admin/music/${deleteTrack.value.id}`)
    deleteTrack.value = null
    await load()
  } catch (e) {
    error.value = errorMessage(e)
  }
}
async function preview(track) {
  if (playing.value === track.id) {
    audio?.pause()
    playing.value = null
    return
  }
  audio?.pause()
  audio = new Audio(track.file_url)
  audio.preload = 'metadata'
  try {
    await audio.play()
    playing.value = track.id
    audio.onended = () => {
      playing.value = null
    }
  } catch {
    error.value = 'Audio tidak dapat diputar. Periksa URL atau file.'
  }
}
onMounted(load)
onUnmounted(() => audio?.pause())
</script>
<template>
  <div>
    <div class="admin-page-heading">
      <div>
        <p class="p-eyebrow">RADINA SOUNDTRACKS</p>
        <h1>Music Library</h1>
        <p>Kelola audio milik Anda atau yang memiliki izin penggunaan.</p>
      </div>
      <button class="p-button" @click="edit()">Tambah Musik</button>
    </div>
    <p v-if="error" role="alert" class="alert error">{{ error }}</p>
    <div class="music-filters">
      <input v-model="search" placeholder="Cari lagu..." aria-label="Cari lagu" /><select
        v-model="category"
        aria-label="Kategori musik"
      >
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c">{{ c }}</option>
      </select>
    </div>
    <div class="music-library-grid">
      <article v-for="track in filtered" :key="track.id" class="music-library-track">
        <img v-if="track.cover_image" :src="track.cover_image" :alt="track.title" loading="lazy" />
        <div v-else class="music-art">♫</div>
        <div>
          <h3>{{ track.title }}</h3>
          <p>{{ track.artist || 'Instrumental' }}</p>
          <small
            >{{ track.category }} · {{ track.is_active ? 'Active' : 'Disabled' }}
            {{ track.is_featured ? '· Featured' : '' }}</small
          >
        </div>
        <div class="music-track-actions">
          <button class="p-button secondary small" @click="preview(track)">
            {{ playing === track.id ? 'Pause' : '▶ Preview' }}</button
          ><button class="p-button secondary small" @click="edit(track)">Edit</button
          ><button class="p-button secondary small" @click="deleteTrack = track">Hapus</button>
        </div>
      </article>
    </div>
    <p v-if="!filtered.length" class="empty-note">Belum ada lagu yang sesuai.</p>
    <BaseModal :open="Boolean(form)" title="Music Library" @close="form = null"
      ><form v-if="form" @submit.prevent="save">
        <FormField v-model="form.title" label="Judul lagu" required /><FormField
          v-model="form.artist"
          label="Artist"
        /><FormField v-model="form.file_url" label="Audio URL" /><MediaUploader
          v-model="form.file_url"
          collection="music-library"
          label="Upload audio berlisensi"
        /><FormField v-model="form.cover_image" label="Cover URL" /><MediaUploader
          v-model="form.cover_image"
          collection="music-cover"
          label="Upload cover"
        /><label class="form-field"
          >Category<select v-model="form.category">
            <option v-for="c in categories" :key="c">{{ c }}</option>
          </select></label
        ><FormField v-model="form.duration" label="Durasi (detik)" type="number" /><label
          class="toggle-row"
          >Aktif<input v-model="form.is_active" type="checkbox" /></label
        ><label class="toggle-row"
          >Featured<input v-model="form.is_featured" type="checkbox"
        /></label>
        <p v-if="error" role="alert" class="alert error">{{ error }}</p>
        <button class="p-button" :disabled="pending">
          {{ pending ? 'Menyimpan...' : 'Simpan Musik' }}
        </button>
      </form></BaseModal
    ><BaseModal :open="Boolean(deleteTrack)" title="Hapus lagu?" @close="deleteTrack = null"
      ><p>
        Lagu dihapus dari pilihan library. Media pada playlist undangan yang sudah tersimpan tetap
        tersedia.
      </p>
      <button class="p-button" @click="remove">Hapus Lagu</button></BaseModal
    >
  </div>
</template>
<style>
.music-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 25px 0;
}
.music-filters input,
.music-filters select {
  min-width: 0;
  flex: 1;
  padding: 13px;
  border: 1px solid #dfd1c7;
  border-radius: 10px;
  background: white;
}
.music-library-grid {
  display: grid;
  gap: 15px;
}
.music-library-track {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 16px;
  align-items: center;
  padding: 20px;
  background: white;
  border: 1px solid #eadbd1;
  border-radius: 15px;
  min-width: 0;
}
.music-library-track img,
.music-art {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
}
.music-art {
  display: grid;
  place-items: center;
  background: #ebdad1;
  color: #6d4036;
  font-size: 32px;
}
.music-library-track h3 {
  font-size: 18px;
  overflow-wrap: anywhere;
}
.music-library-track p {
  font-size: 12px;
  margin: 5px 0;
}
.music-library-track small {
  font-size: 10px;
}
.music-track-actions {
  display: flex;
  gap: 8px;
  grid-column: 1/-1;
  flex-wrap: wrap;
}
@media (min-width: 768px) {
  .music-library-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
