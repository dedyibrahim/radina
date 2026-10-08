<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
import TextWithLineBreaks from '../../components/TextWithLineBreaks.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section royal-story">
    <SectionHeading
      section="story"
      eyebrow="OUR STORY"
      title="Perjalanan Kami"
    />
    <div class="royal-story__path">
      <article
        v-for="(story, i) in wedding.loveStory"
        :key="i"
        class="royal-story__chapter"
        data-reveal
      >
        <span class="royal-story__year">{{ story.year }}</span>
        <figure v-if="story.image">
          <img
            :src="story.image"
            :alt="story.title"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <h3>{{ story.title }}</h3>
        <p><TextWithLineBreaks :text="story.text" /></p>
      </article>
    </div>
  </section>
</template>
