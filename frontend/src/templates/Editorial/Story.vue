<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="article-chapters">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <header>
          <span>CHAPTER {{ String(i + 1).padStart(2, '0') }}</span
          ><b>{{ chapter.year }}</b>
        </header>
        <div class="article-columns">
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </div>
        <figure>
          <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" />
          <figcaption>{{ chapter.year }} · OUR ARCHIVE</figcaption>
        </figure>
      </article>
    </div>
  </section>
</template>
