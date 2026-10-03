<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="metro-route">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <span class="metro-station">{{ String(i + 1).padStart(2, '0') }}</span>
        <div>
          <small>{{ chapter.year }} / NEXT STOP</small>
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </div>
        <figure>
          <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" />
        </figure>
      </article>
    </div>
  </section>
</template>
