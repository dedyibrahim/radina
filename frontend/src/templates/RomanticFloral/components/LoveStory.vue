<script setup>
import { inject } from 'vue'
import SectionHeading from './SectionHeading.vue'
import FlowerMotion from './FlowerMotion.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section story-section">
    <FlowerMotion /><SectionHeading
      eyebrow="OUR LOVE STORY"
      title="Every love has a story"
      subtitle="Ini adalah beberapa halaman dari cerita kami."
    />
    <div class="timeline">
      <article v-for="(story, i) in wedding.loveStory" :key="i" data-reveal>
        <span class="timeline-dot"></span>
        <p class="eyebrow">{{ story.year }}</p>
        <h3>{{ story.title }}</h3>
        <p>{{ story.text }}</p>
        <img
          v-if="story.image"
          :src="story.image"
          :alt="story.title"
          loading="lazy"
          class="story-entry-image"
        />
      </article>
    </div>
  </section>
</template>
