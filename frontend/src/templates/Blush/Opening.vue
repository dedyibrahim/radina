<script setup>
import FlowerMotion from '../RomanticFloral/components/FlowerMotion.vue'
import { inject, computed } from 'vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
const design = 'daydream'
const nameStyle = computed(() => ({
  '--name-scale': `${Math.min(20, 115 / Math.max(wedding.bride.shortName.length, wedding.groom.shortName.length, 1))}vw`,
}))
</script>
<template>
  <section
    class="design-cover"
    :class="`cover-${design}`"
    :style="nameStyle"
    aria-label="Opening invitation"
  >
    <FlowerMotion />
    <span class="pastel-blob blob-one"></span><span class="pastel-blob blob-two"></span
    ><img v-if="wedding.cover" class="daydream-photo" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    <div class="cover-title">
      <small>WE'RE GETTING MARRIED!</small>
      <h1>{{ wedding.bride.shortName }}<i>&</i>{{ wedding.groom.shortName }}</h1>
    </div>
    <span class="doodle-heart" aria-hidden="true">♡</span>
    <div class="cover-invitation">
      <p class="cover-date">{{ wedding.date.display }}</p>
      <small>Kepada Yth. Bapak/Ibu/Saudara/i</small><strong class="cover-guest">{{ guest }}</strong
      ><button class="button" aria-label="Buka Undangan" @click="$emit('open')">
        {{
          design === 'letters'
            ? 'Open Letter'
            : design === 'cinema'
              ? 'Begin Our Story'
              : design === 'amore'
                ? 'Open Our Invitation'
                : 'Buka Undangan'
        }}
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  </section>
</template>
