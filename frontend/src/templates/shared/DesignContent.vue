<script setup>
import { computed, inject } from 'vue'
import DesignCouple from './DesignCouple.vue'
import DesignStory from './DesignStory.vue'
import DesignClosing from './DesignClosing.vue'
import SectionFrame from './SectionFrame.vue'
import WeddingQuote from '../RomanticFloral/components/WeddingQuote.vue'
import CountdownSection from '../RomanticFloral/components/CountdownSection.vue'
import EventSection from './DesignEvent.vue'
import GallerySection from '../RomanticFloral/components/GallerySection.vue'
import VideoSection from '../RomanticFloral/components/VideoSection.vue'
import LocationSection from '../RomanticFloral/components/LocationSection.vue'
import RSVPSection from '../RomanticFloral/components/RSVPSection.vue'
import WishesSection from '../RomanticFloral/components/WishesSection.vue'
import WeddingGift from '../RomanticFloral/components/WeddingGift.vue'
import LiveStreaming from '../RomanticFloral/components/LiveStreaming.vue'
import { useScrollAnimation } from '../../composables/useScrollAnimation'
const props = defineProps({
  design: String,
  guest: String,
  heroComponent: Object,
  presentationComponents: Object,
})
defineEmits(['toast'])
const wedding = inject('wedding')
const components = computed(() => ({
  home: props.heroComponent,
  couple: DesignCouple,
  story: DesignStory,
  closing: DesignClosing,
  quote: WeddingQuote,
  date: CountdownSection,
  event: EventSection,
  gallery: GallerySection,
  video: VideoSection,
  location: LocationSection,
  rsvp: RSVPSection,
  wishes: WishesSection,
  gift: WeddingGift,
  livestream: LiveStreaming,
  ...props.presentationComponents,
}))
const available = computed(() => ({
  home: true,
  couple: true,
  closing: true,
  quote: Boolean(wedding.quote),
  date: wedding.settings.enable_countdown && wedding.countdownDate.day,
  story: wedding.settings.enable_story && wedding.loveStory.length,
  event: wedding.events.length,
  gallery: wedding.settings.enable_gallery && wedding.gallery.length,
  video: wedding.settings.enable_video && wedding.video.enabled,
  location: wedding.settings.enable_maps && wedding.locations.length,
  rsvp: wedding.settings.enable_rsvp,
  wishes: wedding.settings.enable_wishes,
  gift: wedding.settings.enable_gift && wedding.giftMethods.length,
  livestream: wedding.settings.enable_livestream && wedding.livestream,
}))
const order = computed(() =>
  [...new Set(wedding.sectionOrder)].filter(
    (key) =>
      components.value[key] &&
      available.value[key] &&
      wedding.sections[key]?.enabled !== false &&
      !(
        key === 'couple' &&
        props.design === 'cinema' &&
        !wedding.customSectionOrder &&
        available.value.story &&
        wedding.sections.story?.enabled !== false
      ),
  ),
)
useScrollAnimation()
</script>
<template>
  <div class="invitation-content design-content">
    <SectionFrame
      v-for="key in order"
      :key="key"
      :section-key="key"
      :content="wedding.sections[key]"
      ><component
        :is="components[key]"
        :design="design"
        :guest="guest"
        @toast="$emit('toast', $event)"
    /></SectionFrame>
  </div>
</template>
