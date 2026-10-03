<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="pressed-journal">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <div class="journal-date">
          <span>{{ chapter.year }}</span
          ><small>NOTE {{ i + 1 }}</small>
        </div>
        <figure>
          <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" /><span
            class="paper-tape"
            aria-hidden="true"
          ></span>
        </figure>
        <div class="journal-entry">
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
