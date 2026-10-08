<script setup>
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue'
import { MailOpen } from 'lucide-vue-next'
import { SceneTimeline } from '../../components/cinematic/SceneTimeline'
import RoyalScene from './RoyalScene.vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
const visual = inject('weddingVisual')
const phase = ref('ENVIRONMENT')
const ready = computed(() => phase.value === 'READY')
const timeline = new SceneTimeline()
const quiet = computed(
  () =>
    !visual.motion.value ||
    visual.performance.reduced.value ||
    !visual.performance.active.value,
)
function skip() {
  timeline.stop()
  phase.value = 'READY'
}
onMounted(() =>
  timeline.run(
    [
      { at: 0, state: 'ENVIRONMENT' },
      { at: 1500, state: 'DOLLY' },
      { at: 3000, state: 'TITLE' },
      { at: 4000, state: 'NAMES' },
      { at: 5000, state: 'DATE' },
      { at: 6000, state: 'READY' },
    ],
    (value) => {
      phase.value = value
    },
    quiet.value,
  ),
)
watch(quiet, (value) => {
  if (value) skip()
})
onUnmounted(() => timeline.stop())
</script>
<template>
  <section
    class="royal-opening cinematic-opening design-cover"
    :data-reveal="phase"
  >
    <RoyalScene scene="opening" arrival :stage="phase" />
    <p class="royal-edition">RADINA <span>JAVANESE ROYAL GARDEN</span></p>
    <button v-if="!ready" class="royal-skip" type="button" @click="skip">
      Lewati animasi
    </button>
    <div class="royal-opening__names" aria-live="polite">
      <p class="royal-kicker">
        {{ wedding.isWedding ? 'THE WEDDING OF' : wedding.occasionLabel }}
      </p>
      <h1>{{ wedding.displayName }}</h1>
      <time>{{ wedding.date.display }}</time>
    </div>
    <div class="royal-opening__guest" :inert="!ready">
      <p>Kepada Yth.</p>
      <strong>{{ guest || 'Bapak / Ibu / Saudara/i' }}</strong>
      <button
        class="button royal-enter"
        type="button"
        :disabled="!ready"
        @click="$emit('open')"
      >
        <MailOpen :size="18" /> Buka Undangan
      </button>
    </div>
    <small class="royal-signature">Abadikan Momen Bahagia Anda</small>
  </section>
</template>
