<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="tidal-journey">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <span class="wave-marker" aria-hidden="true">≈</span>
        <figure>
          <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" />
        </figure>
        <div>
          <small>{{ chapter.year }}</small>
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
