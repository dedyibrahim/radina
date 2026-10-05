<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
const visual = inject('weddingVisual', null)
const floral = computed(
  () =>
    !visual ||
    ['floral', 'botanical', 'romantic'].includes(
      visual.config.value.ornamentFamily,
    ),
)

const layer = ref(null)
const visible = ref(false)
let observer

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      visible.value = entry.isIntersecting
    },
    { rootMargin: '60px' },
  )
  if (layer.value?.parentElement) observer.observe(layer.value.parentElement)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="floral"
    ref="layer"
    class="flower-motion"
    :class="{ 'flowers-visible': visible }"
    aria-hidden="true"
  >
    <div
      v-for="side in ['left', 'right']"
      :key="side"
      class="flower-corner"
      :class="`flower-corner-${side}`"
    >
      <svg class="swaying-flower" viewBox="0 0 100 170" fill="none">
        <path
          d="M26 166C33 130 54 100 54 47M38 128C31 112 23 99 13 91M49 96C66 85 76 77 87 65"
          stroke="#8c9b7c"
          stroke-width="1.2"
        />
        <path
          d="M38 128C15 124 10 110 13 94C30 98 38 109 38 128ZM49 96C53 76 71 66 87 65C82 84 66 95 49 96Z"
          fill="#99aa87"
          opacity=".45"
        />
        <g class="flower-bloom" transform="translate(54 47)">
          <ellipse
            v-for="i in 8"
            :key="i"
            cx="0"
            cy="-15"
            rx="10"
            ry="20"
            :transform="`rotate(${i * 45})`"
            fill="#dab5ae"
            fill-opacity=".62"
            stroke="#b79187"
            stroke-opacity=".35"
            stroke-width=".7"
          />
          <ellipse
            v-for="i in 6"
            :key="`inner-${i}`"
            cx="0"
            cy="-8"
            rx="5"
            ry="12"
            :transform="`rotate(${i * 60 + 15})`"
            fill="#f1d9cd"
            fill-opacity=".85"
          />
          <circle r="5" fill="#b69a62" />
          <circle r="2.5" fill="#ead8a8" />
        </g>
      </svg>
    </div>
    <span
      v-for="i in 6"
      :key="i"
      class="drifting-petal"
      :class="i % 2 ? 'petal-edge-left' : 'petal-edge-right'"
      :style="{ '--petal-index': i }"
    ></span>
  </div>
</template>
