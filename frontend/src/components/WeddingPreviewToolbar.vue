<script setup>
import RadinaLogo from './RadinaLogo.vue'
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next'
defineProps({
  wedding: Object,
  weddingId: [String, Number],
  device: { type: String, default: 'desktop' },
  motion: { type: Boolean, default: true },
})
defineEmits(['section', 'device', 'motion'])
const sections = [
  ['cover', 'Preview Cover'],
  ['couple', 'Couple'],
  ['event', 'Event'],
  ['gallery', 'Gallery'],
  ['gift', 'Gift'],
  ['closing', 'Closing'],
]
</script>
<template>
  <header class="wedding-preview-tools">
    <div class="preview-banner platform">
      <RadinaLogo iconOnly /><RouterLink
        :to="
          weddingId
            ? `/admin/weddings/${weddingId}`
            : `/templates/${wedding.template.slug}${wedding.event_type !== 'wedding' ? `?event_type=${wedding.event_type}` : ''}`
        "
        ><ArrowLeft :size="15" /><span>Kembali</span></RouterLink
      ><span>Pratinjau · {{ wedding.template.name }}</span
      ><RouterLink
        v-if="!weddingId"
        :to="`/order/${wedding.template.slug}${wedding.event_type !== 'wedding' ? `?event_type=${wedding.event_type}` : ''}`"
        >Pilih<ArrowUpRight :size="15"
      /></RouterLink>
    </div>
    <div class="preview-controls">
      <div
        class="preview-device-controls"
        role="group"
        aria-label="Ukuran layar preview"
      >
        <button
          v-for="size in ['desktop', 'tablet', 'mobile']"
          :key="size"
          :aria-pressed="device === size"
          @click="$emit('device', size)"
        >
          {{
            {
              desktop: 'Desktop',
              tablet: 'Tablet',
              mobile: 'Mobile',
            }[size]
          }}
        </button>
      </div>
      <button
        v-for="item in weddingId ? sections : sections.slice(0, 1)"
        :key="item[0]"
        @click="$emit('section', item[0])"
      >
        {{
          item[0] === 'couple' && wedding.event_type !== 'wedding'
            ? 'Profil'
            : item[1]
        }}
      </button>
      <button :aria-pressed="motion" @click="$emit('motion', !motion)">
        {{ motion ? 'Animasi ON' : 'Animasi OFF' }}
      </button>
    </div>
  </header>
</template>
<style>
.preview-device-controls {
  display: flex;
  gap: 4px;
  padding-right: 12px;
  border-right: 1px solid currentColor;
}
.preview-device-controls button[aria-pressed='true'] {
  background: #e4ecd8;
  color: #445c36;
}
.wedding-preview-canvas {
  margin-inline: auto;
  width: 100%;
}
.wedding-preview-canvas.preview-device-mobile {
  max-width: 390px;
}
.wedding-preview-canvas.preview-device-tablet {
  max-width: 768px;
}
.admin-preview-frame {
  display: block;
  width: 100%;
  height: calc(100svh - 118px);
  min-height: 600px;
  border: 0;
}
.wedding-preview-canvas:is(.preview-device-mobile, .preview-device-tablet)
  .desktop-ambience {
  display: none;
}
.wedding-preview-canvas.preview-device-mobile .invitation-shell {
  max-width: 100%;
}
</style>
