<script setup>
import { computed, inject, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import FloralCorners from './FloralCorners.vue'
const wedding = inject('wedding'),
  design = inject('floralDesign'),
  active = ref(0)
const photos = computed(() => [
  ...new Set(
    [wedding.hero, ...wedding.gallery.map((p) => p.src)].filter(Boolean),
  ),
])
const move = (delta) => {
  active.value =
    (active.value + delta + photos.value.length) % photos.value.length
}
</script>
<template>
  <section
    id="home"
    class="floral-hero"
    :class="`floral-hero-${design.family}`"
  >
    <FloralCorners />
    <div class="floral-hero-header">
      <span class="floral-eyebrow">{{ wedding.occasionLabel }}</span>
      <p
        v-if="design.category === 'Islamic'"
        class="floral-bismillah"
        lang="ar"
        dir="rtl"
      >
        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
      </p>
    </div>
    <figure v-if="photos.length" class="floral-hero-photo">
      <img
        :src="photos[design.family === 'carousel' ? active % photos.length : 0]"
        :alt="wedding.displayName"
        loading="lazy"
      />
    </figure>
    <div class="floral-hero-copy">
      <span class="floral-small-script">{{
        wedding.isWedding ? 'Together, in full bloom' : 'Sebuah hari istimewa'
      }}</span>
      <h1>{{ wedding.displayName }}</h1>
      <div class="floral-name-divider" aria-hidden="true">
        <span></span>✦<span></span>
      </div>
      <time>{{ wedding.date.display }}</time>
      <p>{{ wedding.openingText }}</p>
      <small>{{ wedding.location.name }}</small>
    </div>
    <div
      v-if="design.family === 'carousel' && photos.length > 1"
      class="floral-slide-controls"
    >
      <button type="button" aria-label="Foto hero sebelumnya" @click="move(-1)">
        <ChevronLeft :size="17" /></button
      ><span aria-live="polite">{{ active + 1 }} / {{ photos.length }}</span
      ><button type="button" aria-label="Foto hero berikutnya" @click="move(1)">
        <ChevronRight :size="17" />
      </button>
    </div>
  </section>
</template>
