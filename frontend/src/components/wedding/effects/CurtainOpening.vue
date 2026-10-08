<script setup>
import FloatingOrnament from './FloatingOrnament.vue'
defineProps({ type: String })
</script>
<template>
  <div class="living-opening" :class="`opening-${type}`" aria-hidden="true">
    <i class="opening-panel panel-left">
      <FloatingOrnament
        v-if="type === 'floral-curtain'"
        family="floral"
        name="rose"
      />
      <FloatingOrnament
        v-if="type === 'garden-gate'"
        family="botanical"
        name="vine"
      />
    </i>
    <i class="opening-panel panel-right">
      <FloatingOrnament
        v-if="type === 'floral-curtain'"
        family="floral"
        name="rose"
      />
      <FloatingOrnament
        v-if="type === 'garden-gate'"
        family="botanical"
        name="vine"
      />
    </i>
    <i class="opening-light" />
  </div>
</template>
