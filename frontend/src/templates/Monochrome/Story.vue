<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="documentary-archive">
      <figure v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" />
        <figcaption>
          <header>
            <b>{{ chapter.year }}</b
            ><span>ARCHIVE / {{ i + 1 }}</span>
          </header>
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
