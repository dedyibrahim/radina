<script setup>
import WeddingExperience from '../shared/WeddingExperience.vue'
import '../shared/experience-base.css'
import '../shared/theme-base.css'
import './theme.css'
import './presentation.css'
import Opening from './Opening.vue'
import Hero from './Hero.vue'
defineProps({ wedding: Object, preview: Boolean })
</script>
<template>
  <WeddingExperience
    :cover-component="Opening"
    :hero-component="Hero"
    :wedding="wedding"
    :preview="preview"
    theme="minimal"
    design="pure"
  />
</template>
