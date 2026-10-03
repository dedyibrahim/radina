<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-celestial">
    <div class="sky-speckles" aria-hidden="true"></div>
    <span class="crescent" aria-hidden="true">☾</span>
    <div class="orbit-photo">
      <img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    </div>
    <div class="sky-title">
      <small>WRITTEN IN THE STARS</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.openingText }}</p>
    </div>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Begin Our Journey ↗
      </button>
    </div>
  </section>
</template>
<style scoped>
.orbit-photo {
  transition:
    transform 0.7s ease,
    opacity 0.7s ease;
}
.cover-leave-active .orbit-photo {
  transform: scale(2.5);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .orbit-photo {
    transition: none;
  }
  .cover-leave-active .orbit-photo {
    transform: none;
  }
}
</style>
