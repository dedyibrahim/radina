<script setup>
import FloatingOrnament from './FloatingOrnament.vue'
defineProps({ name: String, variant: Number, plane: String })
</script>
<template>
  <FloatingOrnament
    class="living-flower"
    family="floral"
    :name="name"
    :variant="variant"
    :plane="plane"
  />
</template>
