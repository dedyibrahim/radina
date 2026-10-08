<script setup>
import { computed } from 'vue'
const props = defineProps({
  type: String,
  variant: { type: Number, default: 0 },
})
const flecks = computed(() =>
  Array.from({ length: 14 }, (_, index) => ({
    x: `${(index * 37 + props.variant * 19 + 7) % 100}%`,
    size: `${4 + ((index * 7 + props.variant) % 8)}px`,
    duration: `${10 + ((index * 11 + props.variant) % 13)}s`,
    delay: `${-((index * 17 + props.variant) % 21)}s`,
    drift: `${(index % 2 ? -1 : 1) * (18 + index * 3)}px`,
  })),
)
</script>
<template>
  <div class="living-flecks" :class="`flecks-${type}`" aria-hidden="true">
    <i
      v-for="(fleck, index) in flecks"
      :key="index"
      :style="{
        '--fleck-x': fleck.x,
        '--fleck-size': fleck.size,
        '--fleck-duration': fleck.duration,
        '--fleck-delay': fleck.delay,
        '--fleck-drift': fleck.drift,
      }"
    />
  </div>
</template>
