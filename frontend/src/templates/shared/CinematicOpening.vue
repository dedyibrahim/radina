<script setup>
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue'
import { MailOpen, Sparkles } from 'lucide-vue-next'
import CinematicScene from '../../components/cinematic/CinematicScene.vue'
import { SceneTimeline } from '../../components/cinematic/SceneTimeline'

defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
const visual = inject('weddingVisual')
const world = computed(() => visual.config.value.sceneProfile)
const active = computed(
  () =>
    visual.performance.active.value &&
    visual.motion.value &&
    visual.performance.quality.value !== 'lite',
)
const phase = ref('ENVIRONMENT')
const timeline = new SceneTimeline()
const ready = computed(() => phase.value === 'READY')
function establish() {
  timeline.run(
    [
      { at: 0, state: 'ENVIRONMENT' },
      { at: 200, state: 'TITLE' },
      { at: 500, state: 'NAMES' },
      { at: 850, state: 'DATE' },
      { at: 1100, state: 'READY' },
    ],
    (state) => {
      phase.value = state
    },
    !active.value,
  )
}
onMounted(establish)
watch(active, (value) => {
  if (!value) {
    timeline.stop()
    phase.value = 'READY'
  }
})
onUnmounted(() => timeline.stop())
const kids = computed(() => world.value.category === 'Kids & Birthday')
const birthday = computed(() => wedding.eventType === 'birthday')
const honoree = computed(
  () => wedding.eventDetails.honoree_name || wedding.displayName,
)
const title = computed(() =>
  birthday.value ? honoree.value : wedding.displayName,
)
const initial = computed(() =>
  title.value
    .split(/[& ]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join(''),
)
</script>

<template>
  <section
    class="design-cover cinematic-opening"
    :class="[
      `opening-${world.opening}`,
      `photo-${world.photo}`,
      `voice-${world.typography}`,
      `type-${wedding.eventType}`,
      `composition-${world.composition || (kids ? 'adventure' : 'sanctuary')}`,
    ]"
    :data-scene="world.scene"
    :data-reveal="phase"
  >
    <CinematicScene :world="world" scene="opening" :active="active" />
    <div class="cinematic-opening__veil" aria-hidden="true"></div>
    <div class="cinematic-opening__edition">
      <span>RADINA</span><i></i><span>{{ world.world }}</span>
    </div>
    <figure class="cinematic-opening__portrait">
      <img
        v-if="wedding.cover"
        :src="wedding.cover"
        :alt="title"
        fetchpriority="high"
      />
      <span v-else class="cinematic-opening__monogram">{{
        initial || 'R'
      }}</span>
    </figure>
    <div class="cinematic-opening__copy">
      <p class="cinematic-opening__kicker">
        {{
          kids
            ? birthday
              ? 'HARI INI ADALAH HARI SPESIAL'
              : wedding.occasionLabel
            : wedding.occasionLabel
        }}
      </p>
      <h1>{{ title }}</h1>
      <p
        v-if="birthday && wedding.eventDetails.honoree_age"
        class="cinematic-opening__age"
      >
        Merayakan usia ke-{{ wedding.eventDetails.honoree_age }}
      </p>
      <p
        v-if="!wedding.isWedding && wedding.eventDetails.host_name"
        class="cinematic-opening__host"
      >
        Dengan hormat, {{ wedding.eventDetails.host_name }} mengundang Anda
      </p>
      <time>{{ wedding.date.display || 'Tanggal akan diumumkan' }}</time>
    </div>
    <div class="cinematic-opening__invite">
      <span>Kepada Yth.</span>
      <strong>{{ guest || 'Bapak / Ibu / Saudara/i' }}</strong>
      <button
        class="cinematic-opening__enter"
        :disabled="!ready"
        @click="$emit('open')"
      >
        <Sparkles v-if="kids" :size="17" /><MailOpen v-else :size="17" />
        {{ kids ? 'Mulai Petualangan' : 'Buka Undangan' }}
      </button>
    </div>
    <span class="cinematic-opening__signature"
      >Abadikan Momen Bahagia Anda</span
    >
  </section>
</template>
