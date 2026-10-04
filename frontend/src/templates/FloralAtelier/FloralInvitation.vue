<script setup>
import { computed, provide } from 'vue'
import collection from '../../../../config/floral-collection.json'
import WeddingExperience from '../shared/WeddingExperience.vue'
import FloralOpening from './FloralOpening.vue'
import FloralHero from './FloralHero.vue'
import FloralPeople from './FloralPeople.vue'
import FloralGallery from './FloralGallery.vue'
import FloralStory from './FloralStory.vue'
import FloralClosing from './FloralClosing.vue'
import '../shared/experience-base.css'
import '../shared/theme-base.css'
import './floral-atelier.css'
const props = defineProps({ wedding: Object, preview: Boolean })
const design = computed(
  () =>
    collection[props.wedding.template?.template_key] ||
    collection['rosalia-arch'],
)
provide('floralDesign', design)
const colors = computed(() => ({
  '--ivory': design.value.palette.background,
  '--cream': design.value.palette.background,
  '--ink': design.value.palette.ink,
  '--muted': design.value.palette.ink,
  '--gold': design.value.palette.accent,
  '--sage': design.value.palette.leaf,
  '--dusty-rose': design.value.palette.flower,
  '--floral-flower': design.value.palette.flower,
  '--floral-leaf': design.value.palette.leaf,
  '--floral-highlight': design.value.palette.highlight,
}))
</script>
<template>
  <div
    class="floral-atelier"
    :class="[
      `floral-family-${design.family}`,
      `floral-category-${design.category.toLowerCase()}`,
    ]"
    :style="colors"
    :data-floral-template="wedding.template?.template_key"
  >
    <WeddingExperience
      :wedding="wedding"
      :preview="preview"
      :theme="wedding.template?.template_key"
      design="floral-atelier"
      :cover-component="FloralOpening"
      :hero-component="FloralHero"
      :presentation-components="{
        couple: FloralPeople,
        gallery: FloralGallery,
        story: FloralStory,
        closing: FloralClosing,
      }"
    />
  </div>
</template>
