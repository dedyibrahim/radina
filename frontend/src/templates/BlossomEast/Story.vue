<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="brush-scroll">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <time>{{ chapter.year }}</time
        ><span class="ink-dot" aria-hidden="true">●</span>
        <div>
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
