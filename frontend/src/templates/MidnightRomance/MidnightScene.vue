<script setup>
import { computed, inject, ref } from 'vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
const props = defineProps({ scene: { type: String, default: 'home' } })
const visual = inject('weddingVisual')
const viewport = ref(null)
const visible = useIntersectionAnimation(viewport)
const active = computed(
  () =>
    visible.value &&
    visual.motion.value &&
    visual.performance.active.value &&
    !visual.performance.reduced.value,
)
const lite = computed(() => visual.performance.quality.value === 'lite')
const phase = computed(
  () => [...props.scene].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 23,
)
const shot = computed(() =>
  ['opening', 'home', 'quote', 'date'].includes(props.scene)
    ? 'moon'
    : ['gallery', 'couple', 'story'].includes(props.scene)
      ? 'roses'
      : 'water',
)
</script>
<template>
  <div
    class="midnight-scene"
    :data-active="active"
    :data-lite="lite"
    :data-shot="shot"
    :style="{ '--midnight-phase': `${-phase}s` }"
    aria-hidden="true"
  >
    <div ref="viewport" class="midnight-scene__viewport">
      <img
        class="midnight-camera"
        data-living-motion="true"
        src="/images/cinematic/midnight-garden-640.webp"
        srcset="
          /images/cinematic/midnight-garden-640.webp   640w,
          /images/cinematic/midnight-garden-1024.webp 1024w
        "
        sizes="(max-width: 640px) 100vw, 640px"
        alt=""
        :loading="scene === 'opening' ? 'eager' : 'lazy'"
        decoding="async"
      />
      <div class="midnight-veil"></div>
      <div class="midnight-moonlight" data-living-motion="true"></div>
      <div
        v-for="i in lite ? 1 : 2"
        :key="`mist-${i}`"
        class="midnight-mist"
        :class="`midnight-mist--${i}`"
        data-living-motion="true"
      ></div>
      <div class="midnight-water" data-living-motion="true">
        <i
          v-for="i in lite ? 2 : 4"
          :key="i"
          :style="{ '--delay': `${i * -2.8}s` }"
          data-living-motion="true"
        ></i>
      </div>
      <div
        v-for="side in ['left', 'right']"
        :key="side"
        class="midnight-candle"
        :class="`midnight-candle--${side}`"
        data-living-motion="true"
      >
        <i data-living-motion="true"></i>
      </div>
      <div
        v-for="side in ['left', 'right']"
        :key="`rose-${side}`"
        class="midnight-rose"
        :class="`midnight-rose--${side}`"
        data-living-motion="true"
      >
        <img
          src="/images/cinematic/midnight-roses.webp"
          alt=""
          :loading="scene === 'opening' ? 'eager' : 'lazy'"
          decoding="async"
        />
      </div>
      <i
        v-for="i in lite ? 4 : 12"
        :key="`fly-${i}`"
        class="midnight-firefly"
        data-living-motion="true"
        :style="{
          '--x': `${(i * 29) % 96}%`,
          '--y': `${30 + ((i * 17) % 64)}%`,
          '--delay': `${i * -1.7}s`,
          '--duration': `${7 + (i % 5)}s`,
        }"
      ></i>
      <i
        v-for="i in lite ? 3 : 8"
        :key="`petal-${i}`"
        class="midnight-petal"
        data-living-motion="true"
        :style="{
          '--x': `${(i * 37) % 96}%`,
          '--delay': `${i * -2.3}s`,
          '--duration': `${12 + (i % 7)}s`,
        }"
      ></i>
      <i
        v-if="!lite"
        class="midnight-shooting-star"
        data-living-motion="true"
      ></i>
    </div>
  </div>
</template>
