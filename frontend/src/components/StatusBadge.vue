<script setup>
import { statusLabels } from '../services/api'
defineProps({ status: String })
</script>
<template>
  <span class="status-badge" :class="`status-${status?.toLowerCase()}`">{{
    statusLabels[status] || status
  }}</span>
</template>
