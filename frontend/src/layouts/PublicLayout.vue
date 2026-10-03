<script setup>
import RadinaLogo from '../components/RadinaLogo.vue'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, ArrowUpRight, Heart } from 'lucide-vue-next'
import { usePlatformStore } from '../stores/platform'
const platform = usePlatformStore(),
  menu = ref(false),
  route = useRoute()
onMounted(() => platform.load())
watch(
  () => route.fullPath,
  () => {
    menu.value = false
  },
)
</script>
<template>
  <div class="platform public-platform">
    <header class="public-header">
      <RouterLink to="/" class="brand"><RadinaLogo /></RouterLink>
      <nav class="public-nav" :class="{ 'nav-open': menu }" aria-label="Navigasi platform">
        <RouterLink to="/templates">Koleksi Template</RouterLink
        ><RouterLink to="/#how-it-works">Cara Pesan</RouterLink
        ><RouterLink to="/check-order">Cek Pesanan</RouterLink
        ><RouterLink to="/templates" class="p-button small"
          >Mulai Cerita Anda<ArrowUpRight :size="14"
        /></RouterLink>
      </nav>
      <button
        class="icon-button mobile-menu"
        :aria-expanded="menu"
        aria-label="Buka navigasi"
        @click="menu = !menu"
      >
        <X v-if="menu" /><Menu v-else />
      </button>
    </header>
    <div v-if="platform.error" class="platform-load-error" role="alert">
      {{ platform.error }} <button @click="platform.load()">Coba lagi</button>
    </div>
    <RouterView />
    <footer class="public-footer">
      <div class="brand">
        <RadinaLogo />
      </div>
      <p>{{ platform.settings.footer }}</p>
      <div>
        <RouterLink to="/templates">Template</RouterLink
        ><RouterLink to="/check-order">Cek Pesanan</RouterLink
        ><a v-if="platform.settings.email" :href="`mailto:${platform.settings.email}`"
          >Hubungi Kami</a
        ><RouterLink to="/admin/login">Admin</RouterLink>
      </div>
      <small
        >© {{ new Date().getFullYear() }} {{ platform.settings.company_name }}. Every love deserves
        a beautiful beginning.</small
      >
    </footer>
  </div>
</template>
