<script setup>
import { inject, ref, computed } from 'vue'
import FloatingOrnament from './FloatingOrnament.vue'
import LivingPlant from './LivingPlant.vue'
import LivingFlower from './LivingFlower.vue'
import MovingClouds from './MovingClouds.vue'
import PetalSystem from './PetalSystem.vue'
import AmbientLight from './AmbientLight.vue'
import CinematicScene from '../../cinematic/CinematicScene.vue'
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
    !visual.performance.reduced.value &&
    (visual.config.value.sceneProfile.livingNature ||
      visual.performance.quality.value !== 'lite'),
)
const direction = computed(() => visual.config.value.artDirection)
const livingOrnament = computed(() =>
  direction.value.primary.family === 'floral'
    ? LivingFlower
    : direction.value.primary.family === 'botanical'
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
      <CinematicScene
        v-if="visual.config.value.sceneProfile.cinematic"
        :world="visual.config.value.sceneProfile"
        :scene="section || scene"
        :active="active"
        :quality="visual.performance.quality.value"
        :show-mascot="
          scene === 'hero' && visual.config.value.category === 'Kids & Birthday'
        "
      />
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
        v-if="!direction.nativeCorners"
        :is="livingOrnament"
        :family="direction.primary.family"
        :name="direction.primary.name"
        plane="middle"
        class="signature-primary"
        :variant="visual.config.value.variant"
      />
    </div>
    <div class="visual-foreground" data-plane="foreground">
      <FloatingOrnament
        v-if="!direction.nativeCorners"
        :family="direction.accent.family"
        :name="direction.accent.name"
        plane="foreground"
        class="signature-accent"
        :variant="visual.config.value.variant + 2"
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
