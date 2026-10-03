<script setup>
import { inject } from 'vue'
import { CalendarDays, Clock3, MapPin, ArrowUpRight } from 'lucide-vue-next'
import FlowerMotion from './FlowerMotion.vue'
import SectionHeading from './SectionHeading.vue'
const wedding = inject('wedding')
const displayDate = (date) =>
  new Date(`${date}T12:00:00+07:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
const timezone = (zone) =>
  ({ 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' })[zone] || zone
</script>
<template>
  <section id="event" class="section event-section">
    <FlowerMotion /><SectionHeading
      eyebrow="WEDDING EVENT"
      title="Celebrate with us"
      subtitle="Kehadiran dan doa restu Anda akan menjadikan hari kami semakin berarti."
    />
    <article
      v-for="(event, i) in wedding.events"
      :key="event.id || i"
      class="event-card"
      data-reveal
    >
      <div class="event-number">{{ String(i + 1).padStart(2, '0') }}</div>
      <h3>{{ event.title }}</h3>
      <div class="event-detail">
        <CalendarDays :size="16" /><span>{{ displayDate(event.date) }}</span>
      </div>
      <div class="event-detail">
        <Clock3 :size="16" /><span>{{ event.time }} {{ timezone(event.timezone) }}</span>
      </div>
      <div class="event-venue">
        <MapPin :size="18" /><strong>{{ event.venue }}</strong
        ><span>{{ event.address }}</span>
      </div>
      <a
        v-if="event.maps"
        class="button button-outline"
        :href="event.maps"
        target="_blank"
        rel="noopener noreferrer"
        >Lihat Lokasi<ArrowUpRight :size="15"
      /></a>
    </article>
  </section>
</template>
