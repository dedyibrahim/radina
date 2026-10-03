<script setup>
import { ref, onUnmounted } from 'vue'
import { Upload, Trash2 } from 'lucide-vue-next'
import { api, errorMessage } from '../services/api'
const props = defineProps({
  modelValue: String,
  weddingId: [String, Number],
  collection: { type: String, default: 'couple' },
  multiple: Boolean,
  label: { type: String, default: 'Upload foto' },
})
const emit = defineEmits(['update:modelValue', 'uploaded'])
const pending = ref(false),
  progress = ref(0),
  error = ref(''),
  temporary = ref('')
async function upload(event) {
  const files = [...event.target.files]
  if (!files.length) return
  error.value = ''
  pending.value = true
  progress.value = 0
  if (files[0].type.startsWith('image/')) temporary.value = URL.createObjectURL(files[0])
  try {
    const data = new FormData()
    if (props.weddingId) data.append('wedding_id', props.weddingId)
    data.append('collection', props.collection)
    files.forEach((file) => data.append('files[]', file))
    const response = await api.post('/admin/media', data, {
      onUploadProgress: (event) => {
        progress.value = Math.round((event.loaded / (event.total || event.loaded)) * 100)
      },
    })
    emit('uploaded', response.data.data)
    if (!props.multiple) emit('update:modelValue', response.data.data[0].url)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
    URL.revokeObjectURL(temporary.value)
    temporary.value = ''
    event.target.value = ''
  }
}
onUnmounted(() => URL.revokeObjectURL(temporary.value))
</script>
<template>
  <div class="media-uploader">
    <div
      v-if="(temporary || modelValue) && !['music', 'music-library', 'video'].includes(collection)"
      class="media-preview"
    >
      <img :src="temporary || modelValue" :alt="label" /><button
        type="button"
        class="icon-button"
        :disabled="pending"
        aria-label="Hapus foto"
        @click="$emit('update:modelValue', '')"
      >
        <Trash2 :size="16" />
      </button>
    </div>
    <label class="upload-zone"
      ><Upload :size="20" /><span>{{
        pending ? `Mengunggah ${progress}%…` : modelValue ? 'Ganti file' : label
      }}</span
      ><small>{{
        ['music', 'music-library'].includes(collection)
          ? 'MP3, WAV, OGG · maksimal 30 MB'
          : collection === 'video'
            ? 'MP4 · maksimal 30 MB'
            : 'JPG, PNG, WebP, AVIF · maksimal 12 MB / foto'
      }}</small
      ><input
        type="file"
        :multiple="multiple"
        :disabled="pending"
        :accept="
          ['music', 'music-library'].includes(collection)
            ? '.mp3,.wav,.ogg'
            : collection === 'video'
              ? '.mp4'
              : 'image/jpeg,image/png,image/webp,image/avif'
        "
        @change="upload" /></label
    ><progress v-if="pending" :value="progress" max="100"></progress>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
  </div>
</template>
