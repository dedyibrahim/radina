<script setup>
import FlowerMotion from '../RomanticFloral/components/FlowerMotion.vue'
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
defineProps({ design: String })
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section design-couple" :class="`couple-${design}`">
    <FlowerMotion v-if="['amore', 'garden', 'daydream'].includes(design)" />
    <SectionHeading section="couple" eyebrow="THE BRIDE & GROOM" title="The people in our story" />
    <div class="couple-layout">
      <article
        v-for="(person, i) in [wedding.bride, wedding.groom]"
        :key="i"
        class="person-composition"
        data-reveal
      >
        <figure>
          <img
            v-if="person.photo"
            :src="person.photo"
            :alt="person.name"
            loading="lazy"
            decoding="async"
          />
          <figcaption v-if="['noir', 'dark', 'cinema'].includes(design)">
            {{ person.shortName }}
          </figcaption>
          <span v-if="design === 'letters'" class="photo-tape" aria-hidden="true"></span>
        </figure>
        <div class="person-copy">
          <small>{{ i === 0 ? 'THE BRIDE' : 'THE GROOM' }}</small>
          <h3>{{ person.name }}</h3>
          <p>{{ person.order }}</p>
          <p>
            {{ person.father }}<br /><span v-if="person.father && person.mother">&</span><br />{{
              person.mother
            }}
          </p>
          <a
            v-if="person.instagram"
            :href="`https://instagram.com/${person.instagram}`"
            target="_blank"
            rel="noopener noreferrer"
            >@{{ person.instagram }}</a
          >
        </div>
      </article>
    </div>
  </section>
</template>
