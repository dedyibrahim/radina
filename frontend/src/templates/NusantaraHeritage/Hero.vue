<script setup>
import { inject, computed } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'

const wedding = inject('wedding')
const design = 'nusantara'
const nameStyle = computed(() => ({
  '--name-scale': `${Math.min(20, 115 / Math.max(wedding.bride.shortName.length, wedding.groom.shortName.length, 1))}vw`,
}))
</script>
<template>
  <section id="home" class="design-hero" :class="`hero-${design}`" :style="nameStyle">
    <small>{{ design === 'sakinah' ? 'بِسْمِ اللَّهِ' : 'DENGAN PENUH RASA SYUKUR' }}</small>
    <div class="framed-hero-photo">
      <img v-if="wedding.hero" :src="wedding.hero || wedding.cover" alt="Potret pasangan" />
    </div>
    <div class="hero-copy">
      <p v-if="wedding.sections.home?.heading" class="hero-kicker">
        {{ wedding.sections.home.heading }}
      </p>
      <p v-if="wedding.sections.home?.subheading" class="hero-kicker">
        {{ wedding.sections.home.subheading }}
      </p>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.sections.home?.content || wedding.openingText }}</p>
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
