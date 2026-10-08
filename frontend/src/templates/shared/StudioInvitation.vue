<script setup>
import { computed, provide } from 'vue'
import studio from '../../../../config/template-studio.json'
import cinematicWorlds from '../../../../config/cinematic-worlds.json'
import WeddingExperience from './WeddingExperience.vue'
import StudioOpening from './StudioOpening.vue'
import StudioHero from './StudioHero.vue'
import CelebrationHost from './CelebrationHost.vue'
import CelebrationClosing from './CelebrationClosing.vue'
import WorldHero from '../../components/cinematic/WorldHero.vue'
import WorldClosing from '../../components/cinematic/WorldClosing.vue'
import './experience-base.css'
import './theme-base.css'
import './celebration.css'
import './studio.css'
const props = defineProps({ wedding: Object, preview: Boolean })
const cinematic = computed(() =>
  Boolean(
    cinematicWorlds[props.wedding.template?.template_key] ||
    props.wedding.template?.template_key === 'golden-atelier',
  ),
)
const design = computed(
  () =>
    studio[props.wedding.template?.template_key] ||
    (cinematicWorlds[props.wedding.template?.template_key]
      ? {
          ...cinematicWorlds[props.wedding.template?.template_key],
          family:
            cinematicWorlds[props.wedding.template?.template_key].category ===
            'Regional'
              ? 'regional'
              : 'kids',
          layout: cinematicWorlds[props.wedding.template?.template_key].opening,
          art: 'scene',
        }
      : null) ||
    studio['rose-ribbon'],
)
provide('studioDesign', design)
const colors = computed(() => ({
  '--ivory': design.value.palette.background,
  '--cream': design.value.palette.background,
  '--ink': design.value.palette.ink,
  '--gold': design.value.palette.accent,
  '--sage': design.value.palette.accent,
  '--dusty-rose': design.value.palette.accent,
  '--muted': design.value.palette.ink,
  '--studio-highlight': design.value.palette.highlight,
}))
</script>
<template>
  <div
    class="celebration-theme studio-theme"
    :class="[
      `studio-${wedding.template?.template_key}`,
      `studio-family-${design.family}`,
    ]"
    :style="colors"
  >
    <WeddingExperience
      :wedding="wedding"
      :preview="preview"
      :theme="wedding.template?.template_key"
      design="studio"
      :cover-component="StudioOpening"
      :hero-component="cinematic ? WorldHero : StudioHero"
      :presentation-components="{
        couple: CelebrationHost,
        closing: cinematic ? WorldClosing : CelebrationClosing,
      }"
    />
  </div>
</template>
