<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-neon-love">
    <div class="city-cover">
      <img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    </div>
    <div class="neon-title">
      <small>SAVE OUR NIGHT</small>
      <h1>{{ wedding.bride.shortName }}<span>+</span>{{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.date.display }}</p>
      <p class="opening-message">{{ wedding.openingText }}</p>
    </div>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Enter Wedding ↗
      </button>
    </div>
  </section>
</template>
