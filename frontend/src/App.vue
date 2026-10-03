<script setup>
import { useUiStore } from './stores/ui'
import BaseToast from './components/BaseToast.vue'
const ui = useUiStore()
</script>
<template><RouterView /><BaseToast :message="ui.message" /></template>
