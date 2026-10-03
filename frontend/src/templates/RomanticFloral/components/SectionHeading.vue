<script setup>
import { inject } from 'vue'
const content = inject('sectionContent', null)
defineProps({ section: String, eyebrow: String, title: String, subtitle: String })
</script>
<template>
  <header class="section-heading" data-reveal>
    <p class="eyebrow">{{ eyebrow }}</p>
    <h2>{{ content?.heading || title }}</h2>
    <div class="tiny-divider"><span></span><i>✦</i><span></span></div>
    <p v-if="content?.subheading || subtitle" class="section-subtitle">
      {{ content?.subheading || subtitle }}
    </p>
    <p v-if="content?.content" class="section-subtitle">{{ content.content }}</p>
  </header>
</template>
