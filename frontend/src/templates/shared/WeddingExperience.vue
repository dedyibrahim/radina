<script setup>
import { ref, provide, inject, nextTick, onUnmounted, watch } from 'vue'
import InvitationContent from './DesignContent.vue'
import AudioPlayer from './PlaylistPlayer.vue'
import FloatingNavigation from '../RomanticFloral/components/FloatingNavigation.vue'
import BaseToast from '../../components/BaseToast.vue'
import BotanicalOrnament from '../RomanticFloral/components/BotanicalOrnament.vue'
import SceneMotion from './SceneMotion.vue'
import { useWedding } from '../../composables/useWedding'
import { getGuestName } from '../../composables/useGuest'
import { useInvitationDepth } from '../../composables/useInvitationDepth'
import './invitation-depth.css'
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
const { enabled: depthEnabled } = useInvitationDepth(experienceRoot, motionOn)
provide('weddingDesign', props.design)
const opened = inject('invitationOpened', ref(false)),
  guest = props.wedding.guest?.name || getGuestName(),
  toast = ref('')
const { error, play } = inject('weddingAudio')
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
  if (
    wedding.settings.enable_music &&
    wedding.music &&
    wedding.autoplayAfterOpen
  )
    play()
  opened.value = true
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
  >
    <div class="desktop-ambience" aria-hidden="true">
      <BotanicalOrnament class="ambient-left" /><BotanicalOrnament
        class="ambient-right"
      />
      <div class="desktop-note">
        <div class="desktop-monogram">
          <template v-if="wedding.isWedding"
            >{{ Array.from(wedding.bride.shortName)[0] }} <em>&</em
            >{{ Array.from(wedding.groom.shortName)[0] }}</template
          ><template v-else>{{
            Array.from(
              wedding.eventDetails.host_name || wedding.displayName || 'R',
            )[0]
          }}</template>
        </div>
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
      <SceneMotion :effects="wedding.motion" @change="motionOn = $event" />
      <Transition name="cover" mode="out-in"
        ><component
          :is="coverComponent"
          v-if="!opened"
          :guest="guest"
          @open="openInvitation" /><InvitationContent
          v-else
          :hero-component="heroComponent"
          :presentation-components="presentationComponents"
          :design="design"
          :guest="guest"
          @toast="showToast"
      /></Transition>
    </main>
    <template v-if="opened"
      ><AudioPlayer
        v-if="
          wedding.settings.enable_music && wedding.music
        " /><FloatingNavigation /></template
    ><BaseToast :message="toast" />
  </div>
</template>
