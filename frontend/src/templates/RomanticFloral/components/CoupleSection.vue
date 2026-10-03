<script setup>
import FlowerMotion from './FlowerMotion.vue'
import { Instagram } from 'lucide-vue-next'
import { inject } from 'vue'
const wedding = inject('wedding')
import SectionHeading from './SectionHeading.vue'
import BotanicalOrnament from './BotanicalOrnament.vue'
</script>
<template>
  <section id="couple" class="section couple-section">
    <FlowerMotion /><SectionHeading
      eyebrow="THE BRIDE & GROOM"
      title="Two souls, one love"
      :subtitle="wedding.openingText"
    />
    <div class="couple-grid">
      <article
        v-for="(person, i) in [wedding.bride, wedding.groom]"
        :key="person.name"
        class="person"
        data-reveal
      >
        <div class="portrait-wrap">
          <img
            v-if="person.photo"
            :src="person.photo"
            :alt="person.name"
            width="400"
            height="520"
            loading="lazy"
          /><BotanicalOrnament />
        </div>
        <p class="eyebrow person-label">{{ i === 0 ? 'THE BRIDE' : 'THE GROOM' }}</p>
        <h3>{{ person.name }}</h3>
        <p>
          {{ person.order }}<br /><strong>{{ person.father }}</strong
          ><br />& <strong>{{ person.mother }}</strong>
        </p>
        <a
          v-if="person.instagram"
          :href="`https://www.instagram.com/${person.instagram}/`"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          ><Instagram :size="14" /> @{{ person.instagram }}</a
        >
      </article>
    </div>
    <div class="couple-and" aria-hidden="true">&</div>
  </section>
</template>
