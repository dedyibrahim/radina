<script setup>
import { inject } from 'vue'
import CoupleMonogram from './CoupleMonogram.vue'
import FloatingOrnament from './FloatingOrnament.vue'
const visual = inject('weddingVisual')
</script>
<template>
  <div
    class="visual-divider"
    :class="`divider-${visual.config.value.divider}`"
    aria-hidden="true"
  >
    <span class="divider-rule" /><CoupleMonogram
      v-if="visual.config.value.divider === 'gold'"
      compact
    />
    <FloatingOrnament
      v-else
      :family="visual.config.value.ornamentFamily"
      :name="visual.config.value.ornament"
      :variant="visual.config.value.variant"
    />
    <span class="divider-rule" />
  </div>
</template>
