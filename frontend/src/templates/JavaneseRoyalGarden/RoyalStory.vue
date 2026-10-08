<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
import TextWithLineBreaks from '../../components/TextWithLineBreaks.vue'
import RoyalSlide from './RoyalSlide.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section royal-story royal-chapters">
    <RoyalSlide
      v-for="(story, i) in wedding.loveStory"
      :key="i"
      :scene="`story-${i}`"
    >
      <SectionHeading
        v-if="i === 0"
        section="story"
        eyebrow="OUR STORY"
        title="Perjalanan Kami"
      />
      <div class="royal-story__chapter" data-reveal>
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
      </div>
    </RoyalSlide>
  </section>
</template>
