<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-timeless-romance">
    <div class="classic-invitation">
      <small>YOU ARE WARMLY INVITED TO</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <div class="classic-rule" aria-hidden="true">❦</div>
      <p>{{ wedding.openingText }}</p>
      <p>{{ wedding.date.display }}</p>
    </div>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Open Invitation ↗
      </button>
    </div>
  </section>
</template>
