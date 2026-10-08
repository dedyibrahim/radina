<script setup>
import {
  ref,
  computed,
  provide,
  inject,
  nextTick,
  onUnmounted,
  watch,
} from 'vue'
import InvitationContent from './DesignContent.vue'
import AudioPlayer from './PlaylistPlayer.vue'
import FloatingNavigation from '../RomanticFloral/components/FloatingNavigation.vue'
import BaseToast from '../../components/BaseToast.vue'
import FloatingOrnament from '../../components/wedding/effects/FloatingOrnament.vue'
import CoupleMonogram from '../../components/wedding/effects/CoupleMonogram.vue'
import SceneMotion from './SceneMotion.vue'
import AutoJourney from '../../components/wedding/effects/AutoJourney.vue'
import CinematicOpening from './CinematicOpening.vue'
import VisualAtmosphere from '../../components/wedding/effects/VisualAtmosphere.vue'
import { useWedding } from '../../composables/useWedding'
import { getGuestName } from '../../composables/useGuest'
import { useInvitationDepth } from '../../composables/useInvitationDepth'
import './invitation-depth.css'
import './visual-system.css'
import './living-scene.css'
import './cinematic.css'
import './living-garden.css'
import { visualConfigFor } from './templateVisualConfig'
import { useDevicePerformance } from '../../composables/useDevicePerformance'
import { useParallax } from '../../composables/useParallax'
import { useAmbientWind } from '../../composables/useAmbientWind'
import { useAutoJourney } from '../../composables/useAutoJourney'
const props = defineProps({
  wedding: { type: Object, required: true },
  preview: Boolean,
  theme: { type: String, default: 'floral' },
  design: { type: String, default: 'amore' },
  coverComponent: { type: Object, required: true },
  heroComponent: { type: Object, required: true },
  presentationComponents: { type: Object, default: () => ({}) },
})
const wedding = useWedding(props)
const opened = inject('invitationOpened', ref(false))
const motionPreference = inject('invitationMotionPreference', ref(null))
const motionOn = ref(
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)
const experienceRoot = ref(null)
const performance = useDevicePerformance()
const intensity = computed(
  () => wedding.settings.motion_intensity || 'cinematic',
)
const effectiveMotion = computed(
  () => motionOn.value && intensity.value !== 'off',
)
const visualConfig = computed(() =>
  visualConfigFor(props.wedding.template?.template_key, {
    design: props.design,
    category: props.wedding.template?.category?.name,
  }),
)
const cinematicCategory = computed(
  () => visualConfig.value.sceneProfile?.cinematic,
)
const parallaxEnabled = computed(
  () =>
    effectiveMotion.value &&
    intensity.value === 'cinematic' &&
    performance.active.value &&
    performance.quality.value === 'high' &&
    !performance.coarse.value,
)
const parallaxIntensity = computed(() => visualConfig.value.parallaxIntensity)
const windStyle = useAmbientWind(
  visualConfig,
  performance.quality,
  effectiveMotion,
)
const journey = useAutoJourney(
  experienceRoot,
  computed(() => wedding.settings.enable_auto_journey === true && opened.value),
  computed(() => performance.reduced.value || !effectiveMotion.value),
  computed(() => wedding.settings.auto_journey_speed || 'slow'),
)
provide('weddingJourney', journey)
provide('weddingVisual', {
  config: visualConfig,
  performance,
  motion: effectiveMotion,
  intensity,
  root: experienceRoot,
})
useParallax(experienceRoot, parallaxEnabled, parallaxIntensity)
const { enabled: depthEnabled } = useInvitationDepth(
  experienceRoot,
  computed(() => effectiveMotion.value && intensity.value === 'cinematic'),
  performance,
)
provide('weddingDesign', props.design)
const guest = props.wedding.guest?.name || getGuestName(),
  toast = ref('')
const { error, play, preparePlayback } = inject('weddingAudio')
const opening = ref(false)
let startMusic = false
let timer
function showToast(message) {
  toast.value = message
  clearTimeout(timer)
  timer = setTimeout(() => {
    toast.value = ''
  }, 4500)
}
watch(error, (value) => {
  if (value) showToast(value)
})
async function openInvitation() {
  if (opening.value || opened.value) return
  startMusic = Boolean(
    wedding.settings.enable_music && wedding.music && wedding.autoplayAfterOpen,
  )
  if (startMusic) preparePlayback?.()
  opening.value = true
  opened.value = true
}
async function finishOpening() {
  if (!opening.value) return
  opening.value = false
  if (startMusic) play()
  startMusic = false
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
  document.getElementById('invitation')?.focus({ preventScroll: true })
}
onUnmounted(() => clearTimeout(timer))
</script>
<template>
  <div
    ref="experienceRoot"
    class="wedding-page"
    :class="[
      `theme-${theme}`,
      `design-${design}`,
      {
        'motion-off': !effectiveMotion,
        'depth-on': depthEnabled,
        'cinematic-world-template': cinematicCategory,
      },
    ]"
    :data-depth-enabled="depthEnabled"
    :data-visual-quality="performance.quality.value"
    :data-visual-personality="visualConfig.personality"
    :data-scene-category="visualConfig.sceneProfile.category"
    :data-opening="visualConfig.openingEffect"
    :data-world="visualConfig.sceneProfile.scene"
    :data-world-photo="visualConfig.sceneProfile.photo"
    :data-world-type="visualConfig.sceneProfile.typography"
    :data-cover-state="
      opening ? 'OPENING' : opened ? 'OPENED' : 'COVER_VISIBLE'
    "
    :data-photo-frame="visualConfig.photoFrame"
    :data-event-surface="visualConfig.eventSurface"
    :data-gift-surface="visualConfig.giftSurface"
    :data-music-skin="visualConfig.musicSkin"
    :data-motion-intensity="intensity"
    :data-motion-environment="visualConfig.motionProfile.environment"
    :style="{
      '--visual-variant': visualConfig.variant,
      '--visual-depth': visualConfig.depthIntensity,
      '--world-sky': visualConfig.sceneProfile.palette.background,
      '--world-ink': visualConfig.sceneProfile.palette.ink,
      '--world-accent': visualConfig.sceneProfile.palette.accent,
      '--world-highlight': visualConfig.sceneProfile.palette.highlight,
      ...windStyle,
    }"
  >
    <div class="desktop-ambience" aria-hidden="true">
      <FloatingOrnament
        :family="visualConfig.ornamentFamily"
        :name="visualConfig.ornament"
        class="ambient-left"
      /><FloatingOrnament
        :family="visualConfig.ornamentFamily"
        :name="visualConfig.ornament"
        class="ambient-right"
      />
      <div class="desktop-note">
        <div class="desktop-monogram"><CoupleMonogram /></div>
        <div class="tiny-divider"><span></span><i>✦</i><span></span></div>
        <p>
          {{
            wedding.isWedding ? 'A PROMISE OF FOREVER' : wedding.occasionLabel
          }}
        </p>
        <small
          >{{ wedding.date.day }} {{ wedding.date.month }}
          {{ wedding.date.year }}</small
        >
      </div>
      <div class="desktop-right-note">
        <span>{{
          wedding.isWedding ? 'Love is a journey.' : 'Anda diundang.'
        }}</span>
        <p>
          {{
            wedding.isWedding
              ? 'Thank you for being a part of ours.'
              : 'Terima kasih telah menjadi bagian dari acara kami.'
          }}
        </p>
      </div>
    </div>
    <main class="invitation-shell" id="invitation" tabindex="-1">
      <SceneMotion
        :preference="motionPreference"
        :effects="wedding.motion"
        :quality="
          !cinematicCategory && intensity === 'cinematic'
            ? performance.quality.value
            : 'lite'
        "
        :disabled="intensity === 'off'"
        @change="motionOn = $event"
      />
      <Transition
        name="cover"
        mode="out-in"
        @after-leave="finishOpening"
        @leave-cancelled="finishOpening"
        ><div v-if="!opened" class="opening-stage" :aria-busy="opening">
          <CinematicOpening
            v-if="cinematicCategory"
            :guest="guest"
            @open="openInvitation"
          />
          <template v-else>
            <component
              :is="coverComponent"
              :guest="guest"
              @open="openInvitation"
            />
            <VisualAtmosphere scene="cover" />
          </template>
        </div>
        <InvitationContent
          v-else
          :hero-component="heroComponent"
          :presentation-components="presentationComponents"
          :design="design"
          :guest="guest"
          @toast="showToast"
      /></Transition>
    </main>
    <template v-if="opened && !opening"
      ><AudioPlayer
        v-if="
          wedding.settings.enable_music && wedding.music
        " /><FloatingNavigation /><AutoJourney /></template
    ><BaseToast :message="toast" />
  </div>
</template>
