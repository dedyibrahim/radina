<script setup>
import { inject, computed } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'

const wedding = inject('wedding')
const design = 'pure'
const nameStyle = computed(() => ({
  '--name-scale': `${Math.min(20, 115 / Math.max(wedding.bride.shortName.length, wedding.groom.shortName.length, 1))}vw`,
}))
</script>
<template>
  <section id="home" class="design-hero" :class="`hero-${design}`" :style="nameStyle">
    <header class="pure-hero-header">
      <small>{{ wedding.sections.home?.heading }}</small
      ><small>{{ wedding.date.display }}</small>
      <h1>{{ wedding.bride.shortName }} & {{ wedding.groom.shortName }}</h1>
    </header>
    <img v-if="wedding.hero" class="pure-hero-photo" :src="wedding.hero || wedding.cover" alt="Potret pasangan" />
    <p class="pure-hero-caption">{{ wedding.sections.home?.content || wedding.openingText }}</p>
    <button
      class="hero-scroll"
      @click="scrollToSection(design === 'cinema' ? 'story' : 'couple')"
      aria-label="Gulir ke cerita kami"
    >
      ↓
    </button>
  </section>
</template>
