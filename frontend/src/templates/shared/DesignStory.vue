<script setup>
import FlowerMotion from '../RomanticFloral/components/FlowerMotion.vue'
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
import DesignCouple from './DesignCouple.vue'
import SectionFrame from './SectionFrame.vue'
defineProps({ design: String })
const wedding = inject('wedding')
</script>
<template>
  <section id="story" class="section design-story" :class="`story-${design}`">
    <FlowerMotion v-if="['amore', 'garden', 'daydream'].includes(design)" />
    <SectionHeading section="story" eyebrow="OUR LOVE STORY" title="Our journey" />
    <div class="story-composition">
      <template v-for="(story, i) in wedding.loveStory" :key="i"
        ><article class="story-chapter" data-reveal>
          <img
            v-if="story.image || design === 'cinema'"
            :src="story.image || wedding.gallery[i % wedding.gallery.length]?.src || wedding.hero"
            :alt="story.title"
            loading="lazy"
            decoding="async"
          />
          <div class="chapter-copy">
            <span class="chapter-number">{{
              design === 'pure' ? String(i + 1).padStart(2, '0') : story.year
            }}</span>
            <h3>{{ story.title }}</h3>
            <p>{{ story.text }}</p>
          </div>
        </article>
        <SectionFrame
          v-if="
            design === 'cinema' &&
            !wedding.customSectionOrder &&
            wedding.sections.couple?.enabled !== false &&
            i === Math.max(0, Math.floor(wedding.loveStory.length / 2) - 1)
          "
          section-key="couple" :content="wedding.sections.couple"
      ><DesignCouple design="cinema" /></SectionFrame></template>
    </div>
  </section>
</template>
