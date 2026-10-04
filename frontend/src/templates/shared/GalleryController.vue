<script setup>
import { inject } from 'vue'
import { useGallery } from '../../composables/useGallery'
import BaseModal from '../../components/BaseModal.vue'
defineProps({ title: { type: String, default: 'Galeri momen pernikahan' } })
const { wedding, active, move, onKey, onTouchStart, onTouchEnd } = useGallery()
const design = inject('weddingDesign', '')
function open(index) {
  active.value = index
}
</script>
<template>
  <slot :photos="wedding.gallery" :open="open" />
  <BaseModal
    :open="active >= 0"
    :title="title"
    wide
    @keydown="onKey"
    @close="active = -1"
  >
    <div
      v-if="active >= 0"
      class="lightbox"
      :class="{ 'lightbox-monochrome': design === 'monochrome' }"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <img
        :src="wedding.gallery[active].src"
        :alt="wedding.gallery[active].alt"
      />
      <div class="lightbox-controls">
        <button
          class="icon-button"
          aria-label="Foto sebelumnya"
          @click="move(-1)"
        >
          ←</button
        ><span>{{ active + 1 }} / {{ wedding.gallery.length }}</span
        ><button
          class="icon-button"
          aria-label="Foto berikutnya"
          @click="move(1)"
        >
          →
        </button>
      </div>
      <p>{{ wedding.gallery[active].alt }}</p>
    </div>
  </BaseModal>
</template>
<style>
.lightbox-monochrome img {
  filter: grayscale(1);
}
</style>
