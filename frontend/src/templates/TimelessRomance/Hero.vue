<script setup>
import { inject } from 'vue'
import HeroCopy from '../shared/HeroCopy.vue'
const wedding = inject('wedding')
import { scrollToSection } from '../../composables/useSectionNavigation'
</script>
<template>
  <section id="home" class="new-hero hero-timeless-romance">
    <header class="european-title">
      <small>{{ wedding.sections.home?.heading }}</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
    </header>
    <div class="european-triptych">
      <img v-if="wedding.hero" :src="wedding.hero" alt="Momen pasangan" /><img
        v-for="image in wedding.gallery.slice(0, 2)"
        :key="image.src"
        :src="image.src"
        :alt="image.alt"
        loading="lazy"
      />
    </div>
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
