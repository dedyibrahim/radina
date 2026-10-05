<script setup>
import { inject } from 'vue'
const visual = inject('weddingVisual', null)
</script>
<template>
  <i
    v-if="visual"
    class="visual-photo-frame"
    :class="`photo-material-${visual.config.value.photoFrame}`"
    aria-hidden="true"
    ><i /><i
  /></i>
</template>
