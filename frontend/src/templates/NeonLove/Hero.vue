<script setup>
import { inject } from 'vue'
import HeroCopy from '../shared/HeroCopy.vue'
const wedding = inject('wedding')
import { scrollToSection } from '../../composables/useSectionNavigation'
</script>
<template>
  <section id="home" class="new-hero hero-neon-love">
    <figure class="urban-hero">
      <img v-if="wedding.hero" :src="wedding.hero" alt="Momen pasangan" />
      <div>
        <small>{{ wedding.sections.home?.heading }}</small>
        <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      </div>
      <span class="city-coordinate">{{ wedding.date.display }}</span>
    </figure>
    <HeroCopy :show-heading="false" />
    <button
      class="hero-scroll"
      aria-label="Gulir ke cerita kami"
      @click="scrollToSection('couple')"
    >
      ↓
    </button>
  </section>
</template>
