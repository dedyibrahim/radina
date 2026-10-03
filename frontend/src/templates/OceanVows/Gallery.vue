<script setup>
import GalleryController from '../shared/GalleryController.vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
</script>
<template>
  <section id="gallery" class="section new-gallery">
    <SectionHeading title="Collected moments" /><GalleryController v-slot="{ photos, open }"
      ><div class="collection-gallery coastal-photo-reel">
        <figure v-for="(photo, i) in photos" :key="i">
          <button :aria-label="`Perbesar foto: ${photo.alt}`" @click="open(i)">
            <img :src="photo.src" :alt="photo.alt" loading="lazy" decoding="async" /><span
              aria-hidden="true"
              >↗</span
            >
          </button>
          <figcaption>{{ photo.alt }}</figcaption>
        </figure>
      </div></GalleryController
    >
  </section>
</template>
