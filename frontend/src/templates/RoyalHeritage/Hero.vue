<script setup>
import { inject } from 'vue'
import HeroCopy from '../shared/HeroCopy.vue'
const wedding = inject('wedding')
import { scrollToSection } from '../../composables/useSectionNavigation'
</script>
<template>
  <section id="home" class="new-hero hero-royal-heritage">
    <div class="royal-portrait">
      <span class="crest-mini">♧</span><img v-if="wedding.hero" :src="wedding.hero" alt="Momen pasangan" />
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
    </div>
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
