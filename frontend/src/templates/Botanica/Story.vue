<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="island-path">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <span class="path-number">{{ i + 1 }}</span>
        <div class="travel-caption">
          <time>{{ chapter.year }}</time>
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
