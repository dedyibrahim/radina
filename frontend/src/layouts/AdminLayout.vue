<script setup>
import RadinaLogo from '../components/RadinaLogo.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Heart,
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Settings,
  Music,
  KeyRound,
  Menu,
  LogOut,
  ArrowUpRight,
} from 'lucide-vue-next'
import BaseModal from '../components/BaseModal.vue'
import { useAuthStore } from '../stores/auth'
import { usePlatformStore } from '../stores/platform'
const auth = useAuthStore(),
  platform = usePlatformStore(),
  router = useRouter(),
  drawer = ref(false)
platform.load()
const links = [
  { path: '/admin', name: 'Overview', icon: LayoutDashboard },
  { path: '/admin/orders', name: 'Pesanan', icon: ShoppingBag },
  { path: '/admin/templates', name: 'Template', icon: Layers },
  { path: '/admin/music', name: 'Music Library', icon: Music },
  { path: '/admin/licenses', name: 'Lisensi', icon: KeyRound },
  { path: '/admin/settings', name: 'Pengaturan', icon: Settings },
]
async function logout() {
  await auth.logout()
  router.push('/admin/login')
}
</script>
<template>
  <div class="platform admin-platform">
    <aside class="admin-sidebar">
      <RouterLink to="/admin" class="brand"><RadinaLogo /></RouterLink>
      <p class="sidebar-eyebrow">WORKSPACE</p>
      <nav>
        <RouterLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          :exact-active-class="'selected'"
          ><component :is="link.icon" :size="18" />{{ link.name }}</RouterLink
        >
      </nav>
      <div class="sidebar-bottom">
        <RouterLink to="/" target="_blank"><ArrowUpRight :size="17" />Lihat Website</RouterLink
        ><button @click="logout"><LogOut :size="17" />Keluar</button>
      </div>
    </aside>
    <div class="admin-main">
      <header class="admin-header">
        <button class="icon-button mobile-menu" aria-label="Buka menu admin" @click="drawer = true">
          <Menu /></button
        ><span>YOUR LOVE STORIES, BEAUTIFULLY MANAGED</span>
        <div class="admin-user">
          <b>{{ auth.user?.name?.[0] }}</b
          ><span>{{ auth.user?.name }}</span>
        </div>
      </header>
      <main class="admin-content"><RouterView /></main>
    </div>
    <BaseModal :open="drawer" title="Menu admin" @close="drawer = false"
      ><nav class="admin-drawer">
        <h2>{{ platform.settings.company_name }}</h2>
        <RouterLink v-for="link in links" :key="link.path" :to="link.path" @click="drawer = false"
          ><component :is="link.icon" :size="20" />{{ link.name }}</RouterLink
        ><button class="p-button secondary" @click="logout"><LogOut :size="17" />Keluar</button>
      </nav></BaseModal
    >
  </div>
</template>
