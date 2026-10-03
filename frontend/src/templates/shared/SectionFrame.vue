<script setup>
import { provide, computed } from 'vue'
const props = defineProps({ sectionKey: String, content: Object })
provide(
  'sectionContent',
  computed(() => props.content || {}),
)
</script>
<template>
  <div class="section-frame" :data-section="sectionKey"><slot /></div>
</template>
