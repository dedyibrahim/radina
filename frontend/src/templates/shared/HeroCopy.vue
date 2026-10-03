<script setup>
import { inject } from 'vue'
defineProps({ showHeading: { type: Boolean, default: true } })
const wedding = inject('wedding')
</script>
<template>
  <div class="new-hero-copy">
    <p v-if="showHeading && wedding.sections.home?.heading" class="hero-content-heading">
      {{ wedding.sections.home.heading }}
    </p>
    <p v-if="wedding.sections.home?.subheading">{{ wedding.sections.home.subheading }}</p>
    <p>{{ wedding.sections.home?.content || wedding.openingText }}</p>
  </div>
</template>
<style scoped>
.hero-content-heading {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.new-hero-copy {
  overflow-wrap: anywhere;
}
</style>
