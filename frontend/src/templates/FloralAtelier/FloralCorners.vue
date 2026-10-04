<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import FlowerSpray from './FlowerSpray.vue'
defineProps({ compact: Boolean })
const design = inject('floralDesign'),
  root = ref(null),
  visible = ref(false),
  active = ref(!document.hidden)
let observer
const visibility = () => {
  active.value = !document.hidden
}
onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      visible.value = entry.isIntersecting
    },
    { rootMargin: '80px' },
  )
  observer.observe(root.value)
  document.addEventListener('visibilitychange', visibility)
})
onUnmounted(() => {
  observer?.disconnect()
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
    :style="{ '--floral-play': visible && active ? 'running' : 'paused' }"
    aria-hidden="true"
    :data-flower="design.flower"
    :data-corner-motion="design.corner_motion"
  >
    <div
      v-for="corner in ['tl', 'tr', 'bl', 'br']"
      :key="corner"
      class="atelier-corner"
      :class="`corner-${corner}`"
    >
      <FlowerSpray :compact="compact" />
    </div>
  </div>
</template>
