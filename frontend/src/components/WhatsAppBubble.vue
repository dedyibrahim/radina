<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MessageCircle } from 'lucide-vue-next'
import { usePlatformStore } from '../stores/platform'
import { whatsappLink } from '../services/whatsapp'
const platform = usePlatformStore(), route = useRoute()
const link = computed(() => whatsappLink(platform.settings.whatsapp_number,
  route.path.startsWith('/buket')
    ? 'Halo Radina, saya ingin pesan buket custom. Bisa bantu informasinya?'
    : 'Halo Radina, saya ingin bertanya tentang undangan wedding dan layanan Radina.'))
</script>
<template>
  <a :href="link" target="_blank" rel="noopener noreferrer" class="whatsapp-bubble" aria-label="Hubungi Radina melalui WhatsApp">
    <span class="whatsapp-bubble-label">Chat WhatsApp</span>
    <span class="whatsapp-bubble-icon"><MessageCircle :size="27" /></span>
  </a>
</template>
<style scoped>
.whatsapp-bubble {
  position: fixed;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 35;
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.whatsapp-bubble-label {
  color: #284933;
  background: #fffef9;
  border: 1px solid #d9dfce;
  border-radius: 20px;
  padding: 9px 14px;
  box-shadow: 0 3px 15px #264a3020;
  font-size: 12px;
}
.whatsapp-bubble-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  background: #207a4b;
  color: white;
  border-radius: 50%;
  box-shadow: 0 5px 20px #264a3040;
}
.whatsapp-bubble:hover .whatsapp-bubble-icon { background: #17623b; }
.whatsapp-bubble:focus-visible { outline: 3px solid #207a4b; outline-offset: 5px; border-radius: 28px; }
@media (max-width: 600px) {
  .whatsapp-bubble { right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); }
  .whatsapp-bubble-label { display: none; }
}
</style>
