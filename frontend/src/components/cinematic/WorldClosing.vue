<script setup>
import { inject, computed } from 'vue'
const wedding = inject('wedding'),
  visual = inject('weddingVisual')
const kids = computed(
  () => visual.config.value.sceneProfile.category === 'Kids & Birthday',
)
</script>
<template>
  <section
    id="closing"
    class="world-closing"
    :class="{ 'world-closing--adventure': kids }"
  >
    <span class="world-chapter">{{
      kids
        ? 'SAMPAI BERTEMU DI HARI BAHAGIA'
        : 'SEBUAH KENANGAN UNTUK SELAMANYA'
    }}</span>
    <figure v-if="wedding.closing">
      <img :src="wedding.closing" :alt="wedding.displayName" loading="lazy" />
    </figure>
    <h2>{{ kids ? 'Sampai bertemu!' : 'Terima kasih' }}</h2>
    <p>{{ wedding.closingText }}</p>
    <strong>{{ wedding.displayName }}</strong>
    <small>RADINA · Abadikan Momen Bahagia Anda</small>
  </section>
</template>
