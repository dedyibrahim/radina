<script setup>
import FlowerMotion from './FlowerMotion.vue'
import { useGallery } from '../../../composables/useGallery'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-vue-next'
import SectionHeading from './SectionHeading.vue'
import BaseModal from '../../../components/BaseModal.vue'
const { wedding, active, move, onKey, onTouchEnd, onTouchStart } = useGallery()
</script>
<template>
  <section id="gallery" class="section gallery-section">
    <FlowerMotion />
    <SectionHeading
      eyebrow="OUR MOMENTS"
      title="A glimpse of our love"
      subtitle="Hal-hal sederhana, kenangan yang selamanya."
    />
    <div class="gallery-grid">
      <button
        v-for="(photo, i) in wedding.gallery"
        :key="photo.src"
        :class="`gallery-item gallery-item-${i}`"
        :aria-label="`Perbesar foto: ${photo.alt}`"
        @click="active = i"
        data-reveal
      >
        <img
          :src="photo.src"
          :alt="photo.alt"
          width="600"
          height="800"
          loading="lazy"
          decoding="async"
        /><span><Expand :size="19" /></span>
      </button>
    </div>
    <p class="gallery-hint">Sentuh sebuah foto untuk melihat lebih dekat.</p>
    <BaseModal
      :open="active >= 0"
      title="Galeri momen pernikahan"
      wide
      @keydown="onKey"
      @close="active = -1"
    >
      <div v-if="active >= 0" class="lightbox" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <img :src="wedding.gallery[active].src" :alt="wedding.gallery[active].alt" />
        <div class="lightbox-controls">
          <button class="icon-button" aria-label="Foto sebelumnya" @click="move(-1)">
            <ChevronLeft /></button
          ><span>{{ active + 1 }} / {{ wedding.gallery.length }}</span
          ><button class="icon-button" aria-label="Foto berikutnya" @click="move(1)">
            <ChevronRight />
          </button>
        </div>
        <p>{{ wedding.gallery[active].alt }}</p>
      </div>
    </BaseModal>
  </section>
</template>
