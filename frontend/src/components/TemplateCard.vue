<script setup>
import { ArrowUpRight, Eye, Heart } from 'lucide-vue-next'
import { formatMoney } from '../services/api'
import { ref, computed } from 'vue'
import { useTemplateCollection } from '../composables/useTemplateCollection'
import floral from '../../../config/floral-collection.json'
import cinematicWorlds from '../../../config/cinematic-worlds.json'
const { favorites, comparison, favorite, compare } = useTemplateCollection()
const hovering = ref(false)
const previewScale = ref(0.8)
function startPreview(event) {
  if (!window.matchMedia('(hover: hover)').matches) return
  previewScale.value = event.currentTarget.clientWidth / 390
  hovering.value = true
}
const props = defineProps({
  template: Object,
  eventType: { type: String, default: 'wedding' },
})
const targetEventType = computed(() =>
  props.eventType === 'wedding' &&
  cinematicWorlds[props.template.template_key]?.category === 'Kids & Birthday'
    ? 'birthday'
    : props.eventType,
)
const eventQuery = computed(() =>
  targetEventType.value !== 'wedding'
    ? `?event_type=${targetEventType.value}`
    : '',
)
</script>
<template>
  <article
    class="template-card"
    @mouseenter="startPreview"
    @mouseleave="hovering = false"
  >
    <RouterLink
      :to="`/templates/${template.slug}${eventQuery}`"
      class="template-image"
      ><img
        :src="template.thumbnail || template.preview_image"
        :alt="template.name"
        loading="lazy" /><span
        v-if="template.is_featured"
        class="featured-label"
        ><Heart :size="11" />FAVORITE</span
      >
      <span v-if="floral[template.template_key]" class="new-floral-label"
        >BARU</span
      >
      <span
        v-else-if="cinematicWorlds[template.template_key]"
        class="world-template-label"
        >{{
          cinematicWorlds[template.template_key].category === 'Regional'
            ? 'NUSANTARA'
            : 'KIDS & BIRTHDAY'
        }}</span
      >
      <div v-if="hovering" class="template-mini-preview" aria-hidden="true">
        <iframe
          :src="`/templates/${template.slug}/preview?mini=1${targetEventType !== 'wedding' ? `&event_type=${targetEventType}` : ''}`"
          :style="{ transform: `scale(${previewScale})` }"
          title="Mini template preview"
          tabindex="-1"
          loading="lazy"
        ></iframe></div
    ></RouterLink>
    <div class="template-card-body">
      <div class="collection-actions">
        <button
          :aria-label="`Favorit ${template.name}`"
          :aria-pressed="favorites.includes(template.template_key)"
          @click="favorite(template.template_key)"
        >
          <Heart
            :size="17"
            :fill="
              favorites.includes(template.template_key)
                ? 'currentColor'
                : 'none'
            "
          />Favorit
        </button>
        <button
          :aria-pressed="
            comparison.some((t) => t.template_key === template.template_key)
          "
          @click="compare(template)"
        >
          {{
            comparison.some((t) => t.template_key === template.template_key)
              ? '✓ Dipilih'
              : '+ Bandingkan'
          }}
        </button>
      </div>
      <div class="template-card-head">
        <h3>{{ template.name }}</h3>
        <ArrowUpRight :size="18" />
      </div>
      <p>{{ template.style || template.category?.name }} · Mobile-first</p>
      <p class="template-description">{{ template.description }}</p>
      <p
        v-if="template.animations?.labels?.length"
        class="template-motion-label"
      >
        {{ template.animations.labels.join(' · ') }}
      </p>
      <div class="template-card-price">
        {{ formatMoney(template.price) }} <span>/ undangan</span>
      </div>
      <div class="template-card-actions">
        <RouterLink
          :to="`/templates/${template.slug}/preview${eventQuery}`"
          class="p-button secondary"
          ><Eye :size="15" />Live Preview</RouterLink
        ><RouterLink
          :to="`/order/${template.slug}${eventQuery}`"
          class="p-button"
          >Gunakan Template</RouterLink
        >
      </div>
    </div>
  </article>
</template>
<style>
.new-floral-label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 2;
  background: #fffaf0;
  color: #694735;
  border: 1px solid #d9c5a0;
  border-radius: 20px;
  padding: 7px 12px;
  font-size: 10px;
  letter-spacing: 1.5px;
}
.world-template-label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 2;
  padding: 7px 12px;
  border: 1px solid #ffffff80;
  border-radius: 999px;
  background: #172e3bd9;
  color: #fff8e8;
  font-size: 9px;
  letter-spacing: 1.3px;
}
.collection-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.collection-actions button {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  font-size: 11px;
  color: #6d4036;
  padding: 6px;
}
.collection-actions button[aria-pressed='true'] {
  font-weight: 700;
}
.template-mini-preview {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: #fff9f5;
}
.template-mini-preview iframe {
  width: 390px;
  height: 900px;
  border: 0;
  transform: scale(0.82);
  transform-origin: top left;
}
.template-description {
  font-size: 11px !important;
  line-height: 1.7;
  min-height: 38px;
}
.template-image-title {
  font-size: clamp(1.8rem, 4vw, 2.4rem) !important;
}
@media (hover: none) {
  .template-mini-preview {
    display: none;
  }
}
</style>
