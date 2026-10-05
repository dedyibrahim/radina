<script setup>
import FlowerMotion from './FlowerMotion.vue'
import { ref } from 'vue'
import { MapPin, ArrowUpRight } from 'lucide-vue-next'
import { inject } from 'vue'
const wedding = inject('wedding')
import SectionHeading from './SectionHeading.vue'
const loadedMaps = ref(new Set())
</script>
<template>
  <section id="location" class="section location-section">
    <FlowerMotion /><SectionHeading eyebrow="LOCATION" title="Meet us here" />
    <article v-for="location in wedding.locations" :key="location.key" class="location-card">
      <p v-if="location.title" class="location-event-title" data-reveal>{{ location.title }}</p>
      <div class="map-wrap" data-reveal>
        <iframe
          v-if="loadedMaps.has(location.key)"
          :src="location.embed"
          :title="`Peta ${location.title}: ${location.name}`"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe
        ><button
          v-else
          class="map-preview"
          @click="loadedMaps.add(location.key)"
          :aria-label="`Muat peta interaktif ${location.title}: ${location.name}`"
        >
          <div class="map-streets" aria-hidden="true"></div>
          <span class="map-pin"><MapPin :size="26" /></span><strong>{{ location.name }}</strong
          ><span class="map-load">Sentuh untuk memuat peta</span>
        </button>
      </div>
      <div class="location-info" data-reveal>
        <h3>{{ location.name }}</h3>
        <p>{{ location.address }}</p>
        <a class="button" :href="location.maps" target="_blank" rel="noopener noreferrer"
          ><MapPin :size="16" /> Buka Google Maps <ArrowUpRight :size="15"
        /></a>
      </div>
    </article>
  </section>
</template>

<style scoped>
.location-card + .location-card {
  margin-top: 48px;
  padding-top: 36px;
  border-top: 1px solid currentColor;
  border-top-color: color-mix(in srgb, currentColor 18%, transparent);
}
.location-event-title {
  margin: 0 0 18px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-align: center;
}
</style>
