<script setup>
import FlowerMotion from './FlowerMotion.vue'
import { CalendarPlus } from 'lucide-vue-next'
import { inject } from 'vue'
const wedding = inject('wedding')
const content = inject('sectionContent', null)
import { downloadCalendar } from '../utils/calendar'
import Countdown from './Countdown.vue'
import BotanicalOrnament from './BotanicalOrnament.vue'
</script>
<template>
  <section id="date" class="section date-section">
    <FlowerMotion /><BotanicalOrnament class="date-floral" />
    <div data-reveal>
      <p class="eyebrow">SAVE THE DATE</p>
      <h2>{{ content?.heading || 'A day to remember' }}</h2>
      <div class="big-date">
        <span>{{ wedding.date.day }}</span>
        <div>
          {{ wedding.date.month }}<br /><small>{{ wedding.date.year }}</small>
        </div>
      </div>
      <p class="date-intro">
        {{ content?.subheading || 'Menghitung hari menuju awal selamanya.' }}
      </p>
      <p v-if="content?.content" class="date-intro">{{ content.content }}</p>
      <Countdown :date="wedding.date.iso" /><button
        class="button button-outline"
        @click="downloadCalendar(wedding)"
      >
        <CalendarPlus :size="16" /> Simpan Tanggal
      </button>
    </div>
  </section>
</template>
