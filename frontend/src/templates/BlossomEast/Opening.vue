<script setup>
import { inject } from 'vue'
import InkBranch from './InkBranch.vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['open'])
</script>
<template>
  <section class="design-cover new-cover cover-blossom-east">
    <div class="ink-branch" aria-hidden="true"><InkBranch /></div>
    <header class="ink-title">
      <small>A PROMISE IN BLOOM</small>
      <h1>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h1>
      <p>{{ wedding.openingText }}</p>
    </header>
    <figure class="ink-photo">
      <img v-if="wedding.cover" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    </figure>
    <div class="new-cover-guest">
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        Open Invitation ↗
      </button>
    </div>
  </section>
</template>
<style scoped>
.ink-branch {
  width: 100%;
  max-width: 360px;
}
</style>
