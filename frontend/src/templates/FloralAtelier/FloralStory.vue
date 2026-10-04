<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section floral-story">
    <SectionHeading
      :eyebrow="wedding.isWedding ? 'CERITA KAMI' : 'PERJALANAN ACARA'"
      :title="wedding.isWedding ? 'Kisah yang Tumbuh' : 'Cerita Perjalanan'"
    />
    <div class="floral-story-list">
      <article v-for="(story, i) in wedding.loveStory" :key="i" data-reveal>
        <span class="floral-story-number">{{
          String(i + 1).padStart(2, '0')
        }}</span
        ><img
          v-if="story.image"
          :src="story.image"
          :alt="story.title"
          loading="lazy"
        />
        <div>
          <time>{{ story.year }}</time>
          <h3>{{ story.title }}</h3>
          <p>{{ story.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
