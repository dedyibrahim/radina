<script setup>
import { inject, computed } from 'vue'
import { MailOpen } from 'lucide-vue-next'
import StudioArt from './StudioArt.vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding'),
  design = inject('studioDesign')
const initials = computed(() =>
  wedding.isWedding
    ? `${wedding.bride.shortName[0] || ''}${wedding.groom.shortName[0] || ''}`
    : (wedding.eventDetails.host_name || wedding.title || 'R').slice(0, 2),
)
</script>
<template>
  <section
    class="design-cover studio-cover"
    :class="[
      `cover-${design.family}`,
      `layout-${design.layout}`,
      { 'cover-with-photo': wedding.cover },
    ]"
  >
    <StudioArt />
    <div class="studio-frame" aria-hidden="true"></div>
    <header class="studio-cover-label">
      <span class="studio-kicker">ANDA DIUNDANG</span
      ><span class="studio-occasion">{{ wedding.occasionLabel }}</span>
    </header>
    <figure class="studio-cover-photo">
      <img
        v-if="wedding.cover"
        :src="wedding.cover"
        :alt="wedding.displayName"
        fetchpriority="high"
      /><span v-else class="studio-monogram">{{ initials }}</span
      ><span class="studio-photo-stamp" aria-hidden="true">{{ initials }}</span>
    </figure>
    <div class="studio-names">
      <span v-if="wedding.isWedding" class="studio-kicker">THE CELEBRATION OF</span>
      <h1>{{ wedding.displayName }}</h1>
      <span class="studio-name-rule" aria-hidden="true"></span>
    </div>
    <time class="studio-date">{{ wedding.date.display || 'Tanggal akan diumumkan' }}</time>
    <div class="studio-guest">
      <small>Kepada Yth.</small><strong>{{ guest || 'Bapak / Ibu / Saudara/i' }}</strong>
    </div>
    <button class="button studio-open" @click="$emit('open')">
      <MailOpen :size="17" />Buka Undangan
    </button>
    <p class="studio-cover-note">
      {{
        wedding.isWedding
          ? 'Kehadiran Anda melengkapi kebahagiaan kami.'
          : wedding.eventDetails.host_name
      }}
    </p>
    <span class="studio-edition" aria-hidden="true">{{ design.name }}</span>
  </section>
</template>
