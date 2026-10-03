<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="home" class="design-hero celebration-hero">
    <div class="celebration-pattern" aria-hidden="true"></div>
    <small class="celebration-kicker">{{ wedding.occasionLabel }}</small>
    <div v-if="wedding.hero" class="celebration-portrait">
      <img :src="wedding.hero" :alt="wedding.displayName" loading="lazy" />
    </div>
    <span v-else class="celebration-symbol" aria-hidden="true">✧</span>
    <h1>{{ wedding.displayName }}</h1>
    <p class="celebration-date">{{ wedding.date.display }}</p>
    <p class="celebration-intro">{{ wedding.openingText }}</p>
    <span class="celebration-rule" aria-hidden="true"></span>
  </section>
</template>
