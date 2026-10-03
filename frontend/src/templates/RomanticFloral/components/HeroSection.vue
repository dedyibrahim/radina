<script setup>
import { scrollToSection } from '../../../composables/useSectionNavigation'
import FlowerMotion from './FlowerMotion.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { inject } from 'vue'
const wedding = inject('wedding')
import BotanicalOrnament from './BotanicalOrnament.vue'
const parallax = ref(0)
let frame
function updateParallax() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    parallax.value = Math.min(window.scrollY * 0.025, 18)
    frame = null
  })
}
onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    window.addEventListener('scroll', updateParallax, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateParallax)
  if (frame) cancelAnimationFrame(frame)
})
</script>
<template>
  <section id="home" class="hero-section">
    <FlowerMotion />
    <div class="hero-top">
      <span class="eyebrow">TOGETHER, WITH OUR FAMILIES</span
      ><span class="small-monogram"
        >{{ Array.from(wedding.bride.shortName)[0] }} &
        {{ Array.from(wedding.groom.shortName)[0] }}</span
      >
    </div>
    <div class="hero-title" :style="{ transform: `translateY(${parallax}px)` }">
      <p class="eyebrow">THE WEDDING OF</p>
      <h1>{{ wedding.bride.shortName }} <em>&</em> {{ wedding.groom.shortName }}</h1>
      <p class="hero-date">
        {{ wedding.date.day }} {{ wedding.date.month }} {{ wedding.date.year }}
      </p>
    </div>
    <div class="hero-image-wrap">
      <div class="arch-outline"></div>
      <img
        v-if="wedding.hero"
        :src="wedding.hero"
        :alt="`${wedding.bride.shortName} dan ${wedding.groom.shortName}`"
        width="800"
        height="1000"
      /><BotanicalOrnament class="hero-floral" /><span class="photo-caption"
        >a love written in the stars</span
      >
    </div>
    <p class="hero-bottom">And so, our forever begins.</p>
    <button
      class="scroll-indicator"
      @click="scrollToSection(wedding.quote ? 'quote' : 'couple')"
      aria-label="Gulir ke cerita kami"
    >
      <ChevronDown :size="19" />
    </button>
  </section>
</template>
