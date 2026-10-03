<script setup>
import { inject, computed } from 'vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
const design = 'cinema'
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
    <img v-if="wedding.cover" class="cover-photo" :src="wedding.cover" alt="Foto pasangan" fetchpriority="high" />
    <div v-if="design === 'garden'" class="garden-arch" aria-hidden="true">❧</div>
    <div v-if="design === 'amore'" class="floral-corner" aria-hidden="true">✿<span>❧</span></div>
    <div class="cover-title">
      <small>{{ design === 'cinema' ? 'EVERY STORY HAS A BEGINNING' : 'THE WEDDING OF' }}</small>
      <h1>{{ wedding.bride.shortName }}<i>&</i>{{ wedding.groom.shortName }}</h1>
      <p v-if="design === 'cinema'">This is ours.</p>
    </div>
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
