<script setup>
import { inject, computed } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'

const wedding = inject('wedding')
const design = 'noir'
const nameStyle = computed(() => ({
  '--name-scale': `${Math.min(20, 115 / Math.max(wedding.bride.shortName.length, wedding.groom.shortName.length, 1))}vw`,
}))
</script>
<template>
  <section id="home" class="design-hero" :class="`hero-${design}`" :style="nameStyle">
    <img v-if="wedding.hero" class="hero-full-photo" :src="wedding.hero || wedding.cover" alt="Potret pasangan" />
    <div class="fashion-masthead">THE WEDDING EDITION</div>
    <div class="hero-copy">
      <p v-if="wedding.sections.home?.heading" class="hero-kicker">
        {{ wedding.sections.home.heading }}
      </p>
      <p v-if="wedding.sections.home?.subheading" class="hero-kicker">
        {{ wedding.sections.home.subheading }}
      </p>
      <small>AN EVERLASTING PROMISE</small>
      <h1>{{ wedding.bride.shortName }}<i>&</i>{{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.sections.home?.content || wedding.openingText }}</p>
    </div>
    <span class="edition-label">{{ wedding.date.year }} — EXCLUSIVE ISSUE</span>
    <button
      class="hero-scroll"
      @click="scrollToSection(design === 'cinema' ? 'story' : 'couple')"
      aria-label="Gulir ke cerita kami"
    >
      ↓
    </button>
  </section>
</template>
