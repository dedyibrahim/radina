<script setup>
import { computed, inject, ref } from 'vue'
import LivingGardenLayers from '../../components/cinematic/LivingGardenLayers.vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
const props = defineProps({
  scene: { type: String, default: 'home' },
  arrival: Boolean,
  stage: String,
})
const visual = inject('weddingVisual')
const root = ref(null)
const visible = useIntersectionAnimation(root)
const active = computed(
  () =>
    visible.value &&
    visual.motion.value &&
    visual.performance.active.value &&
    !visual.performance.reduced.value,
)
</script>
<template>
  <div
    ref="root"
    class="royal-scene"
    :class="`royal-shot-${scene}`"
    :data-active="active"
    :data-arrival="arrival"
    :data-stage="stage"
    aria-hidden="true"
  >
    <div class="royal-scene__environment">
      <img
        class="royal-scene__camera"
        data-living-motion="true"
        src="/images/cinematic/jawa-pendopo-640.webp"
        srcset="
          /images/cinematic/jawa-pendopo-640.webp   640w,
          /images/cinematic/jawa-pendopo-1024.webp 1024w
        "
        sizes="(max-width: 640px) 100vw, 640px"
        alt=""
        :loading="arrival ? 'eager' : 'lazy'"
        :fetchpriority="arrival ? 'high' : 'auto'"
        decoding="async"
      />
      <div class="royal-scene__veil"></div>
      <LivingGardenLayers
        :scene="scene"
        :active="active"
        :quality="visual.performance.quality.value"
      />
    </div>
  </div>
</template>
