<script setup>
import primary from '../assets/brand/radina-logo.svg'
import white from '../assets/brand/radina-logo-white.svg'
import icon from '../assets/brand/radina-icon.svg'
defineProps({ light: Boolean, iconOnly: Boolean })
</script>
<template>
  <img
    :src="iconOnly ? icon : light ? white : primary"
    alt="Radina — Digital Wedding Invitation"
    class="radina-logo"
    :class="{ 'radina-icon': iconOnly }"
  />
</template>
