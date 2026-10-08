<script setup>
import { inject } from 'vue'
import TextWithLineBreaks from '../../components/TextWithLineBreaks.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="closing" class="design-closing midnight-closing">
    <small>{{
      wedding.sections.closing?.heading || 'WITH LOVE & GRATITUDE'
    }}</small>
    <figure v-if="wedding.closing" class="midnight-portrait">
      <img :src="wedding.closing" alt="Potret undangan" loading="lazy" />
    </figure>
    <h2>{{ wedding.displayName }}</h2>
    <p v-if="wedding.sections.closing?.subheading">
      {{ wedding.sections.closing.subheading }}
    </p>
    <p>
      <TextWithLineBreaks
        :text="wedding.sections.closing?.content || wedding.closingText"
      />
    </p>
    <time>{{ wedding.date.display }}</time>
    <small>{{ wedding.socialMedia.hashtag }}</small>
    <footer>RADINA · DIGITAL INVITATION</footer>
  </section>
</template>
