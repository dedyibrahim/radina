<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api, errorMessage } from '../services/api'
import MediaUploader from './MediaUploader.vue'
import { presetFor } from '../templates/contentPresets'
const props = defineProps({ modelValue: Object, weddingId: [Number, String], templateKey: String })
const emit = defineEmits(['update:modelValue'])
const tracks = ref([]),
  categories = ref([]),
  search = ref(''),
  category = ref(''),
  mode = ref('library'),
  error = ref(''),
  playing = ref(null),
  customUrl = ref(''),
  customTitle = ref('')
let audio
const playlist = computed(() => props.modelValue.playlist || [])
const filtered = computed(() =>
  tracks.value.filter(
    (t) =>
      t.is_active &&
      (!category.value || t.category === category.value) &&
      `${t.title} ${t.artist}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
)
function update(fields) {
  emit('update:modelValue', { ...props.modelValue, ...fields })
}
function select(track) {
  if (playlist.value.length >= 10) {
    error.value = 'Maksimal 10 lagu per playlist.'
    return
  }
  if (playlist.value.some((t) => t.library_id === track.id)) return
  error.value = ''
  update({
    playlist: [
      ...playlist.value,
      {
        library_id: track.id,
        title: track.title,
        artist: track.artist,
        url: track.file_url,
        cover: track.cover_image,
        duration: track.duration,
      },
    ],
  })
}
function remove(index) {
  update({ playlist: playlist.value.filter((_, i) => i !== index) })
}
function move(index, step) {
  const values = [...playlist.value],
    next = index + step
  if (next < 0 || next >= values.length) return
  ;[values[index], values[next]] = [values[next], values[index]]
  update({ playlist: values })
}
function custom() {
  if (
    !customTitle.value.trim() ||
    (!/^https?:\/\//i.test(customUrl.value) && !/^\/storage\//.test(customUrl.value))
  ) {
    error.value = 'Masukkan judul dan URL audio http/https atau upload file.'
    return
  }
  if (playlist.value.length >= 10) {
    error.value = 'Maksimal 10 lagu.'
    return
  }
  update({
    playlist: [
      ...playlist.value,
      { title: customTitle.value.trim(), url: customUrl.value, artist: 'Custom audio' },
    ],
  })
  customTitle.value = ''
  customUrl.value = ''
  error.value = ''
}
async function preview(track) {
  if (playing.value === track.id) {
    audio?.pause()
    playing.value = null
    return
  }
  audio?.pause()
  audio = new Audio(track.file_url)
  try {
    await audio.play()
    playing.value = track.id
    audio.onended = () => {
      playing.value = null
    }
  } catch {
    error.value = 'Audio tidak dapat diputar.'
  }
}
onMounted(async () => {
  try {
    const response = await api.get('/admin/music')
    tracks.value = response.data.data
    categories.value = response.data.categories
  } catch (e) {
    error.value = errorMessage(e)
  }
})
onUnmounted(() => audio?.pause())
</script>
<template>
  <div class="music-selector">
    <h3>Wedding Playlist · {{ playlist.length }}/10</h3>
    <p class="muted">
      Rekomendasi: {{ presetFor(templateKey).mood.join(' / ') }}. Semua kategori tetap dapat
      dipilih.
    </p>
    <ol class="selected-playlist">
      <li v-for="(track, i) in playlist" :key="`${track.url}-${i}`">
        <div>
          <strong>{{ i + 1 }}. {{ track.title }}</strong
          ><small>{{ track.artist }}</small>
        </div>
        <div>
          <button type="button" @click="move(i, -1)" :disabled="i === 0" aria-label="Naikkan lagu">
            ↑</button
          ><button
            type="button"
            @click="move(i, 1)"
            :disabled="i === playlist.length - 1"
            aria-label="Turunkan lagu"
          >
            ↓</button
          ><button type="button" @click="remove(i)" aria-label="Hapus lagu dari playlist">×</button>
        </div>
      </li>
    </ol>
    <div class="music-source-tabs">
      <button
        v-for="[key, label] in [
          ['library', 'Music Library'],
          ['upload', 'Custom Upload'],
          ['external', 'External URL'],
        ]"
        :key="key"
        type="button"
        class="p-button secondary small"
        :aria-pressed="mode === key"
        @click="mode = key"
      >
        {{ label }}
      </button>
    </div>
    <template v-if="mode === 'library'"
      ><div class="music-filters">
        <input v-model="search" placeholder="Cari lagu..." aria-label="Cari lagu" /><select
          v-model="category"
          aria-label="Filter kategori"
        >
          <option value="">All</option>
          <option v-for="c in categories" :key="c">{{ c }}</option>
        </select>
      </div>
      <article v-for="track in filtered" :key="track.id" class="selector-track">
        <img
          v-if="track.cover_image"
          :src="track.cover_image"
          :alt="track.title"
          loading="lazy"
        /><span v-else class="selector-art">♫</span>
        <div>
          <strong>{{ track.title }}</strong
          ><small
            >{{ track.artist }} · {{ Math.floor((track.duration || 0) / 60) }}:{{
              String((track.duration || 0) % 60).padStart(2, '0')
            }}</small
          >
        </div>
        <button type="button" class="p-button secondary small" @click="preview(track)">
          {{ playing === track.id ? 'Pause' : '▶' }}</button
        ><button
          type="button"
          class="p-button small"
          :disabled="playlist.some((t) => t.library_id === track.id) || playlist.length >= 10"
          @click="select(track)"
        >
          Pilih
        </button>
      </article></template
    ><template v-else
      ><label class="form-field">Judul lagu<input v-model="customTitle" maxlength="255" /></label
      ><MediaUploader
        v-if="mode === 'upload'"
        v-model="customUrl"
        :wedding-id="weddingId"
        collection="music"
        label="Upload audio berlisensi"
      /><label v-else class="form-field"
        >External Audio URL<input
          v-model="customUrl"
          type="url"
          placeholder="https://.../song.mp3" /></label
      ><button type="button" class="p-button secondary" @click="custom">
        Tambahkan ke Playlist
      </button></template
    ><label class="toggle-row"
      >Shuffle<input
        type="checkbox"
        :checked="modelValue.shuffle"
        @change="update({ shuffle: $event.target.checked })" /></label
    ><label class="toggle-row"
      >Repeat Playlist<input
        type="checkbox"
        :checked="modelValue.repeat !== false"
        @change="update({ repeat: $event.target.checked })"
    /></label>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
    <p class="muted">
      Gunakan audio yang dimiliki atau memiliki izin penggunaan. Playlist kosong memakai URL audio
      lama bila tersedia.
    </p>
  </div>
</template>
<style>
.music-selector {
  margin: 20px 0;
}
.music-selector .muted {
  font-size: 12px;
  margin: 10px 0 20px;
}
.selected-playlist {
  padding: 0;
  margin: 20px 0;
  list-style: none;
}
.selected-playlist li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 13px;
  background: #f8eee8;
  margin: 8px 0;
  border-radius: 12px;
  min-width: 0;
}
.selected-playlist strong {
  font-size: 13px;
  overflow-wrap: anywhere;
}
.selected-playlist small,
.selector-track small {
  display: block;
  font-size: 10px;
  margin-top: 5px;
}
.selected-playlist li > div:first-child {
  min-width: 0;
}
.selected-playlist button {
  min-width: 36px;
  height: 40px;
  background: white;
  border: 1px solid #e4d1c6;
  border-radius: 6px;
}
.music-source-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.selector-track {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid #eadcd3;
  padding: 15px 0;
}
.selector-track img,
.selector-art {
  width: 42px;
  height: 42px;
  object-fit: cover;
  background: #e8d6c4;
  border-radius: 8px;
}
.selector-art {
  display: grid;
  place-items: center;
}
.selector-track strong {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.selector-track .p-button {
  min-width: 0;
  padding: 10px;
}
.music-selector input,
.music-selector select {
  max-width: 100%;
}
.music-selector .music-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 18px 0;
}
.music-selector .music-filters input,
.music-selector .music-filters select {
  padding: 12px;
  border: 1px solid #dbc9bd;
  border-radius: 8px;
  min-width: 0;
  flex: 1;
}
</style>
