<script setup>
import { computed, inject } from 'vue'
defineProps({ compact: Boolean })
const wedding = inject('wedding')
const letters = computed(() =>
  wedding.isWedding
    ? [wedding.bride.shortName, wedding.groom.shortName]
        .filter(Boolean)
        .map((name) => Array.from(name.trim())[0])
    : [
        Array.from(
          (wedding.eventDetails.host_name || wedding.displayName || '').trim(),
        )[0],
      ].filter(Boolean),
)
</script>
<template>
  <span
    v-if="letters.length"
    class="visual-monogram"
    :class="{ 'monogram-compact': compact }"
    aria-hidden="true"
    ><template v-for="(letter, i) in letters" :key="i"
      ><em v-if="i">&amp;</em><span>{{ letter }}</span></template
    ></span
  >
</template>
