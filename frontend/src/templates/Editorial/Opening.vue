<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-editorial">
    <header class="issue-masthead">
      <small>VOL. 01 · {{ wedding.date.year }}</small>
      <h2>THE<br />WEDDING<br />ISSUE</h2>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p class="opening-message">{{ wedding.openingText }}</p>
    </header>
    <figure class="issue-cover">
      <img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
      <figcaption>{{ wedding.date.display }}</figcaption>
    </figure>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Read Our Issue ↗
      </button>
    </div>
  </section>
</template>
