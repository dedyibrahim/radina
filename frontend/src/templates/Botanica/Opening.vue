<script setup>
import { inject } from 'vue'
import PalmLeaf from './PalmLeaf.vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-botanica">
    <div class="resort-window">
      <img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    </div>
    <div class="palm-leaves" aria-hidden="true">
      <PalmLeaf /><span><PalmLeaf /></span>
    </div>
    <header class="resort-title">
      <small>OUR DESTINATION · TOGETHER</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.date.display }}</p>
      <p class="opening-message">{{ wedding.openingText }}</p>
    </header>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Discover Our Day ↗
      </button>
    </div>
  </section>
</template>
<style scoped>
.palm-leaves {
  z-index: -1;
  pointer-events: none;
}
.palm-leaves > svg {
  width: 220px;
  max-width: 60%;
}
.palm-leaves > span {
  width: 220px;
  max-width: 60%;
  right: -45px;
  bottom: 55px;
}
</style>
