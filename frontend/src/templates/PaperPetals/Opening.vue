<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-paper-petals">
    <div class="paper-stack">
      <span class="ribbon" aria-hidden="true"></span><small>A LITTLE NOTE FOR YOU</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.openingText }}</p>
      <figure><img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" /></figure>
    </div>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Untie Ribbon ↗
      </button>
    </div>
  </section>
</template>
