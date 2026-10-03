<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="closing" class="new-closing closing-paper-petals">
    <p v-if="wedding.sections.closing?.heading" class="closing-heading">
      {{ wedding.sections.closing.heading }}
    </p>
    <p v-if="wedding.sections.closing?.subheading">{{ wedding.sections.closing.subheading }}</p>
    <div class="paper-thankyou">
      <span class="paper-tape" aria-hidden="true"></span><small>A THANK YOU NOTE</small>
      <p>{{ wedding.sections.closing?.content || wedding.closingText }}</p>
      <h2>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h2>
    </div>
    <small>{{ wedding.socialMedia.hashtag }}</small>
    <footer>RADINA · DIGITAL WEDDING INVITATION</footer>
  </section>
</template>
