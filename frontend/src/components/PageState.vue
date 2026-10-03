<script setup>
import RadinaLogo from './RadinaLogo.vue'
import { Heart, RefreshCw } from 'lucide-vue-next'
defineProps({ loading: Boolean, error: String, title: String })
defineEmits(['retry'])
</script>
<template>
  <div class="page-state" :aria-busy="loading">
    <template v-if="loading"
      ><RadinaLogo iconOnly />
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <p>Memuat cerita yang indah…</p></template
    ><template v-else
      ><Heart :size="32" />
      <h2>{{ title || 'Belum dapat ditampilkan' }}</h2>
      <p>{{ error }}</p>
      <button v-if="error" class="p-button secondary" @click="$emit('retry')">
        <RefreshCw :size="16" />Coba Lagi
      </button></template
    >
  </div>
</template>
