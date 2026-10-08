<script setup>
import FloatingOrnament from './FloatingOrnament.vue'
defineProps({ family: String, name: String, variant: Number, plane: String })
</script>
<template>
  <FloatingOrnament
    class="living-plant"
    :family="family"
    :name="name"
    :variant="variant"
    :plane="plane"
  />
</template>
