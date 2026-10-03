<script setup>
import { computed, ref, provide } from 'vue'
import { useAudio } from '../composables/useAudio'
import { templateRegistry } from '../templates/templateRegistry'
import CelebrationInvitation from '../templates/shared/CelebrationInvitation.vue'
const props = defineProps({
  wedding: { type: Object, required: true },
  preview: Boolean,
  startOpen: Boolean,
})
const invitationOpened = ref(
  props.startOpen || props.wedding.section_content?.opening?.enabled === false,
)
const audio = useAudio(
  () =>
    props.wedding.music?.playlist?.length
      ? props.wedding.music.playlist
      : props.wedding.music?.music_url,
  () => (props.wedding.music?.volume ?? 40) / 100,
  () => ({
    shuffle: props.wedding.music?.shuffle,
    repeat: props.wedding.music?.repeat !== false,
  }),
)
provide('weddingAudio', audio)
provide('invitationOpened', invitationOpened)
const selectedTemplate = computed(() =>
  props.wedding.event_type && props.wedding.event_type !== 'wedding'
    ? CelebrationInvitation
    : templateRegistry[props.wedding.template?.template_key || 'romantic-floral'],
)
defineExpose({
  showCover: () => {
    invitationOpened.value = false
  },
  showInvitation: () => {
    invitationOpened.value = true
  },
})
</script>
<template>
  <component v-if="selectedTemplate" :is="selectedTemplate" :wedding="wedding" :preview="preview" />
  <div v-else class="page-state">Template belum tersedia. Hubungi administrator.</div>
</template>
