<script setup>
import CelebrationInvitation from '../shared/CelebrationInvitation.vue'
defineProps({ wedding: Object, preview: Boolean })
</script>
<template>
  <CelebrationInvitation :wedding="wedding" :preview="preview" variant="nur-jannah" />
</template>
