<script setup>
import { provide } from 'vue'
import WeddingExperience from '../shared/WeddingExperience.vue'
import '../shared/experience-base.css'
import '../shared/theme-base.css'
import './theme.css'
import './presentation.css'
import './living-midnight.css'
import Opening from './Opening.vue'
import Hero from './Hero.vue'
import Closing from './Closing.vue'
import MidnightScene from './MidnightScene.vue'
defineProps({ wedding: Object, preview: Boolean })
provide('weddingSceneComponent', MidnightScene)
</script>
<template>
  <WeddingExperience
    :cover-component="Opening"
    :hero-component="Hero"
    :presentation-components="{ closing: Closing }"
    :canvas-motion="false"
    :wedding="wedding"
    :preview="preview"
    theme="midnight"
    design="dark"
  />
</template>
