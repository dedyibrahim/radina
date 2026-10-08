<script setup>
import { inject } from 'vue'
import StudioArt from './StudioArt.vue'
const wedding = inject('wedding'),
  design = inject('studioDesign')
</script>
<template>
  <section
    id="home"
    class="design-hero studio-hero"
    :class="[
      `hero-${design.family}`,
      `layout-${design.layout}`,
      `photo-${design.photo}`,
    ]"
  >
    <StudioArt /><span class="studio-kicker">{{ wedding.occasionLabel }}</span>
    <figure v-if="wedding.hero" class="studio-hero-photo">
      <img :src="wedding.hero" :alt="wedding.displayName" loading="lazy" />
    </figure>
    <h1>{{ wedding.displayName }}</h1>
    <time class="studio-date">{{ wedding.date.display }}</time>
    <p class="studio-intro">{{ wedding.openingText }}</p>
    <span class="studio-name-rule" aria-hidden="true"></span>
    <small v-if="wedding.location.name" class="studio-location">{{
      wedding.location.name
    }}</small>
  </section>
</template>
