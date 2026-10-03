<script setup>
import FlowerMotion from '../RomanticFloral/components/FlowerMotion.vue'
import { inject } from 'vue'
import { MapPin, Clock3, CalendarDays } from 'lucide-vue-next'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
defineProps({ design: String })
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
  <section id="event" class="section event-section design-event">
    <FlowerMotion v-if="['amore', 'garden', 'daydream'].includes(design)" />
    <SectionHeading eyebrow="WEDDING EVENT" title="Join our celebration" />
    <article
      v-for="(event, i) in wedding.events"
      :key="event.id || i"
      class="event-card"
      data-reveal
    >
      <template v-if="design === 'pure'"
        ><div class="calendar-leaf">
          <b>{{ event.date?.slice(-2) }}</b
          ><small>{{ date(event.date).split(' ').slice(2).join(' ') }}</small>
        </div>
        <div class="calendar-event">
          <h3>{{ event.title }}</h3>
          <p>{{ date(event.date) }}</p>
          <p>{{ event.time }} {{ zone(event.timezone) }}</p>
          <strong>{{ event.venue }}</strong>
          <p>{{ event.address }}</p>
        </div></template
      ><template v-else-if="design === 'noir' || design === 'daydream'"
        ><div class="ticket-stub">
          <small>{{ design === 'noir' ? 'YOU ARE INVITED' : 'ADMIT ONE · LOVE' }}</small
          ><b>{{ String(i + 1).padStart(2, '0') }}</b
          ><span>{{ event.date?.slice(-2) }} / {{ event.date?.slice(5, 7) }}</span>
        </div>
        <div class="ticket-body">
          <small>{{ date(event.date) }}</small>
          <h3>{{ event.title }}</h3>
          <p>{{ event.time }} {{ zone(event.timezone) }}</p>
          <strong>{{ event.venue }}</strong>
          <p>{{ event.address }}</p>
        </div>
        <div class="ticket-footer">
          {{ wedding.bride.shortName }} & {{ wedding.groom.shortName }} · {{ wedding.date.year }}
        </div></template
      ><template v-else-if="design === 'cinema'"
        ><small class="scene-label"
          >SCENE {{ String(i + 1).padStart(2, '0') }} / THE CELEBRATION</small
        >
        <h3>{{ event.title }}</h3>
        <p class="cinematic-date">{{ date(event.date) }}</p>
        <p>{{ event.time }} {{ zone(event.timezone) }}</p>
        <div class="cinematic-venue">
          {{ event.venue }}
          <p>{{ event.address }}</p>
        </div></template
      ><template v-else
        ><span v-if="design === 'garden'" class="garden-signpost" aria-hidden="true"></span
        ><small v-if="design === 'letters'" class="letter-event-label">CORDIALLY INVITED TO</small
        ><span v-if="design === 'sakinah'" class="event-arch-symbol" aria-hidden="true">✧</span>
        <h3>{{ event.title }}</h3>
        <div class="event-detail">
          <CalendarDays :size="16" /><span>{{ date(event.date) }}</span>
        </div>
        <div class="event-detail">
          <Clock3 :size="16" /><span>{{ event.time }} {{ zone(event.timezone) }}</span>
        </div>
        <div class="event-venue">
          <MapPin :size="18" /><strong>{{ event.venue }}</strong
          ><span>{{ event.address }}</span>
        </div></template
      ><a
        v-if="event.maps"
        class="button button-outline"
        :href="event.maps"
        target="_blank"
        rel="noopener noreferrer"
        >Lihat Lokasi ↗</a
      >
    </article>
  </section>
</template>
<style>
.calendar-leaf {
  border-top: 5px solid currentColor;
  width: 90px;
  flex-shrink: 0;
  padding: 16px 0;
}
.calendar-leaf b {
  font:
    55px 'Cormorant Garamond',
    serif;
  display: block;
}
.calendar-leaf small {
  font-size: 9px;
  letter-spacing: 1px;
}
.calendar-event {
  min-width: 0;
}
.calendar-event h3 {
  margin-top: 0;
}
.design-pure .design-event .event-card {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
}
.calendar-event {
  flex: 1;
}
.calendar-event p,
.calendar-event strong {
  font-size: 12px;
  line-height: 1.9;
}
.ticket-stub {
  border-right: 1px dashed currentColor;
  padding-right: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}
.ticket-stub small {
  writing-mode: vertical-rl;
  font-size: 8px;
  letter-spacing: 2px;
}
.ticket-stub b {
  font:
    40px 'Cormorant Garamond',
    serif;
}
.ticket-stub span {
  font-size: 8px;
}
.ticket-body {
  min-width: 0;
  padding-left: 18px;
}
.ticket-body h3 {
  font-size: clamp(1.8rem, 7vw, 3rem);
}
.ticket-body p,
.ticket-body strong {
  font-size: 12px;
  line-height: 1.9;
}
.ticket-body small {
  font-size: 10px;
}
.ticket-footer {
  grid-column: 1/-1;
  border-top: 1px solid #b5976b66;
  padding-top: 15px;
  font-size: 9px;
  letter-spacing: 1px;
}
.design-noir .design-event .event-card,
.design-daydream .design-event .event-card {
  display: grid;
  grid-template-columns: 55px minmax(0, 1fr);
  gap: 15px;
  padding: 30px 20px;
}
.design-event .button {
  grid-column: 1/-1;
}
.scene-label {
  font-size: 9px;
  letter-spacing: 3px;
}
.cinematic-date {
  font:
    22px 'Cormorant Garamond',
    serif;
  letter-spacing: 2px;
  margin: 24px 0;
}
.cinematic-venue {
  margin: 25px 0;
  font-size: 16px;
}
.cinematic-venue p {
  font-size: 11px;
  margin-top: 12px;
}
.garden-signpost {
  position: absolute;
  bottom: -12px;
  left: 45%;
  width: 10%;
  height: 15px;
  background: #8ea373;
  z-index: -1;
}
.letter-event-label {
  letter-spacing: 3px;
  font-size: 9px;
}
.event-arch-symbol {
  font-size: 35px;
  color: #b99e65;
  display: block;
  margin-bottom: 20px;
}
</style>
