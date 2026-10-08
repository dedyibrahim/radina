<script setup>
import { provide } from 'vue'
import WeddingExperience from '../shared/WeddingExperience.vue'
import RoyalCouple from './RoyalCouple.vue'
import CelebrationHost from '../shared/CelebrationHost.vue'
import RoyalHero from './RoyalHero.vue'
import RoyalStory from './RoyalStory.vue'
import RoyalEvents from './RoyalEvents.vue'
import RoyalClosing from './RoyalClosing.vue'
import RoyalOpening from './RoyalOpening.vue'
import RoyalScene from './RoyalScene.vue'
import '../shared/experience-base.css'
import '../shared/theme-base.css'
import './royal-garden.css'
defineProps({ wedding: Object, preview: Boolean })
provide('weddingSceneComponent', RoyalScene)
</script>
<template>
  <div
    class="royal-garden"
    style="
      --ivory: #f6f0e4;
      --cream: #f6f0e4;
      --ink: #2c3028;
      --gold: #b9985a;
      --sage: #203c30;
      --muted: #76533d;
      --dusty-rose: #b9985a;
    "
  >
    <WeddingExperience
      :wedding="wedding"
      :preview="preview"
      theme="javanese-royal-garden"
      design="royal"
      :cover-component="RoyalOpening"
      :cinematic-cover-component="RoyalOpening"
      :hero-component="RoyalHero"
      :presentation-components="{
        couple:
          !wedding.event_type || wedding.event_type === 'wedding'
            ? RoyalCouple
            : CelebrationHost,
        story: RoyalStory,
        event: RoyalEvents,
        closing: RoyalClosing,
      }"
    />
  </div>
</template>
