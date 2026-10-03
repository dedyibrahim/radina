<script setup>
import RomanticFloral from './index.vue'
defineProps({ wedding: Object, preview: Boolean })
</script>
<template><RomanticFloral :wedding="wedding" :preview="preview" /></template>
