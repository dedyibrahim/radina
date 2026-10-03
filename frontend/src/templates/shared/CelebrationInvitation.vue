<script setup>
import { computed } from 'vue'
import WeddingExperience from './WeddingExperience.vue'
import CelebrationOpening from './CelebrationOpening.vue'
import CelebrationHero from './CelebrationHero.vue'
import CelebrationHost from './CelebrationHost.vue'
import CelebrationClosing from './CelebrationClosing.vue'
import { presetFor } from '../contentPresets'
import './experience-base.css'
import './theme-base.css'
import './celebration.css'
const props = defineProps({
  wedding: Object,
  preview: Boolean,
  variant: String,
})
const variant = computed(
  () => props.variant || props.wedding.template?.template_key || 'nur-jannah',
)
const palette = computed(
  () =>
    presetFor(variant.value).palette ||
    {
      sakinah: {
        background: '#f5f3e8',
        ink: '#204c40',
        accent: '#b19656',
      },
      'elegant-luxury': {
        background: '#172027',
        ink: '#f5ead7',
        accent: '#c7a66a',
      },
      'midnight-romance': {
        background: '#301e29',
        ink: '#fff1e5',
        accent: '#ce9c90',
      },
      'minimalist-white': {
        background: '#faf9f5',
        ink: '#252a30',
        accent: '#807a70',
      },
    }[variant.value] || {
      background: '#f5f3ed',
      ink: '#33483d',
      accent: '#a3875b',
    },
)
const colors = computed(() => ({
  '--ivory': palette.value.background,
  '--cream': palette.value.background,
  '--ink': palette.value.ink,
  '--sage': palette.value.accent,
  '--gold': palette.value.accent,
  '--dusty-rose': palette.value.accent,
  '--muted': palette.value.ink,
}))
</script>
<template>
  <div class="celebration-theme" :class="`celebration-${variant}`" :style="colors">
    <WeddingExperience
      :wedding="wedding"
      :preview="preview"
      :theme="variant"
      design="celebration"
      :cover-component="CelebrationOpening"
      :hero-component="CelebrationHero"
      :presentation-components="{
        couple: CelebrationHost,
        closing: CelebrationClosing,
      }"
    />
  </div>
</template>
