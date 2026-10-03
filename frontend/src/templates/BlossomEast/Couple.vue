<script setup>
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section new-couple">
    <SectionHeading title="The people in our story" />
    <div class="blossom-portraits">
      <article v-for="(person, i) in [wedding.bride, wedding.groom]" :key="i" data-reveal>
        <figure>
          <img v-if="person.photo" :src="person.photo" :alt="person.name" loading="lazy" /><span
            aria-hidden="true"
            >✿</span
          >
        </figure>
        <div class="ink-biography">
          <small>{{ i === 0 ? 'THE BRIDE' : 'THE GROOM' }}</small>
          <h3>{{ person.name }}</h3>
          <p>{{ person.order }}</p>
          <p>
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
