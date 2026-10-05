<script setup>
import { inject, ref, computed } from 'vue'
import FloatingOrnament from './FloatingOrnament.vue'
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
    <div class="visual-midground" data-plane="midground">
      <FloatingOrnament
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
    </div>
    <div class="visual-foreground" data-plane="foreground">
      <FloatingOrnament
        :family="visual.config.value.ornamentFamily"
        :name="visual.config.value.secondaryOrnament"
        plane="foreground"
        :variant="visual.config.value.variant + 2"
      />
    </div>
  </div>
</template>
