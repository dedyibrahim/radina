<script setup>
import { ref, inject, computed } from 'vue'
import { Play } from 'lucide-vue-next'
import FlowerMotion from './FlowerMotion.vue'
import SectionHeading from './SectionHeading.vue'
const wedding = inject('wedding'),
  loaded = ref(false)
const embed = computed(() => {
  try {
    const url = new URL(wedding.video.src)
    let id = ''
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname))
      id = url.searchParams.get('v') || url.pathname.split('/').at(-1)
    else if (url.hostname === 'youtu.be') id = url.pathname.slice(1)
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : ''
  } catch {
    return ''
  }
})
</script>
<template>
  <section id="video" class="section video-section">
    <FlowerMotion /><SectionHeading eyebrow="OUR STORY" title="Love, in motion" />
    <div class="video-frame" data-reveal>
      <iframe
        v-if="loaded && embed"
        :src="embed"
        title="Video prewedding"
        allow="fullscreen; picture-in-picture"
        allowfullscreen
        style="width: 100%; height: 100%; border: 0"
      ></iframe
      ><video
        v-else-if="loaded"
        controls
        playsinline
        preload="metadata"
        :poster="wedding.video.poster"
        :src="wedding.video.src"
        aria-label="Video cerita cinta"
      /><button
        v-else
        class="video-poster"
        aria-label="Muat video cerita cinta"
        @click="loaded = true"
      >
        <img
          v-if="wedding.video.poster"
          :src="wedding.video.poster"
          alt="Pratinjau video cerita cinta"
          loading="lazy"
        /><span><Play :size="22" fill="currentColor" /></span><small>PLAY OUR FILM</small>
      </button>
    </div>
  </section>
</template>
