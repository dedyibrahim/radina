<script setup>
import { provide, computed, inject } from 'vue'
import FloralCorners from '../FloralAtelier/FloralCorners.vue'
const floral = inject('floralDesign', null)
const props = defineProps({ sectionKey: String, content: Object })
provide(
  'sectionContent',
  computed(() => props.content || {}),
)
</script>
<template>
  <div
    class="section-frame"
    :class="{ 'floral-section-frame': floral }"
    :data-section="sectionKey"
  >
    <FloralCorners v-if="floral && sectionKey !== 'home'" compact /><slot />
  </div>
</template>
