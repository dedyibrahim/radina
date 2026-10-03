<script setup>
import { useCountdown } from '../../../composables/useCountdown'
const props = defineProps({ date: String })
const { parts, remaining } = useCountdown(() => props.date)
</script>
<template>
  <div class="countdown" role="timer" aria-label="Hitung mundur menuju hari pernikahan">
    <div v-for="part in parts" :key="part.label">
      <span>{{ String(part.value).padStart(2, '0') }}</span>
      <p>{{ part.label }}</p>
    </div>
  </div>
  <p v-if="remaining === 0" class="countdown-message">
    Hari bahagia kami telah tiba. Terima kasih atas doa Anda.
  </p>
</template>
