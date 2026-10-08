<script setup>
import RoyalScene from './RoyalScene.vue'
defineProps({ scene: String })
</script>
<template>
  <article class="royal-slide" :data-royal-slide="scene">
    <RoyalScene :scene="scene" />
    <div class="royal-slide__content"><slot /></div>
  </article>
</template>
