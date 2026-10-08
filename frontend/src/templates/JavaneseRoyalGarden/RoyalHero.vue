<script setup>
import { inject } from 'vue'
import TextWithLineBreaks from '../../components/TextWithLineBreaks.vue'
const wedding = inject('wedding')
const content = inject('sectionContent')
</script>
<template>
  <section id="home" class="section royal-hero">
    <p class="royal-kicker">{{ wedding.occasionLabel }}</p>
    <h1>{{ wedding.displayName }}</h1>
    <time>{{ wedding.date.display }}</time>
    <figure v-if="wedding.hero" class="royal-portrait" data-reveal>
      <img
        :src="wedding.hero"
        :alt="wedding.displayName"
        loading="lazy"
        decoding="async"
      />
    </figure>
    <p class="royal-introduction">
      <TextWithLineBreaks :text="content?.content || wedding.openingText" />
    </p>
  </section>
</template>
