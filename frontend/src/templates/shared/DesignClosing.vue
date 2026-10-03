<script setup>
import FlowerMotion from '../RomanticFloral/components/FlowerMotion.vue'
import { inject } from 'vue'
defineProps({ design: String })
const wedding = inject('wedding')
</script>
<template>
  <section id="closing" class="design-closing" :class="`closing-${design}`">
    <FlowerMotion v-if="['amore', 'garden', 'daydream'].includes(design)" />
    <img
      v-if="!['noir', 'pure', 'nusantara', 'letters'].includes(design) && wedding.closing"
      :src="wedding.closing"
      alt="Pasangan pengantin"
      loading="lazy"
    />
    <div class="closing-letter">
      <small>{{
        wedding.sections?.closing?.heading ||
        (design === 'cinema'
          ? 'A FILM ABOUT'
          : design === 'letters'
            ? 'WITH LOVE,'
            : design === 'sakinah'
              ? 'SEMOGA ALLAH MEMBERKAHI LANGKAH KITA'
              : 'WITH LOVE & GRATITUDE')
      }}</small>
      <p v-if="wedding.sections?.closing?.subheading">{{ wedding.sections.closing.subheading }}</p>
      <div v-if="design === 'noir' || design === 'nusantara'" class="closing-monogram">
        {{ wedding.bride.shortName[0] }}<i>&</i>{{ wedding.groom.shortName[0] }}
      </div>
      <p>{{ wedding.sections?.closing?.content || wedding.closingText }}</p>
      <h2>{{ wedding.bride.shortName }} <i>&</i> {{ wedding.groom.shortName }}</h2>
      <p>{{ wedding.date.display }}</p>
      <small>{{ wedding.socialMedia.hashtag }}</small>
      <footer>RADINA · DIGITAL WEDDING INVITATION</footer>
    </div>
  </section>
</template>
