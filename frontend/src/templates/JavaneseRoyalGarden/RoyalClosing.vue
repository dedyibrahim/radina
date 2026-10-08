<script setup>
import { inject } from 'vue'
import TextWithLineBreaks from '../../components/TextWithLineBreaks.vue'
const wedding = inject('wedding')
const content = inject('sectionContent')
</script>
<template>
  <section id="closing" class="section royal-closing">
    <p class="royal-kicker">{{ content?.heading || 'TERIMA KASIH' }}</p>
    <figure v-if="wedding.closing" class="royal-portrait" data-reveal>
      <img
        :src="wedding.closing"
        :alt="wedding.displayName"
        loading="lazy"
        decoding="async"
      />
    </figure>
    <p>
      <TextWithLineBreaks
        :text="content?.subheading || 'Atas doa dan restu yang diberikan.'"
      />
    </p>
    <h2>{{ wedding.displayName }}</h2>
    <time>{{ wedding.date.display }}</time>
    <p
      v-if="content?.content || wedding.closingText"
      class="royal-introduction"
    >
      <TextWithLineBreaks :text="content?.content || wedding.closingText" />
    </p>
  </section>
</template>
