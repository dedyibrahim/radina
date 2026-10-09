<script setup>
import { computed, inject } from 'vue'
import { Gift, PartyPopper } from 'lucide-vue-next'
import KidsScene from './KidsScene.vue'
defineProps({ guest: String })
defineEmits(['open'])
const wedding = inject('wedding')
const visual = inject('weddingVisual')
const world = computed(() => visual.config.value.sceneProfile)
const birthday = computed(() => wedding.eventType === 'birthday')
const name = computed(() =>
  wedding.isWedding
    ? wedding.displayName
    : wedding.eventDetails.honoree_name || wedding.displayName,
)
const photo = computed(() =>
  birthday.value ? wedding.eventDetails.photo : wedding.cover,
)
</script>
<template>
  <section class="kids-opening" :data-kids-theme="world.kidsTheme">
    <KidsScene scene="opening" />
    <header class="kids-edition">
      <span>RADINA</span><i />{{ world.world }}
    </header>
    <div class="kids-opening__copy">
      <p class="kids-kicker">
        {{ birthday ? 'UNDANGAN ULANG TAHUN' : wedding.occasionLabel }}
      </p>
      <figure v-if="photo" class="kids-portrait">
        <img :src="photo" :alt="name" fetchpriority="high" />
      </figure>
      <div v-else class="kids-age-emblem kids-age-emblem--character">
        <img
          :src="`/images/cinematic/kids/character-${world.kidsTheme}-768.webp`"
          alt=""
          fetchpriority="high"
        />
        <span class="kids-age-emblem__number"
          ><Gift :size="14" /><b>{{
            birthday && wedding.eventDetails.honoree_age
              ? wedding.eventDetails.honoree_age
              : '✦'
          }}</b></span
        ><span>{{
          birthday && wedding.eventDetails.honoree_age
            ? 'tahun bahagia'
            : 'hari bahagia'
        }}</span>
      </div>
      <h1>{{ name }}</h1>
      <p
        v-if="photo && birthday && wedding.eventDetails.honoree_age"
        class="kids-age-caption"
      >
        Merayakan usia ke-{{ wedding.eventDetails.honoree_age }}
      </p>
      <time>{{ wedding.date.display || 'Tanggal akan diumumkan' }}</time>
      <p class="kids-opening__message">{{ wedding.openingText }}</p>
    </div>
    <div class="kids-guest-card">
      <span>Kepada Yth. Bapak/Ibu/Saudara/i</span>
      <strong>{{ guest || 'Tamu Undangan' }}</strong>
      <button class="kids-enter" type="button" @click="$emit('open')">
        <PartyPopper :size="18" />Buka Undangan
      </button>
    </div>
    <small class="kids-signature"
      >Mari ciptakan kenangan yang penuh senyum.</small
    >
  </section>
</template>
