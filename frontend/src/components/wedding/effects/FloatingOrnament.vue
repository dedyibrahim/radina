<script setup>
import { computed } from 'vue'
import { ornamentAsset } from './ornamentLibrary'
const props = defineProps({
  family: String,
  name: String,
  plane: { type: String, default: 'middle' },
  variant: { type: Number, default: 0 },
})
const style = computed(() => ({
  '--ornament-mask': `url("${ornamentAsset(props.family, props.name)}")`,
  '--ornament-phase': `${-props.variant * 2.3}s`,
  '--ornament-turn': `${props.variant % 2 ? -12 : 8}deg`,
}))
</script>
<template>
  <div
    class="visual-ornament"
    :class="`ornament-${plane}`"
    :style="style"
    :data-plane="plane"
    :data-ornament="`${family}/${name}`"
    :data-parallax="
      plane === 'foreground' ? 1.15 : plane === 'middle' ? 0.35 : 0.15
    "
    aria-hidden="true"
  >
    <span />
  </div>
</template>
