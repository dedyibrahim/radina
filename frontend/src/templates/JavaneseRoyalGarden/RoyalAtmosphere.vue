<script setup>
import { computed } from 'vue'
const props = defineProps({
  active: Boolean,
  quality: String,
  scene: String,
  sunset: Boolean,
})
const light = computed(() => props.quality === 'lite')
const phase = computed(
  () =>
    [...(props.scene || '')].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 19,
)
</script>
<template>
  <div
    class="royal-atmosphere"
    :data-active="active"
    :data-lite="light"
    :data-sunset="sunset"
    :style="{ '--royal-phase': `${-phase}s` }"
    aria-hidden="true"
  >
    <div class="royal-ray" data-living-motion="true"></div>
    <div class="royal-canopy" data-living-motion="true"></div>
    <div
      v-for="i in light ? 1 : 2"
      :key="`mist-${i}`"
      class="royal-mist"
      :class="`royal-mist--${i}`"
      data-living-motion="true"
    ></div>
    <div class="royal-branch royal-branch--left" data-living-motion="true">
      <img
        src="/images/cinematic/melati-branch.webp"
        alt=""
        :loading="scene === 'opening' ? 'eager' : 'lazy'"
        decoding="async"
      />
    </div>
    <div class="royal-branch royal-branch--right" data-living-motion="true">
      <img
        src="/images/cinematic/melati-branch.webp"
        alt=""
        :loading="scene === 'opening' ? 'eager' : 'lazy'"
        decoding="async"
      />
    </div>
    <div class="royal-particles">
      <i
        v-for="i in light ? 5 : 12"
        :key="`petal-${i}`"
        class="royal-petal"
        data-living-motion="true"
        :style="{
          '--x': `${(i * 31) % 97}%`,
          '--delay': `${i * -2.7}s`,
          '--duration': `${13 + (i % 5)}s`,
        }"
      ></i>
      <i
        v-for="i in light ? 2 : 5"
        :key="`leaf-${i}`"
        class="royal-leaf"
        data-living-motion="true"
        :style="{
          '--x': `${i % 2 ? 2 + i : 95 - i}%`,
          '--delay': `${i * -4.1}s`,
          '--duration': `${18 + i}s`,
        }"
      ></i>
      <i
        v-for="i in light ? 3 : 9"
        :key="`light-${i}`"
        class="royal-mote"
        data-living-motion="true"
        :style="{
          '--x': `${(i * 37) % 95}%`,
          '--y': `${25 + ((i * 17) % 70)}%`,
          '--delay': `${i * -1.8}s`,
        }"
      ></i>
    </div>
    <svg
      v-if="!light"
      class="royal-birds"
      viewBox="0 0 80 32"
      data-living-motion="true"
    >
      <path
        d="M3 22Q11 13 19 22Q27 13 35 22M45 9Q51 2 57 9Q63 2 69 9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
    </svg>
    <div
      v-if="scene.includes('story') || sunset"
      class="royal-reflection"
      data-living-motion="true"
    ></div>
  </div>
</template>
