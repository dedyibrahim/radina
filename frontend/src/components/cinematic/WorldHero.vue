<script setup>
import { inject, computed } from 'vue'
const wedding = inject('wedding')
const visual = inject('weddingVisual')
const kind = computed(() =>
  visual.config.value.sceneProfile.category === 'Kids & Birthday'
    ? 'adventure'
    : visual.config.value.sceneProfile.scene === 'golden-atelier'
      ? 'atelier'
      : 'garden',
)
</script>
<template>
  <section id="home" class="world-hero" :class="`world-hero--${kind}`">
    <template v-if="kind === 'atelier'">
      <div class="world-chapter">
        <span>01</span><small>{{ wedding.occasionLabel }}</small>
      </div>
      <h1>{{ wedding.displayName }}</h1>
      <figure v-if="wedding.hero">
        <img :src="wedding.hero" :alt="wedding.displayName" loading="lazy" />
      </figure>
      <div class="world-hero__letter">
        <time>{{ wedding.date.display }}</time>
        <p>{{ wedding.openingText }}</p>
      </div>
    </template>
    <template v-else-if="kind === 'adventure'">
      <p class="world-chapter">PETUALANGAN HARI BAHAGIA</p>
      <h1>{{ wedding.displayName }}</h1>
      <div class="world-hero__portrait">
        <figure v-if="wedding.hero || wedding.eventDetails.photo">
          <img
            :src="wedding.eventDetails.photo || wedding.hero"
            :alt="wedding.displayName"
            loading="lazy"
          />
        </figure>
        <span
          v-if="
            wedding.eventType === 'birthday' && wedding.eventDetails.honoree_age
          "
          class="world-age"
          ><b>{{ wedding.eventDetails.honoree_age }}</b
          >tahun</span
        >
      </div>
      <time>{{ wedding.date.display }}</time>
      <p>{{ wedding.openingText }}</p>
      <small v-if="wedding.eventDetails.host_name"
        >Salam hangat, {{ wedding.eventDetails.host_name }}</small
      >
    </template>
    <template v-else>
      <p class="world-chapter">{{ wedding.occasionLabel }}</p>
      <h1>{{ wedding.displayName }}</h1>
      <time>{{ wedding.date.display }}</time>
      <figure v-if="wedding.hero">
        <img :src="wedding.hero" :alt="wedding.displayName" loading="lazy" />
      </figure>
      <p class="world-hero__letter">{{ wedding.openingText }}</p>
    </template>
  </section>
</template>
