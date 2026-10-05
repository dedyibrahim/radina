<script setup>
import CoupleMonogram from '../../components/wedding/effects/CoupleMonogram.vue'
import { provide, computed, inject } from 'vue'
import FloralCorners from '../FloralAtelier/FloralCorners.vue'
import VisualAtmosphere from '../../components/wedding/effects/VisualAtmosphere.vue'
import SectionDivider from '../../components/wedding/effects/SectionDivider.vue'
const floral = inject('floralDesign', null)
const visual = inject('weddingVisual', null)
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
    <VisualAtmosphere
      v-if="visual"
      :scene="sectionKey === 'home' ? 'hero' : 'section'"
      :section="sectionKey"
    />
    <FloralCorners
      v-if="floral && sectionKey !== 'home'"
      compact
    /><CoupleMonogram
      v-if="visual && sectionKey === 'couple'"
      class="section-monogram"
    /><slot />
    <SectionDivider
      v-if="visual && !['home', 'closing'].includes(sectionKey)"
    />
  </div>
</template>
