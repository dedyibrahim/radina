<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
const date = (value) =>
  new Date(`${value}T12:00:00+07:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
const zone = (value) =>
  ({ 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' })[value] || value
</script>
<template>
  <section id="event" class="section new-event">
    <SectionHeading title="The celebration" />
    <div class="coastal-itinerary">
      <article v-for="(event, i) in wedding.events" :key="i" data-reveal>
        <time>{{ event.time.split(' – ')[0] }}</time
        ><span aria-hidden="true">≈</span>
        <div>
          <h3>{{ event.title }}</h3>
          <p>{{ date(event.date) }}</p>
          <p>{{ event.time }} {{ zone(event.timezone) }}</p>
          <strong>{{ event.venue }}</strong>
          <p>{{ event.address }}</p>
          <a
            v-if="event.maps"
            class="button button-outline"
            :href="event.maps"
            target="_blank"
            rel="noopener noreferrer"
            >Lihat Lokasi ↗</a
          >
        </div>
      </article>
    </div>
  </section>
</template>
