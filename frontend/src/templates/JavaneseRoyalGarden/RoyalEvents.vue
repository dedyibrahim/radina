<script setup>
import { inject } from 'vue'
import { CalendarPlus, MapPin, Clock3 } from 'lucide-vue-next'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
import Countdown from '../RomanticFloral/components/Countdown.vue'
import { downloadCalendar } from '../RomanticFloral/utils/calendar'
const wedding = inject('wedding')
const date = (value) =>
  new Date(`${value}T12:00:00+07:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
const zone = (value) =>
  ({ 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' })[
    value
  ] || value
const maps = (event) =>
  event.maps ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue || ''} ${event.address || ''}`)}`
</script>
<template>
  <section id="event" class="section royal-events">
    <SectionHeading
      section="event"
      eyebrow="WEDDING EVENTS"
      title="Akad & Resepsi"
    />
    <div
      v-if="wedding.settings.enable_countdown && wedding.countdownDate?.iso"
      class="royal-countdown"
      :data-countdown-event="wedding.countdownEvent?.id"
    >
      <p>Menuju {{ wedding.countdownEvent?.title || 'hari bahagia' }}</p>
      <Countdown :date="wedding.countdownDate.iso" />
    </div>
    <article
      v-for="(event, i) in wedding.events"
      :key="event.id || i"
      class="royal-event"
      data-reveal
    >
      <small>{{ String(i + 1).padStart(2, '0') }}</small>
      <h3>{{ event.title }}</h3>
      <time>{{ date(event.date) }}</time>
      <p class="royal-event__time">
        <Clock3 :size="15" />{{ event.time }} {{ zone(event.timezone) }}
      </p>
      <strong>{{ event.venue }}</strong>
      <p class="royal-event__address">{{ event.address }}</p>
      <div class="royal-event__actions">
        <a
          v-if="event.venue || event.address || event.maps"
          class="button button-outline"
          :href="maps(event)"
          target="_blank"
          rel="noopener noreferrer"
          ><MapPin :size="16" /> Lihat Lokasi</a
        >
        <button
          class="button button-outline"
          type="button"
          :aria-label="`Tambahkan ${event.title} ke kalender`"
          @click="downloadCalendar(wedding, [event])"
        >
          <CalendarPlus :size="16" /> Simpan Tanggal
        </button>
      </div>
    </article>
  </section>
</template>
