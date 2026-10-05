<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section new-couple">
    <SectionHeading title="The people in our story" />
    <div class="shoreline-people">
      <article v-for="(person, i) in [wedding.bride, wedding.groom]" :key="i" data-reveal>
        <div class="wave-portrait">
          <img v-if="person.photo" :src="person.photo" :alt="person.name" loading="lazy" />
        </div>
        <div class="shoreline-biography">
          <small>{{ i === 0 ? 'HER SHORE' : 'HIS SHORE' }}</small>
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
