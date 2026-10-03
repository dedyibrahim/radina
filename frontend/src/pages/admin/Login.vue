<script setup>
import RadinaLogo from '../../components/RadinaLogo.vue'
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, ArrowRight, LockKeyhole } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import { usePlatformStore } from '../../stores/platform'
const platform = usePlatformStore()
platform.load()
import { errorMessage } from '../../services/api'
import FormField from '../../components/FormField.vue'
const auth = useAuthStore(),
  route = useRoute(),
  router = useRouter(),
  form = reactive({ email: '', password: '' }),
  pending = ref(false),
  error = ref('')
async function login() {
  pending.value = true
  error.value = ''
  try {
    await auth.login(form)
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin')
        ? route.query.redirect
        : '/admin'
    router.push(redirect)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <main class="platform login-page">
    <div class="login-story">
      <Heart :size="30" />
      <p class="p-eyebrow">{{ platform.settings.company_name || 'Wedding' }} STUDIO</p>
      <h1>Behind every<br />beautiful invitation,<br /><em>there's a little care.</em></h1>
      <p>Your workspace for once-in-a-lifetime stories.</p>
    </div>
    <div class="login-panel">
      <RouterLink to="/" class="brand"><RadinaLogo /></RouterLink>
      <p class="p-eyebrow">WELCOME BACK</p>
      <h2>Ruang untuk<br />cerita yang indah.</h2>
      <p>Masuk untuk mengelola pesanan dan undangan.</p>
      <form @submit.prevent="login">
        <FormField v-model="form.email" label="Email admin" type="email" required /><FormField
          v-model="form.password"
          label="Kata sandi"
          type="password"
          required
        />
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <button class="p-button full-width" :disabled="pending">
          {{ pending ? 'Masuk…' : 'Masuk ke Workspace' }}<ArrowRight :size="17" />
        </button>
      </form>
      <small><LockKeyhole :size="13" />Akses khusus administrator.</small>
    </div>
  </main>
</template>
