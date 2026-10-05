<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section new-couple">
    <SectionHeading title="The people in our story" />
    <div class="polaroid-pair">
      <article v-for="(person, i) in [wedding.bride, wedding.groom]" :key="i" data-reveal>
        <figure>
          <span class="paper-tape" aria-hidden="true"></span
          ><img v-if="person.photo" :src="person.photo" :alt="person.name" loading="lazy" />
          <figcaption>{{ person.shortName }}</figcaption>
        </figure>
        <div class="journal-biography">
          <h3>{{ person.name }}</h3>
          <p v-if="person.order">{{ person.order }}</p>
          <p v-if="person.father || person.mother">
            {{ person.father }} <span v-if="person.father && person.mother">&</span>
            {{ person.mother }}
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
