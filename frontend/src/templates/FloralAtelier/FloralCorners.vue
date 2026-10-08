<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import FlowerSpray from './FlowerSpray.vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
defineProps({ compact: Boolean })
const design = inject('floralDesign'),
  root = ref(null),
  active = ref(!document.hidden)
const visible = useIntersectionAnimation(root)
const visual = inject('weddingVisual', null)
function plane(index) {
  return ['middle', 'background', 'foreground', 'middle'][
    (index + (visual?.config.value.variant || 0)) % 4
  ]
}
const visibility = () => {
  active.value = !document.hidden
}
onMounted(() => {
  document.addEventListener('visibilitychange', visibility)
})
onUnmounted(() => {
  document.removeEventListener('visibilitychange', visibility)
})
</script>
<template>
  <div
    ref="root"
    class="floral-corners"
    :class="[
      `floral-motion-${design.corner_motion}`,
      { 'corners-compact': compact },
    ]"
    :style="{
      '--floral-play':
        visible &&
        active &&
        (visual?.motion.value ?? true) &&
        !visual?.performance.reduced.value
          ? 'running'
          : 'paused',
    }"
    aria-hidden="true"
    :data-flower="design.flower"
    :data-corner-motion="design.corner_motion"
  >
    <div
      v-for="(corner, index) in ['tl', 'tr', 'bl', 'br']"
      :key="corner"
      class="atelier-corner"
      :class="`corner-${corner}`"
      :data-floral-plane="plane(index)"
    >
      <FlowerSpray :compact="compact" />
    </div>
  </div>
</template>
