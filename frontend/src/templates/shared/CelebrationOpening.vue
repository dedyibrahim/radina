<script setup>
import { inject, computed } from 'vue'
import { MailOpen } from 'lucide-vue-next'
const props = defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
const islamic = computed(
  () =>
    wedding.templateKey === 'sakinah' ||
    ['nur-jannah', 'mihrab-emerald', 'sahara-gold', 'qamar-blue', 'zahra-ivory'].includes(
      wedding.templateKey,
    ),
)
</script>
<template>
  <section class="design-cover celebration-opening">
    <div class="celebration-pattern" aria-hidden="true"></div>
    <div class="celebration-arch" aria-hidden="true"></div>
    <svg class="celebration-emblem" viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 5 61 28 85 15 72 39 95 50 72 61 85 85 61 72 50 95 39 72 15 85 28 61 5 50 28 39 15 15 39 28Z"
        fill="none"
        stroke="currentColor"
      />
      <circle cx="50" cy="50" r="13" fill="none" stroke="currentColor" />
    </svg>
    <p v-if="islamic" class="celebration-bismillah" lang="ar" dir="rtl">
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </p>
    <p v-else class="celebration-kicker">ANDA DIUNDANG</p>
    <p class="celebration-kicker">{{ wedding.occasionLabel }}</p>
    <h1>{{ wedding.displayName }}</h1>
    <div class="celebration-date">
      {{ wedding.date.display || 'Tanggal akan diumumkan' }}
    </div>
    <div class="celebration-guest">
      <small>Kepada Yth.</small><strong>{{ guest || 'Bapak / Ibu / Saudara/i' }}</strong>
    </div>
    <button class="button open-button" @click="$emit('open')">
      <MailOpen :size="17" />Buka Undangan
    </button>
    <p class="celebration-signature">
      {{
        wedding.isWedding
          ? 'Dengan penuh syukur, kami mengundang Anda.'
          : wedding.eventDetails.host_name
      }}
    </p>
  </section>
</template>
