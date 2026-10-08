<script setup>
import { inject } from 'vue'
import MidnightScene from './MidnightScene.vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
</script>
<template>
  <section
    class="design-cover cover-dark midnight-cover"
    aria-label="Opening invitation"
  >
    <MidnightScene scene="opening" />
    <p class="midnight-edition">MIDNIGHT ROMANCE <span>RADINA</span></p>
    <div class="cover-title">
      <small>{{
        wedding.isWedding ? 'THE WEDDING OF' : wedding.occasionLabel
      }}</small>
      <h1>{{ wedding.displayName }}</h1>
      <figure v-if="wedding.cover" class="midnight-portrait">
        <img :src="wedding.cover" alt="Potret undangan" fetchpriority="high" />
      </figure>
    </div>
    <div class="cover-invitation">
      <p class="cover-date">{{ wedding.date.display }}</p>
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small>
      <strong class="cover-guest">{{ guest }}</strong>
      <button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Buka Undangan <span aria-hidden="true">↗</span>
      </button>
    </div>
  </section>
</template>
