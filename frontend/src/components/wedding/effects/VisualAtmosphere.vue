<script setup>
import { inject, ref, computed } from 'vue'
import FloatingOrnament from './FloatingOrnament.vue'
import LivingPlant from './LivingPlant.vue'
import LivingFlower from './LivingFlower.vue'
import MovingClouds from './MovingClouds.vue'
import PetalSystem from './PetalSystem.vue'
import AmbientLight from './AmbientLight.vue'
import { useIntersectionAnimation } from '../../../composables/useIntersectionAnimation'
const props = defineProps({
  scene: { type: String, default: 'section' },
  section: String,
})
const visual = inject('weddingVisual'),
  root = ref(null)
const visible = useIntersectionAnimation(root)
const active = computed(
  () =>
    visible.value &&
    visual.performance.active.value &&
    visual.motion.value &&
    visual.performance.quality.value !== 'lite',
)
const livingOrnament = computed(() =>
  visual.config.value.ornamentFamily === 'floral'
    ? LivingFlower
    : visual.config.value.ornamentFamily === 'botanical'
      ? LivingPlant
      : FloatingOrnament,
)
</script>
<template>
  <div
    ref="root"
    class="visual-atmosphere"
    :class="[
      `atmosphere-${scene}`,
      `texture-${visual.config.value.texture}`,
      `light-${visual.config.value.light}`,
    ]"
    :data-running="active"
    :data-section="section"
    aria-hidden="true"
  >
    <div class="visual-background" data-plane="background">
      <span class="visual-texture" /><span
        class="visual-light"
        data-parallax="0.15"
      />
    </div>
    <div class="living-far" data-plane="far-background" data-parallax="0.15">
      <MovingClouds
        v-if="
          ['garden', 'coast', 'night', 'bamboo'].includes(
            visual.config.value.motionProfile.environment,
          )
        "
        :variant="visual.config.value.variant"
      />
    </div>
    <div class="visual-midground" data-plane="midground">
      <component
        :is="livingOrnament"
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.ornament"
        plane="background"
        :variant="visual.config.value.variant"
      />
      <FloatingOrnament
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.ornament"
        :variant="visual.config.value.variant + 1"
      />
      <component
        :is="livingOrnament"
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.secondaryOrnament"
        plane="middle"
        class="scene-ornament-side"
        :variant="visual.config.value.variant + 3"
      />
      <FloatingOrnament
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.ornament"
        plane="background"
        class="scene-ornament-far"
        :variant="visual.config.value.variant + 4"
      />
    </div>
    <div class="visual-foreground" data-plane="foreground">
      <component
        :is="livingOrnament"
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.secondaryOrnament"
        plane="foreground"
        :variant="visual.config.value.variant + 2"
      />
      <component
        :is="livingOrnament"
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.ornament"
        plane="foreground"
        class="scene-ornament-near"
        :variant="visual.config.value.variant + 5"
      />
    </div>
    <div
      v-if="visual.config.value.motionProfile.particle !== 'none'"
      class="living-atmosphere"
      data-plane="atmosphere"
    >
      <PetalSystem
        :type="visual.config.value.motionProfile.particle"
        :variant="visual.config.value.variant"
      />
      <AmbientLight />
    </div>
  </div>
</template>
