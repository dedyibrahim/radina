<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next'
import { api, errorMessage } from '../../services/api'
import { useSeo } from '../../composables/useSeo'
import GuestQr from '../../components/GuestQr.vue'
import BaseModal from '../../components/BaseModal.vue'
import WeddingRenderer from '../../components/WeddingRenderer.vue'
import PageState from '../../components/PageState.vue'
import WeddingPreviewToolbar from '../../components/WeddingPreviewToolbar.vue'
import { nextTick } from 'vue'
import { scrollToSection } from '../../composables/useSectionNavigation'
import { trackEvent } from '../../services/analytics'
const renderer = ref(null)
const previewDevice = ref('desktop')
const previewFrame = ref(null)
const previewMotion = ref(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const embeddedPreview = computed(
  () => Boolean(route.meta.preview) && (route.query.preview_embed === '1' || route.query.mini === '1'),
)
const previewFrameUrl = computed(() => `${route.path}?${new URLSearchParams({ ...route.query, preview_embed: '1' })}`)
function setPreviewMotion(enabled) {
  previewMotion.value = enabled
  if (route.meta.preview && !embeddedPreview.value) {
    previewFrame.value?.contentWindow?.postMessage({ type: 'radina-admin-preview', motion: enabled }, window.location.origin)
  } else renderer.value?.setMotion(enabled)
}
function previewMessage(event) {
  if (
    !embeddedPreview.value ||
    event.source !== window.parent ||
    event.origin !== window.location.origin ||
    event.data?.type !== 'radina-admin-preview'
  )
    return
  if (typeof event.data.motion === 'boolean') {
    setPreviewMotion(event.data.motion)
    return
  }
  if (
    ['cover', 'couple', 'event', 'gallery', 'gift', 'closing'].includes(
      event.data.section,
    )
  )
    previewSection(event.data.section)
}
onMounted(() => window.addEventListener('message', previewMessage))
onUnmounted(() => window.removeEventListener('message', previewMessage))
async function previewSection(key) {
  if (route.meta.preview && !embeddedPreview.value) {
    previewFrame.value?.contentWindow?.postMessage(
      { type: 'radina-admin-preview', section: key },
      window.location.origin,
    )
    return
  }
  if (key === 'cover') {
    renderer.value?.showCover()
    window.scrollTo({ top: 0 })
    return
  }
  renderer.value?.showInvitation()
  await nextTick()
  setTimeout(() => scrollToSection(key), 400)
}
const route = useRoute(),
  wedding = ref(null),
  loading = ref(true),
  error = ref('')
const pass = ref(null),
  showQr = ref(false)
let visitorId, openedSlug, viewReady
try {
  visitorId = localStorage.getItem('radina-visitor')
  if (!/^[0-9a-f-]{36}$/i.test(visitorId || '')) {
    visitorId = crypto.randomUUID()
    localStorage.setItem('radina-visitor', visitorId)
  }
} catch {
  visitorId = crypto.randomUUID()
}
async function record(action) {
  const current = wedding.value
  if (!current || route.meta.preview || current.is_demo) return
  if (action === 'open') {
    if (openedSlug === current.slug) return
    openedSlug = current.slug
    await viewReady
  }
  try {
    await api.post(`/weddings/${current.slug}/visits`, {
      visitor_id: visitorId,
      guest_token:
        wedding.value?.guest?.token || route.query.guest || undefined,
      action,
    })
  } catch {}
}
async function load() {
  loading.value = true
  error.value = ''
  wedding.value = null
  pass.value = null
  openedSlug = null
  try {
    const path = route.params.id
      ? `/admin/weddings/${route.params.id}/preview`
      : route.meta.preview
        ? `/templates/${route.params.slug}/preview`
        : route.params.code
          ? `/invitations/${route.params.code}`
          : `/weddings/${route.params.slug}`
    wedding.value = (
      await api.get(path, {
        params:
          route.meta.preview && !route.params.id
            ? { event_type: route.query.event_type || undefined }
            : {},
      })
    ).data.data
    if (route.meta.preview && !route.params.id) {
      trackEvent('preview_template', {
        template_key: wedding.value.template.template_key,
        event_type: wedding.value.event_type,
      })
    }
    if (!route.meta.preview && !wedding.value.is_demo) {
      viewReady = record('view')
      const guestToken = wedding.value.guest?.token || route.query.guest
      if (guestToken) {
        try {
          const found = (await api.get(`/guest-passes/${guestToken}`)).data.data
          if (found.wedding_slug === wedding.value.slug) pass.value = found
        } catch {}
      }
    }
  } catch (e) {
    error.value =
      e.response?.status === 404
        ? 'Undangan belum dipublish atau tautannya tidak ditemukan.'
        : errorMessage(e)
  } finally {
    loading.value = false
  }
}
watch(
  () =>
    [
      route.params.id || '',
      route.params.slug || '',
      route.params.code || '',
      Boolean(route.meta.preview),
      route.query.event_type || 'wedding',
      route.query.guest || '',
    ].join(':'),
  load,
  { immediate: true },
)
useSeo(() => ({
  title: wedding.value?.title || 'Undangan Digital',
  description: `${wedding.value?.wedding_date || ''} — ${wedding.value?.opening_text || 'Anda diundang untuk menghadiri acara kami.'}`,
  image: wedding.value?.cover_image,
}))
</script>
<template>
  <div>
    <WeddingPreviewToolbar
      v-if="
        !embeddedPreview && (route.meta.preview || wedding?.is_demo) && wedding
      "
      :wedding="wedding"
      :wedding-id="route.params.id"
      :device="previewDevice"
      :motion="previewMotion"
      @motion="setPreviewMotion"
      @section="previewSection"
      @device="previewDevice = $event"
    />
    <div v-if="loading || error" class="platform wedding-state">
      <PageState
        :loading="loading"
        :error="error"
        title="Undangan belum tersedia"
        @retry="load"
      /><RouterLink v-if="error" to="/" class="p-button secondary"
        >Ke Beranda</RouterLink
      >
    </div>
    <button v-if="pass" class="guest-qr-bubble" @click="showQr = true">
      QR Kehadiran
    </button>
    <BaseModal :open="showQr" title="QR Kehadiran" @close="showQr = false"
      ><div v-if="pass" class="platform">
        <h2>{{ pass.name }}</h2>
        <GuestQr :url="pass.pass_url" :name="pass.name" /></div
    ></BaseModal>
    <div
      class="wedding-preview-canvas"
      :class="
        route.meta.preview && !embeddedPreview
          ? `preview-device-${previewDevice}`
          : ''
      "
    >
      <iframe
        v-if="
          route.meta.preview && !embeddedPreview && wedding && !loading && !error
        "
        ref="previewFrame"
        :src="previewFrameUrl"
        title="Pratinjau undangan"
        class="admin-preview-frame"
      />
      <WeddingRenderer
        v-if="
          (!route.meta.preview || embeddedPreview) && wedding && !loading && !error
        "
        :key="`${wedding.slug}:${wedding.guest?.token || route.query.guest || ''}`"
        ref="renderer"
        :start-open="Boolean(route.params.id)"
        :wedding="wedding"
        :preview="Boolean(route.meta.preview || wedding.is_demo)"
        @opened="record('open')"
      />
    </div>
  </div>
</template>
<style scoped>
.guest-qr-bubble {
  position: fixed;
  z-index: 70;
  top: 18px;
  right: 18px;
  padding: 12px 18px;
  border-radius: 30px;
  border: 1px solid #d7e2cb;
  background: #fffef6;
  color: #526949;
  font: 600 13px sans-serif;
  box-shadow: 0 4px 18px #0001;
}
</style>
