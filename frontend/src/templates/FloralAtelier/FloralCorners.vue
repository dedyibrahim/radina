<script setup>
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'
import FlowerSpray from './FlowerSpray.vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
import { ornamentAsset } from '../../components/wedding/effects/ornamentLibrary'
const props = defineProps({ compact: Boolean, sectionKey: String })
const design = inject('floralDesign'),
  root = ref(null),
  active = ref(!document.hidden)
const visible = useIntersectionAnimation(root)
const visual = inject('weddingVisual', null)
const direction = computed(
  () =>
    visual?.config.value.artDirection || {
      primary: { family: 'floral', name: design.value.flower },
      accent: { family: 'luxury', name: 'pearl' },
      corners: ['tl', 'br'],
      arrangement: 'crest',
    },
)
const motifs = computed(() => {
  const pair = ['primary', 'accent'].map((role, i) => ({
    role,
    corner: direction.value.corners[i],
    ...direction.value[role],
  }))
  if (!props.compact) return pair
  const index =
    [...(props.sectionKey || 'section')].reduce(
      (sum, c) => sum + c.codePointAt(0),
      0,
    ) % 2
  return [pair[index]]
})
function plane(index) {
  return ['middle', 'background', 'foreground', 'middle'][
    (index + (visual?.config.value.variant || 0)) % 4
  ]
}
const visibility = () => {
  active.value = !document.hidden
}
onMounted(() => {
  document.addEventListener('visibilitychange', visibility)
})
onUnmounted(() => {
  document.removeEventListener('visibilitychange', visibility)
})
</script>
<template>
  <div
    ref="root"
    class="floral-corners"
    :class="[
      `floral-motion-${design.corner_motion}`,
      { 'corners-compact': compact },
    ]"
    :style="{
      '--floral-play':
        visible &&
        active &&
        (visual?.motion.value ?? true) &&
        !visual?.performance.reduced.value
          ? 'running'
          : 'paused',
    }"
    aria-hidden="true"
    :data-flower="design.flower"
    :data-corner-motion="design.corner_motion"
    :data-composition="direction.arrangement"
  >
    <div
      v-for="(motif, index) in motifs"
      :key="motif.role"
      class="atelier-corner signature-corner"
      :class="[`corner-${motif.corner}`, `signature-${motif.role}`]"
      :data-floral-plane="plane(index)"
      :data-ornament="`${motif.family}/${motif.name}`"
    >
      <span class="signature-motion">
        <FlowerSpray
          v-if="motif.role === 'primary' && motif.family === 'floral'"
          :compact="compact"
          :flower="motif.name"
        />
        <span
          v-else
          class="signature-mask"
          :style="{
            '--signature-mask': `url(${ornamentAsset(motif.family, motif.name)})`,
          }"
        />
      </span>
    </div>
  </div>
</template>
