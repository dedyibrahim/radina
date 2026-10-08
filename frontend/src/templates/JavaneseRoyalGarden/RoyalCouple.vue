<script setup>
import { inject } from 'vue'
import RoyalSlide from './RoyalSlide.vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section royal-chapters royal-couple">
    <RoyalSlide
      v-for="(person, i) in [wedding.bride, wedding.groom]"
      :key="i"
      :scene="i === 0 ? 'bride' : 'groom'"
    >
      <SectionHeading
        v-if="i === 0"
        section="couple"
        eyebrow="THE BRIDE & GROOM"
        title="Mempelai"
      />
      <p v-else class="royal-kicker">THE GROOM</p>
      <figure
        v-if="person.photo"
        class="royal-portrait royal-couple__portrait"
        data-reveal
      >
        <img
          :src="person.photo"
          :alt="person.name"
          loading="lazy"
          decoding="async"
        />
      </figure>
      <div class="royal-person" data-reveal>
        <small v-if="i === 0" class="royal-kicker">THE BRIDE</small>
        <h3>{{ person.name }}</h3>
        <p v-if="person.order">{{ person.order }}</p>
        <p v-if="person.father || person.mother">
          {{ person.father
          }}<span v-if="person.father && person.mother"><br />&amp;<br /></span
          >{{ person.mother }}
        </p>
        <a
          v-if="person.instagram"
          :href="`https://instagram.com/${person.instagram}`"
          target="_blank"
          rel="noopener noreferrer"
          >@{{ person.instagram }}</a
        >
      </div>
    </RoyalSlide>
  </section>
</template>
