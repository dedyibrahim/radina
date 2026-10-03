<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section new-story">
    <SectionHeading title="Our story" />
    <div class="romance-chapters">
      <article v-for="(chapter, i) in wedding.loveStory" :key="i" data-reveal>
        <header>
          <span>CHAPTER</span><b>{{ ['I', 'II', 'III', 'IV'][i] || i + 1 }}</b
          ><time>{{ chapter.year }}</time>
        </header>
        <figure>
          <img v-if="chapter.image" :src="chapter.image" :alt="chapter.title" loading="lazy" />
        </figure>
        <div>
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
