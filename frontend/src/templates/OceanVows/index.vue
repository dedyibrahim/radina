<script setup>
import WeddingExperience from '../shared/WeddingExperience.vue'
import '../shared/experience-base.css'
import '../shared/theme-base.css'
import '../shared/new-experiences.css'
import './presentation.css'
import Opening from './Opening.vue'
import Hero from './Hero.vue'
import Couple from './Couple.vue'
import Story from './Story.vue'
import Event from './Event.vue'
import Gallery from './Gallery.vue'
import Closing from './Closing.vue'
defineProps({ wedding: Object, preview: Boolean })
const presentationComponents = {
  couple: Couple,
  story: Story,
  event: Event,
  gallery: Gallery,
  closing: Closing,
}
</script>
<template>
  <WeddingExperience
    :wedding="wedding"
    :preview="preview"
    theme="ocean-vows"
    design="ocean-vows"
    :cover-component="Opening"
    :hero-component="Hero"
    :presentation-components="presentationComponents"
  />
</template>
