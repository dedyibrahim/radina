<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="closing" class="new-closing closing-ocean-vows">
    <p v-if="wedding.sections.closing?.heading" class="closing-heading">
      {{ wedding.sections.closing.heading }}
    </p>
    <p v-if="wedding.sections.closing?.subheading">{{ wedding.sections.closing.subheading }}</p>
    <figure>
      <img v-if="wedding.closing" :src="wedding.closing" alt="Pasangan pengantin" loading="lazy" />
      <div class="wave-line" aria-hidden="true"></div>
    </figure>
    <div>
      <h2>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h2>
      <p>{{ wedding.sections.closing?.content || wedding.closingText }}</p>
    </div>
    <small>{{ wedding.socialMedia.hashtag }}</small>
    <footer>RADINA · DIGITAL WEDDING INVITATION</footer>
  </section>
</template>
