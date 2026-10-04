<script setup>
import { inject } from 'vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="closing" class="section floral-closing">
    <span class="floral-small-script">With love & gratitude</span>
    <h2>{{ wedding.sections.closing?.heading || 'Terima Kasih' }}</h2>
    <p>{{ wedding.closingText }}</p>
    <div class="floral-name-divider" aria-hidden="true">
      <span></span>✦<span></span>
    </div>
    <h3>
      {{
        wedding.isWedding ? wedding.displayName : wedding.eventDetails.host_name
      }}
    </h3>
    <a href="/" class="floral-credit">Undangan digital oleh Radina</a>
  </section>
</template>
