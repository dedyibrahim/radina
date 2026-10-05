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
import VisualAtmosphere from '../../components/wedding/effects/VisualAtmosphere.vue'
import CoupleMonogram from '../../components/wedding/effects/CoupleMonogram.vue'
import SceneMotion from './SceneMotion.vue'
import { useWedding } from '../../composables/useWedding'
import { getGuestName } from '../../composables/useGuest'
import { useInvitationDepth } from '../../composables/useInvitationDepth'
import './invitation-depth.css'
import './visual-system.css'
import { visualConfigFor } from './templateVisualConfig'
import { useDevicePerformance } from '../../composables/useDevicePerformance'
import { useParallax } from '../../composables/useParallax'
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
const motionOn = ref(
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)
const experienceRoot = ref(null)
const performance = useDevicePerformance()
const visualConfig = computed(() =>
  visualConfigFor(props.wedding.template?.template_key, {
    design: props.design,
    category: props.wedding.template?.category?.name,
  }),
)
const parallaxEnabled = computed(
  () =>
    motionOn.value &&
    performance.active.value &&
    performance.quality.value === 'high' &&
    !performance.coarse.value,
)
const parallaxIntensity = computed(() => visualConfig.value.parallaxIntensity)
provide('weddingVisual', {
  config: visualConfig,
  performance,
  motion: motionOn,
  root: experienceRoot,
})
useParallax(experienceRoot, parallaxEnabled, parallaxIntensity)
const { enabled: depthEnabled } = useInvitationDepth(
  experienceRoot,
  motionOn,
  performance,
)
provide('weddingDesign', props.design)
const opened = inject('invitationOpened', ref(false)),
  guest = props.wedding.guest?.name || getGuestName(),
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
      { 'motion-off': !motionOn, 'depth-on': depthEnabled },
    ]"
    :data-depth-enabled="depthEnabled"
    :data-visual-quality="performance.quality.value"
    :data-visual-personality="visualConfig.personality"
    :data-opening="visualConfig.openingEffect"
    :data-photo-frame="visualConfig.photoFrame"
    :data-event-surface="visualConfig.eventSurface"
    :data-gift-surface="visualConfig.giftSurface"
    :data-music-skin="visualConfig.musicSkin"
    :style="{
      '--visual-variant': visualConfig.variant,
      '--visual-depth': visualConfig.depthIntensity,
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
        :effects="wedding.motion"
        :quality="performance.quality.value"
        @change="motionOn = $event"
      />
      <Transition
        name="cover"
        mode="out-in"
        @after-leave="finishOpening"
        @leave-cancelled="finishOpening"
        ><div v-if="!opened" class="opening-stage" :aria-busy="opening">
          <VisualAtmosphere scene="opening" /><component
            :is="coverComponent"
            :guest="guest"
            @open="openInvitation"
          />
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
        " /><FloatingNavigation /></template
    ><BaseToast :message="toast" />
  </div>
</template>
