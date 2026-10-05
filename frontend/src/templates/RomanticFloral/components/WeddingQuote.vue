<script setup>
import FlowerMotion from './FlowerMotion.vue'
import TextWithLineBreaks from '../../../components/TextWithLineBreaks.vue'
import { inject } from 'vue'
const wedding = inject('wedding')
const design = inject('weddingDesign', 'amore')
const content = inject('sectionContent', null)
import BotanicalOrnament from './BotanicalOrnament.vue'
</script>
<template>
  <section id="quote" class="section quote-section">
    <FlowerMotion /><BotanicalOrnament class="quote-botanical" />
    <div data-reveal>
      <p
        v-if="design === 'sakinah' || wedding.quoteSource?.includes('QS.')"
        class="arabic"
        lang="ar"
        dir="rtl"
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
      <p class="eyebrow">{{ content?.heading || 'A PROMISE TO KEEP' }}</p>
      <p v-if="content?.subheading" class="section-subtitle">
        <TextWithLineBreaks :text="content.subheading" />
      </p>
      <blockquote>“<TextWithLineBreaks :text="wedding.quote" />”</blockquote>
      <p class="quote-source"><TextWithLineBreaks :text="wedding.quoteSource" /></p>
    </div>
  </section>
</template>
