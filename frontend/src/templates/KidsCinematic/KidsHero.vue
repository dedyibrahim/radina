<script setup>
import { inject, computed } from 'vue'
import { Cake } from 'lucide-vue-next'
const wedding = inject('wedding')
const content = inject(
  'sectionContent',
  computed(() => ({})),
)
const birthday = computed(() => wedding.eventType === 'birthday')
</script>
<template>
  <section id="home" class="kids-hero">
    <p class="kids-kicker">{{ content.heading || wedding.occasionLabel }}</p>
    <h1>{{ wedding.displayName }}</h1>
    <div class="kids-hero__portrait">
      <figure
        v-if="wedding.eventDetails.photo || wedding.hero"
        class="kids-portrait"
      >
        <img
          :src="wedding.eventDetails.photo || wedding.hero"
          :alt="wedding.displayName"
          loading="lazy"
        />
      </figure>
      <div v-else class="kids-age-emblem">
        <Cake :size="34" /><b>{{ wedding.eventDetails.honoree_age || '✦' }}</b
        ><span>{{
          birthday ? 'tahun penuh cerita' : 'momen penuh cerita'
        }}</span>
      </div>
      <span
        v-if="
          birthday &&
          wedding.eventDetails.honoree_age &&
          (wedding.eventDetails.photo || wedding.hero)
        "
        class="kids-age-badge"
        >{{ wedding.eventDetails.honoree_age }} tahun</span
      >
    </div>
    <time>{{ wedding.date.display }}</time>
    <p class="kids-hero__letter">
      {{ content.content || wedding.openingText }}
    </p>
    <p v-if="content.subheading">{{ content.subheading }}</p>
    <small v-if="wedding.eventDetails.host_name"
      >Dengan penuh kebahagiaan,<br />{{
        wedding.eventDetails.host_name
      }}</small
    >
  </section>
</template>
