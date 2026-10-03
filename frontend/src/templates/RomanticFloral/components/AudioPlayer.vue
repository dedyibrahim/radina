<script setup>
import { Volume2, VolumeX } from 'lucide-vue-next'
defineProps({ playing: Boolean })
defineEmits(['toggle'])
</script>
<template>
  <button
    class="music-button"
    :class="{ 'is-playing': playing }"
    :aria-label="playing ? 'Matikan musik' : 'Putar musik'"
    :aria-pressed="playing"
    @click="$emit('toggle')"
  >
    <span class="music-ring"></span><Volume2 v-if="playing" :size="18" /><VolumeX
      v-else
      :size="18"
    />
  </button>
</template>
