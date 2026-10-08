<script setup>
import CoupleMonogram from '../../components/wedding/effects/CoupleMonogram.vue'
import { provide, computed, inject, ref } from 'vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
import { useSceneTimeline } from '../../composables/useSceneTimeline'
import FloralCorners from '../FloralAtelier/FloralCorners.vue'
import VisualAtmosphere from '../../components/wedding/effects/VisualAtmosphere.vue'
import SectionDivider from '../../components/wedding/effects/SectionDivider.vue'
import LivingGardenLayers from '../../components/cinematic/LivingGardenLayers.vue'
const floral = inject('floralDesign', null)
const visual = inject('weddingVisual', null)
const props = defineProps({ sectionKey: String, content: Object })
const root = ref(null)
const visible = useIntersectionAnimation(root)
const livingActive = computed(
  () =>
    visible.value &&
    visual?.performance.active.value &&
    visual?.motion.value &&
    !visual?.performance.reduced.value,
)
const sceneState = useSceneTimeline(
  visible,
  computed(() => !visual?.motion.value),
)
provide(
  'sectionContent',
  computed(() => props.content || {}),
)
</script>
<template>
  <div
    ref="root"
    class="section-frame"
    :class="{ 'floral-section-frame': floral }"
    :data-section="sectionKey"
    :data-scene-state="sceneState"
    :data-scene-transition="visual?.config.value.sceneProfile.transition"
    :data-auto-pause="
      visual?.config.value.motionProfile.sectionPauses?.[sectionKey]
    "
  >
    <VisualAtmosphere
      v-if="visual"
      :scene="sectionKey === 'home' ? 'hero' : 'section'"
      :section="sectionKey"
    />
    <LivingGardenLayers
      v-if="visual?.config.value.sceneProfile.livingNature"
      plane="foreground"
      :scene="sectionKey"
      :active="livingActive"
      :quality="visual.performance.quality.value"
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
