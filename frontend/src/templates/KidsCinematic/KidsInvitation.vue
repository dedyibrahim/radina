<script setup>
import { computed, provide } from 'vue'
import worlds from '../../../../config/cinematic-worlds.json'
import WeddingExperience from '../shared/WeddingExperience.vue'
import KidsOpening from './KidsOpening.vue'
import KidsHero from './KidsHero.vue'
import KidsScene from './KidsScene.vue'
import CelebrationHost from '../shared/CelebrationHost.vue'
import WorldClosing from '../../components/cinematic/WorldClosing.vue'
import '../shared/experience-base.css'
import '../shared/theme-base.css'
import '../shared/celebration.css'
import './kids-cinematic.css'
const props = defineProps({ wedding: Object, preview: Boolean })
const world = computed(() => worlds[props.wedding.template?.template_key])
provide('weddingSceneComponent', KidsScene)
const colors = computed(() => ({
  '--ivory': world.value.palette.background,
  '--cream': world.value.palette.background,
  '--ink': world.value.palette.ink,
  '--muted': world.value.palette.ink,
  '--gold': world.value.palette.accent,
  '--sage': world.value.palette.accent,
  '--dusty-rose': world.value.palette.highlight,
  '--party-accent': world.value.palette.accent,
  '--party-highlight': world.value.palette.highlight,
}))
</script>
<template>
  <div
    class="kids-invitation celebration-theme"
    :data-party-theme="world.kidsTheme"
    :style="colors"
  >
    <WeddingExperience
      :wedding="wedding"
      :preview="preview"
      :theme="wedding.template.template_key"
      design="kids-cinema"
      :cover-component="KidsOpening"
      :cinematic-cover-component="KidsOpening"
      :hero-component="KidsHero"
      :presentation-components="{
        couple: CelebrationHost,
        closing: WorldClosing,
      }"
      :canvas-motion="false"
    />
  </div>
</template>
