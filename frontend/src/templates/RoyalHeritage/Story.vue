<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <ol class="royal-chronicle">
      <li v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <span class="chronicle-seal">{{ i + 1 }}</span
        ><time>{{ chapter.year }}</time>
        <div>
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </div>
        <figure>
          <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" />
        </figure>
      </li>
    </ol>
  </section>
</template>
