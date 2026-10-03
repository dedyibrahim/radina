<script setup>
import { useTemplateCollection } from '../composables/useTemplateCollection'
import { formatMoney } from '../services/api'
import BaseModal from './BaseModal.vue'
defineProps({ open: Boolean })
defineEmits(['close'])
const { comparison, compare } = useTemplateCollection()
</script>
<template>
  <BaseModal :open="open" wide title="Bandingkan desain pilihan Anda" @close="$emit('close')">
    <p>Temukan komposisi yang paling dekat dengan cerita Anda.</p>
    <div class="comparison-grid">
      <article v-for="template in comparison" :key="template.template_key">
        <img :src="template.thumbnail" :alt="template.name" loading="lazy" />
        <h3>{{ template.name }}</h3>
        <dl>
          <dt>Style</dt>
          <dd>{{ template.style || template.category?.name }}</dd>
          <dt>Fitur</dt>
          <dd>{{ template.features.join(' · ') }}</dd>
          <dt>Music style</dt>
          <dd>{{ template.music_style?.join(' / ') }}</dd>
          <dt>Gallery style</dt>
          <dd>{{ template.gallery_style }}</dd>
          <dt>Harga</dt>
          <dd>{{ formatMoney(template.price) }}</dd>
        </dl>
        <RouterLink class="p-button secondary" :to="`/templates/${template.slug}/preview`"
          >Live Preview ↗</RouterLink
        >
        <button class="p-button secondary" @click="compare(template)">Hapus pilihan</button>
      </article>
    </div>
  </BaseModal>
</template>
<style>
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
  gap: 22px;
  margin-top: 22px;
}
.comparison-grid article {
  min-width: 0;
  border-top: 1px solid #d7a98c;
  padding-top: 15px;
}
.comparison-grid img {
  width: 100%;
  aspect-ratio: 9/12;
  object-fit: cover;
  object-position: top;
  border-radius: 10px;
}
.comparison-grid h3 {
  font-size: 27px;
  margin: 15px 0;
}
.comparison-grid dt {
  font-size: 11px;
  font-weight: 700;
  margin-top: 15px;
}
.comparison-grid dd {
  font-size: 12px;
  margin: 5px 0 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.comparison-grid .p-button {
  display: flex;
  margin-top: 10px;
}
</style>
