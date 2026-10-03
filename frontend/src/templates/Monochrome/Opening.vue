<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-monochrome">
    <div class="contrast-intro">
      <small>A DOCUMENTARY OF US</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p class="opening-message">{{ wedding.openingText }}</p>
    </div>
    <figure class="contrast-reveal">
      <img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    </figure>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Reveal Our Story ↗
      </button>
    </div>
  </section>
</template>
