<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { House, Heart, CalendarDays, Images, Gift, Ellipsis } from 'lucide-vue-next'
import { scrollToSection } from '../../../composables/useSectionNavigation'
const more = ref(false)
const wedding = inject('wedding')
const design = inject('weddingDesign', 'amore')
const items = computed(() =>
  [
    { id: 'home', label: 'Home', icon: House },
    {
      id: 'couple',
      label: wedding.isWedding ? 'Couple' : 'Profil',
      icon: Heart,
    },
    { id: 'event', label: 'Event', icon: CalendarDays },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'gift', label: 'Gift', icon: Gift },
  ].filter(
    (item) =>
      wedding.sections[item.id]?.enabled !== false &&
      (item.id === 'event'
        ? wedding.events.length
        : item.id === 'gallery'
          ? wedding.settings.enable_gallery && wedding.gallery.length
          : item.id === 'gift'
            ? wedding.settings.enable_gift && wedding.giftMethods.length
            : true),
  ),
)
function navigate(key) {
  active.value = key
  more.value = false
  scrollToSection(key)
}
const active = ref('home')
let observer, mutationObserver, frame
function updateActive() {
  let current = 'home'
  let closest = -Infinity
  items.value.forEach((item) => {
    const el = document.getElementById(item.id)
    const top = el?.getBoundingClientRect().top
    if (el && top <= window.innerHeight * 0.4 && top > closest) {
      current = item.id
      closest = top
    }
  })
  active.value = current
}
function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    updateActive()
    frame = null
  })
}
onMounted(() => {
  observer = new IntersectionObserver(updateActive, {
    rootMargin: '-10% 0px -55% 0px',
    threshold: 0,
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  const observeSections = () => {
    let found = 0
    items.value.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) {
        observer.observe(el)
        found++
      }
    })
    if (found === items.value.length) mutationObserver?.disconnect()
  }
  mutationObserver = new MutationObserver(observeSections)
  mutationObserver.observe(document.getElementById('invitation'), {
    childList: true,
    subtree: true,
  })
  observeSections()
})
onUnmounted(() => {
  observer?.disconnect()
  mutationObserver?.disconnect()
  window.removeEventListener('scroll', onScroll)
  if (frame) cancelAnimationFrame(frame)
})
</script>
<template>
  <nav class="floating-nav" aria-label="Navigasi undangan">
    <button
      v-for="item in items"
      :key="item.id"
      :aria-label="item.label"
      :class="{ active: active === item.id }"
      :aria-current="active === item.id ? 'location' : undefined"
      @click="navigate(item.id)"
    >
      <b v-if="['cinema', 'editorial', 'monochrome'].includes(design)" class="progress-number">{{
        String(items.indexOf(item) + 1).padStart(2, '0')
      }}</b
      ><span v-else-if="design === 'celestial'" class="orbit-marker" aria-hidden="true">{{
        ['☾', '✦', '◐', '✧', '○'][items.indexOf(item)]
      }}</span
      ><span v-else-if="design === 'blossom-east'" class="ink-marker" aria-hidden="true">●</span
      ><component v-else :is="item.icon" :size="18" /><span>{{ item.label }}</span>
    </button>
    <button aria-label="Section lainnya" :aria-expanded="more" @click="more = !more">
      <Ellipsis :size="18" /><span>More</span>
    </button>
    <div v-if="more" class="wedding-more-menu">
      <button
        v-if="
          wedding.settings.enable_story &&
          wedding.loveStory.length &&
          wedding.sections.story?.enabled !== false
        "
        @click="navigate('story')"
      >
        Story
      </button>
      <button
        v-if="wedding.settings.enable_rsvp && wedding.sections.rsvp?.enabled !== false"
        @click="navigate('rsvp')"
      >
        RSVP
      </button>
      <button
        v-if="wedding.settings.enable_wishes && wedding.sections.wishes?.enabled !== false"
        @click="navigate('wishes')"
      >
        Wishes
      </button>
    </div>
  </nav>
</template>
