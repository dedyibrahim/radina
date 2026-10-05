<script setup>
import HeroSection from './HeroSection.vue'
import WeddingQuote from './WeddingQuote.vue'
import CoupleSection from './CoupleSection.vue'
import CountdownSection from './CountdownSection.vue'
import LoveStory from './LoveStory.vue'
import EventSection from './EventSection.vue'
import GallerySection from './GallerySection.vue'
import VideoSection from './VideoSection.vue'
import LocationSection from './LocationSection.vue'
import RSVPSection from './RSVPSection.vue'
import WishesSection from './WishesSection.vue'
import WeddingGift from './WeddingGift.vue'
import LiveStreaming from './LiveStreaming.vue'
import ClosingSection from './ClosingSection.vue'
import { useScrollAnimation } from '../../../composables/useScrollAnimation'
import { inject } from 'vue'
const wedding = inject('wedding')
defineProps({ guest: String })
defineEmits(['toast'])
useScrollAnimation()
</script>
<template>
  <div class="invitation-content">
    <HeroSection /><WeddingQuote v-if="wedding.quote" /><CoupleSection />
    <CountdownSection v-if="wedding.settings.enable_countdown && wedding.date.day" />
    <LoveStory v-if="wedding.settings.enable_story && wedding.loveStory.length" />
    <EventSection v-if="wedding.events.length" />
    <GallerySection v-if="wedding.settings.enable_gallery && wedding.gallery.length" />
    <VideoSection v-if="wedding.settings.enable_video && wedding.video.enabled" />
    <LocationSection v-if="wedding.settings.enable_maps && wedding.locations.length" />
    <RSVPSection v-if="wedding.settings.enable_rsvp" :guest="guest" />
    <WishesSection v-if="wedding.settings.enable_wishes" :guest="guest" />
    <WeddingGift
      v-if="wedding.settings.enable_gift && wedding.giftMethods.length"
      @toast="$emit('toast', $event)"
    />
    <LiveStreaming v-if="wedding.settings.enable_livestream && wedding.livestream" />
    <ClosingSection />
  </div>
</template>
