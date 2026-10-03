<script setup>
import FlowerMotion from './FlowerMotion.vue'
import { Heart } from 'lucide-vue-next'
import { inject } from 'vue'
const wedding = inject('wedding')
import BotanicalOrnament from './BotanicalOrnament.vue'
</script>
<template>
  <section id="closing" class="closing-section">
    <FlowerMotion /><img
      class="closing-photo"
      v-if="wedding.closing"
      :src="wedding.closing"
      alt="Momen romantis pasangan pengantin"
      width="800"
      height="1200"
      loading="lazy"
    />
    <div class="closing-shade"></div>
    <BotanicalOrnament class="closing-floral" />
    <div class="closing-content" data-reveal>
      <p class="eyebrow">WITH LOVE & GRATITUDE</p>
      <Heart :size="23" class="closing-heart" />
      <p>{{ wedding.closingText }}</p>
      <p class="closing-pretitle">Kami yang berbahagia,</p>
      <h2>{{ wedding.bride.shortName }} <em>&</em> {{ wedding.groom.shortName }}</h2>
      <span class="closing-hashtag">{{ wedding.socialMedia.hashtag }}</span>
    </div>
    <footer>
      MADE WITH LOVE · {{ wedding.date.year }}<span>Thank you for being part of our story.</span>
    </footer>
  </section>
</template>
