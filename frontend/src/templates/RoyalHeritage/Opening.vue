<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-royal-heritage">
    <div class="royal-door left" aria-hidden="true"></div>
    <div class="royal-door right" aria-hidden="true"></div>
    <div class="royal-crest">
      <span>{{ wedding.bride.shortName[0] }} · {{ wedding.groom.shortName[0] }}</span
      ><small>CORDIALLY INVITED</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.date.display }}</p>
      <p class="opening-message">{{ wedding.openingText }}</p>
    </div>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Open the Gates ↗
      </button>
    </div>
  </section>
</template>
