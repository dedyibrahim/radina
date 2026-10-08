<script setup>
import { computed, inject, ref } from 'vue'
import RoyalAtmosphere from './RoyalAtmosphere.vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
const props = defineProps({
  scene: { type: String, default: 'home' },
  arrival: Boolean,
  stage: String,
})
const visual = inject('weddingVisual')
const wedding = inject('wedding')
const root = ref(null)
const visible = useIntersectionAnimation(root)
const composition = computed(() => {
  const scene = props.scene
  if (scene === 'opening')
    return { plate: 'royal-gate', camera: 'dolly', sunset: false }
  if (scene === 'closing' || scene === 'gift' || scene === 'wishes')
    return { plate: 'melati-senja', camera: 'retreat', sunset: true }
  if (scene === 'groom' || scene === 'event-0' || scene === 'story-2')
    return { plate: 'jawa-pendopo', camera: 'dolly', sunset: false }
  return {
    plate: 'royal-walkway',
    camera:
      scene.startsWith('story') || scene === 'gallery' ? 'lateral' : 'dolly',
    sunset: false,
  }
})
// These CMS sections supply an environment for each individual chapter.
const grouped = computed(() =>
  props.scene === 'couple'
    ? wedding.isWedding
    : ['story', 'event'].includes(props.scene),
)
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
    v-if="!grouped"
    class="royal-scene"
    :class="`royal-shot-${scene}`"
    :data-active="active"
    :data-arrival="arrival"
    :data-stage="stage"
    :data-environment="composition.plate"
    :data-camera="composition.camera"
    :data-lite="visual.performance.quality.value === 'lite'"
    :style="{
      '--royal-backdrop': `url(/images/cinematic/${composition.plate}-640.webp)`,
    }"
    aria-hidden="true"
  >
    <div ref="root" class="royal-scene__environment">
      <img
        class="royal-scene__camera"
        data-living-motion="true"
        data-parallax="0.35"
        :src="`/images/cinematic/${composition.plate}-640.webp`"
        :srcset="`/images/cinematic/${composition.plate}-640.webp 640w, /images/cinematic/${composition.plate}-1024.webp 1024w`"
        sizes="(max-width: 640px) 100vw, 640px"
        alt=""
        :loading="arrival ? 'eager' : 'lazy'"
        :fetchpriority="arrival ? 'high' : 'auto'"
        decoding="async"
      />
      <div class="royal-scene__veil"></div>
      <RoyalAtmosphere
        :scene="scene"
        :active="active"
        :quality="visual.performance.quality.value"
        :sunset="composition.sunset"
      />
    </div>
  </div>
</template>
