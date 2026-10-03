<script setup>
import { inject } from 'vue'
import HeroCopy from '../shared/HeroCopy.vue'
const wedding = inject('wedding')
import { scrollToSection } from '../../composables/useSectionNavigation'
</script>
<template>
  <section id="home" class="new-hero hero-monochrome">
    <figure class="documentary-hero">
      <img v-if="wedding.hero" :src="wedding.hero" alt="Momen pasangan" />
      <figcaption>
        <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
        <span>{{ wedding.date.display }}</span>
      </figcaption>
    </figure>
    <HeroCopy />
    <button
      class="hero-scroll"
      aria-label="Gulir ke cerita kami"
      @click="scrollToSection('couple')"
    >
      ↓
    </button>
  </section>
</template>
