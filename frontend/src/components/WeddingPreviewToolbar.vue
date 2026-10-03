<script setup>
import RadinaLogo from './RadinaLogo.vue'
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next'
defineProps({ wedding: Object, weddingId: [String, Number] })
defineEmits(['section'])
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
        :to="weddingId ? `/admin/weddings/${weddingId}` : `/templates/${wedding.template.slug}`"
        ><ArrowLeft :size="15" /><span>Kembali</span></RouterLink
      ><span>Pratinjau · {{ wedding.template.name }}</span
      ><RouterLink v-if="!weddingId" :to="`/order/${wedding.template.slug}`"
        >Pilih<ArrowUpRight :size="15"
      /></RouterLink>
    </div>
    <div v-if="weddingId" class="preview-controls">
      <button v-for="item in sections" :key="item[0]" @click="$emit('section', item[0])">
        {{ item[1] }}
      </button>
    </div>
  </header>
</template>
