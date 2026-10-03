<script setup>
import FlowerMotion from '../RomanticFloral/components/FlowerMotion.vue'
import { inject, computed } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'

const wedding = inject('wedding')
const design = 'amore'
const nameStyle = computed(() => ({
  '--name-scale': `${Math.min(20, 115 / Math.max(wedding.bride.shortName.length, wedding.groom.shortName.length, 1))}vw`,
}))
</script>
<template>
  <section id="home" class="design-hero" :class="`hero-${design}`" :style="nameStyle">
    <FlowerMotion />
    <div class="editorial-collage">
      <img v-if="wedding.hero" class="collage-main" :src="wedding.hero || wedding.cover" alt="Momen pasangan" /><img
        v-if="wedding.gallery[0]"
        class="collage-small one"
        :src="wedding.gallery[0].src"
        alt="Kenangan pasangan"
        loading="lazy"
      /><img
        v-if="wedding.gallery[1]"
        class="collage-small two"
        :src="wedding.gallery[1].src"
        alt="Kenangan pasangan"
        loading="lazy"
      /><span class="collage-note">{{
        design === 'amore' ? 'a love in bloom' : 'our happy little world ♡'
      }}</span>
    </div>
    <div class="hero-copy">
      <p v-if="wedding.sections.home?.heading" class="hero-kicker">
        {{ wedding.sections.home.heading }}
      </p>
      <p v-if="wedding.sections.home?.subheading" class="hero-kicker">
        {{ wedding.sections.home.subheading }}
      </p>
      <small>TOGETHER, FOREVER</small>
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
