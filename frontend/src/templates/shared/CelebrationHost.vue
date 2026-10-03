<script setup>
import { inject, computed } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
const people = computed(() => (wedding.isWedding ? [wedding.bride, wedding.groom] : []))
</script>
<template>
  <section id="couple" class="section celebration-host">
    <SectionHeading
      :eyebrow="wedding.isWedding ? 'MEMPELAI' : 'ACARA KAMI'"
      :title="wedding.isWedding ? 'Dua Insan, Satu Doa' : 'Yang Berbahagia'"
    />
    <div v-if="wedding.isWedding" class="celebration-people">
      <article v-for="(person, i) in people" :key="i" class="celebration-person">
        <img v-if="person.photo" :src="person.photo" :alt="person.name" loading="lazy" />
        <span v-else class="celebration-symbol" aria-hidden="true">✧</span>
        <h3>{{ person.name }}</h3>
        <p v-if="person.order">{{ person.order }}</p>
        <p v-if="person.father || person.mother">
          {{ [person.father, person.mother].filter(Boolean).join(' & ') }}
        </p>
        <a
          v-if="person.instagram"
          :href="`https://www.instagram.com/${person.instagram}/`"
          target="_blank"
          rel="noopener noreferrer"
          >@{{ person.instagram }}</a
        >
      </article>
    </div>
    <article v-else class="celebration-person">
      <img
        v-if="wedding.eventDetails.photo"
        :src="wedding.eventDetails.photo"
        :alt="wedding.eventDetails.honoree_name || wedding.eventDetails.host_name"
        loading="lazy"
      />
      <h3 v-if="wedding.eventDetails.honoree_name">
        {{ wedding.eventDetails.honoree_name }}
      </h3>
      <p v-if="wedding.eventDetails.father_name || wedding.eventDetails.mother_name">
        Putra / putri dari
        {{
          [wedding.eventDetails.father_name, wedding.eventDetails.mother_name]
            .filter(Boolean)
            .join(' & ')
        }}
      </p>
      <h3>{{ wedding.eventDetails.host_name }}</h3>
      <p class="celebration-intro">
        {{ wedding.eventDetails.description }}
      </p>
    </article>
  </section>
</template>
