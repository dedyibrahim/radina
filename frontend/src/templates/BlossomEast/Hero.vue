<script setup>
import { inject } from 'vue'
import HeroCopy from '../shared/HeroCopy.vue'
const wedding = inject('wedding')
import { scrollToSection } from '../../composables/useSectionNavigation'
</script>
<template>
  <section id="home" class="new-hero hero-blossom-east">
    <div class="art-hero">
      <div>
        <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
        <p v-if="wedding.sections.home?.heading">{{ wedding.sections.home.heading }}</p>
      </div>
      <figure><img v-if="wedding.hero" :src="wedding.hero" alt="Momen pasangan" /></figure>
      <span aria-hidden="true">✿</span>
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
