<script setup>
import { computed, inject } from 'vue'
import { MailOpen } from 'lucide-vue-next'
import FloralCorners from './FloralCorners.vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding'),
  design = inject('floralDesign')
const initials = computed(() =>
  wedding.isWedding
    ? `${wedding.bride.shortName[0] || ''}${wedding.groom.shortName[0] || ''}`
    : (wedding.eventDetails.host_name || wedding.displayName || 'R').slice(
        0,
        2,
      ),
)
const photos = computed(() => {
  const items = [
    ...new Set(
      [wedding.cover, ...wedding.gallery.map((p) => p.src)].filter(Boolean),
    ),
  ].slice(0, 3)
  return items.length === 2 ? [...items, items[0]] : items
})
</script>
<template>
  <section
    class="design-cover floral-cover"
    :class="`floral-cover-${design.family}`"
    :data-layout="design.family"
  >
    <div class="floral-paper-texture" aria-hidden="true"></div>
    <div class="floral-cover-frame" aria-hidden="true"></div>
    <FloralCorners />
    <div
      v-if="design.family === 'cinema'"
      class="floral-cinema-image"
      aria-hidden="true"
    >
      <img
        v-if="wedding.cover"
        :src="wedding.cover"
        alt=""
        fetchpriority="high"
      />
    </div>
    <header class="floral-cover-header">
      <span class="floral-eyebrow">{{ wedding.occasionLabel }}</span>
      <span
        v-if="design.category === 'Islamic'"
        class="floral-bismillah"
        lang="ar"
        dir="rtl"
        >بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</span
      >
      <span v-else class="floral-small-script">A moment to remember</span>
    </header>
    <figure
      v-if="design.family !== 'cinema'"
      class="floral-cover-photo"
      :class="`photo-${design.family}`"
    >
      <template v-if="design.family === 'carousel' && photos.length">
        <img
          v-for="(src, i) in photos"
          :key="src + i"
          :src="src"
          :alt="i === 0 ? wedding.displayName : ''"
          :style="{ '--slide-index': i }"
          :class="{ 'single-slide': photos.length === 1 }"
        />
      </template>
      <img
        v-else-if="wedding.cover"
        :src="wedding.cover"
        :alt="wedding.displayName"
        fetchpriority="high"
      />
      <span v-else class="floral-monogram">{{ initials }}</span>
      <figcaption v-if="design.family === 'letter'">
        with love, {{ initials }}
      </figcaption>
      <span v-if="design.family === 'editorial'" class="floral-photo-caption"
        >THE ART OF TOGETHERNESS</span
      >
    </figure>
    <div class="floral-cover-names">
      <span class="floral-eyebrow">{{
        wedding.isWedding ? 'THE WEDDING OF' : 'ANDA DIUNDANG'
      }}</span>
      <h1>{{ wedding.displayName }}</h1>
      <div class="floral-name-divider" aria-hidden="true">
        <span></span>✦<span></span>
      </div>
      <time>{{ wedding.date.display || 'Tanggal akan diumumkan' }}</time>
    </div>
    <div class="floral-cover-footer">
      <div class="floral-guest">
        <small>Kepada Yth.</small
        ><strong>{{ guest || 'Bapak / Ibu / Saudara/i' }}</strong>
      </div>
      <button type="button" class="button floral-open" @click="$emit('open')">
        <MailOpen :size="16" />Buka Undangan
      </button>
      <p class="floral-cover-note">
        {{
          wedding.isWedding
            ? 'Kehadiran Anda melengkapi kebahagiaan kami.'
            : wedding.eventDetails.host_name
        }}
      </p>
    </div>
    <span class="floral-cover-signature" aria-hidden="true">{{
      design.name
    }}</span>
  </section>
</template>
