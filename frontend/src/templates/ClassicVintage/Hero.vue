<script setup>
import { inject, computed } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'

const wedding = inject('wedding')
const design = 'letters'
const nameStyle = computed(() => ({
  '--name-scale': `${Math.min(20, 115 / Math.max(wedding.bride.shortName.length, wedding.groom.shortName.length, 1))}vw`,
}))
</script>
<template>
  <section id="home" class="design-hero" :class="`hero-${design}`" :style="nameStyle">
    <div class="invitation-letter">
      <span class="letter-stamp">SAVE THE DATE</span><small>DEAREST FAMILY & FRIENDS</small>
      <h1>{{ wedding.bride.shortName }}<i>&</i>{{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.sections.home?.content || wedding.openingText }}</p>
      <img v-if="wedding.hero" :src="wedding.hero || wedding.cover" alt="Kenangan pasangan" loading="lazy" />
      <p>{{ wedding.date.display }}</p>
      <span class="handwritten">With love, always</span>
    </div>
    <button
      class="hero-scroll"
      @click="scrollToSection(design === 'cinema' ? 'story' : 'couple')"
      aria-label="Gulir ke cerita kami"
    >
      ↓
    </button>
  </section>
</template>
