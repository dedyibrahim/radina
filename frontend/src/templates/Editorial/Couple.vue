<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section new-couple">
    <SectionHeading title="The people in our story" />
    <article
      class="interview-spread"
      v-for="(person, i) in [wedding.bride, wedding.groom]"
      :key="i"
      data-reveal
    >
      <header>
        <b>{{ i === 0 ? 'BRIDE 01' : 'GROOM 02' }}</b
        ><span>MEET THE PEOPLE</span>
      </header>
      <figure>
        <img v-if="person.photo" :src="person.photo" :alt="person.name" loading="lazy" />
        <figcaption>{{ person.shortName }} · IN CONVERSATION</figcaption>
      </figure>
      <div class="interview-biography">
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
  </section>
</template>
