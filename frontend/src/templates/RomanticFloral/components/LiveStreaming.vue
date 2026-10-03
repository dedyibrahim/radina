<script setup>
import FlowerMotion from './FlowerMotion.vue'
import { Video, ArrowUpRight } from 'lucide-vue-next'
import { inject } from 'vue'
const wedding = inject('wedding')
import SectionHeading from './SectionHeading.vue'
</script>
<template>
  <section id="livestream" v-if="wedding.livestream" class="section streaming-section">
    <FlowerMotion /><SectionHeading
      eyebrow="LIVE STREAMING"
      title="Together, wherever you are"
      subtitle="Untuk keluarga dan sahabat yang belum dapat hadir secara langsung."
    /><a class="button" :href="wedding.livestream" target="_blank" rel="noopener noreferrer"
      ><Video :size="16" />Tonton Live Streaming<ArrowUpRight :size="16"
    /></a>
  </section>
</template>
