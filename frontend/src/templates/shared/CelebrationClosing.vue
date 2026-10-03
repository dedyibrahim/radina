<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="closing" class="design-closing celebration-closing">
    <div class="celebration-pattern" aria-hidden="true"></div>
    <span class="celebration-symbol" aria-hidden="true">✧</span>
    <h2>Terima Kasih</h2>
    <p class="celebration-intro">{{ wedding.closingText }}</p>
    <h3>
      {{ wedding.isWedding ? wedding.displayName : wedding.eventDetails.host_name }}
    </h3>
    <a href="/" class="celebration-footer">Undangan digital oleh Radina</a>
  </section>
</template>
