<script setup>
import { inject } from 'vue'
import { Expand } from 'lucide-vue-next'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
import GalleryController from '../shared/GalleryController.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="gallery" class="section floral-gallery">
    <SectionHeading eyebrow="BINGKAI KENANGAN" title="Momen yang Berarti" />
    <GalleryController
      :title="wedding.isWedding ? 'Galeri Kenangan' : 'Galeri Acara'"
      v-slot="{ photos, open }"
    >
      <div class="floral-gallery-grid">
        <button
          v-for="(photo, i) in photos"
          :key="photo.src + i"
          type="button"
          :aria-label="`Perbesar foto: ${photo.alt}`"
          @click="open(i)"
          data-reveal
        >
          <img :src="photo.src" :alt="photo.alt" loading="lazy" /><span
            class="floral-gallery-caption"
            ><small>{{ String(i + 1).padStart(2, '0') }}</small
            ><Expand :size="15"
          /></span>
        </button>
      </div>
    </GalleryController>
    <p class="floral-gallery-hint">Sentuh foto untuk melihat lebih dekat.</p>
  </section>
</template>
