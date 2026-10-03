<script setup>
import { inject } from 'vue'
import HeroCopy from '../shared/HeroCopy.vue'
const wedding = inject('wedding')
import { scrollToSection } from '../../composables/useSectionNavigation'
</script>
<template>
  <section id="home" class="new-hero hero-editorial">
    <header class="edition-title">
      <b>VOL. 01</b>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <span>{{ wedding.date.display }}</span>
    </header>
    <figure class="editorial-full">
      <img v-if="wedding.hero" :src="wedding.hero" alt="Momen pasangan" />
      <figcaption>THE PEOPLE · THE PROMISE · THE CELEBRATION</figcaption>
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
