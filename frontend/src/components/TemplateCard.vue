<script setup>
import { ArrowUpRight, Eye, Heart } from 'lucide-vue-next'
import { formatMoney } from '../services/api'
import { ref, computed } from 'vue'
import { useTemplateCollection } from '../composables/useTemplateCollection'
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
const eventQuery = computed(() =>
  props.eventType !== 'wedding' ? `?event_type=${props.eventType}` : '',
)
</script>
<template>
  <article class="template-card" @mouseenter="startPreview" @mouseleave="hovering = false">
    <RouterLink :to="`/templates/${template.slug}${eventQuery}`" class="template-image"
      ><img
        :src="template.thumbnail || template.preview_image"
        :alt="template.name"
        loading="lazy" /><span v-if="template.is_featured" class="featured-label"
        ><Heart :size="11" />FAVORITE</span
      >
      <div v-if="hovering" class="template-mini-preview" aria-hidden="true">
        <iframe
          :src="`/templates/${template.slug}/preview?mini=1${eventType !== 'wedding' ? `&event_type=${eventType}` : ''}`"
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
            :fill="favorites.includes(template.template_key) ? 'currentColor' : 'none'"
          />Favorit
        </button>
        <button
          :aria-pressed="comparison.some((t) => t.template_key === template.template_key)"
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
      <div class="template-card-price">
        {{ formatMoney(template.price) }} <span>/ undangan</span>
      </div>
      <div class="template-card-actions">
        <RouterLink
          :to="`/templates/${template.slug}/preview${eventQuery}`"
          class="p-button secondary"
          ><Eye :size="15" />Live Preview</RouterLink
        ><RouterLink :to="`/order/${template.slug}${eventQuery}`" class="p-button"
          >Gunakan Template</RouterLink
        >
      </div>
    </div>
  </article>
</template>
<style>
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
