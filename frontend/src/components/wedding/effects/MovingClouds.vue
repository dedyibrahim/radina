<script setup>
defineProps({ variant: { type: Number, default: 0 } })
</script>
<template>
  <div class="living-clouds" aria-hidden="true">
    <i
      v-for="plane in ['far', 'middle', 'near']"
      :key="plane"
      :class="`cloud-${plane}`"
      :style="{ '--cloud-phase': `${-variant * 7}s` }"
    />
  </div>
</template>
