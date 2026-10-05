<script setup>
import DecorativeFrame from '../../components/wedding/effects/DecorativeFrame.vue'
import { inject } from 'vue'
import SectionHeading from '../RomanticFloral/components/SectionHeading.vue'
const wedding = inject('wedding')
</script>
<template>
  <section id="couple" class="section floral-people">
    <SectionHeading
      :eyebrow="wedding.isWedding ? 'MEMPELAI' : 'ACARA KAMI'"
      :title="wedding.isWedding ? 'Dua Hati, Satu Harapan' : 'Yang Berbahagia'"
    />
    <div v-if="wedding.isWedding" class="floral-people-grid">
      <article
        v-for="(person, i) in [wedding.bride, wedding.groom]"
        :key="i"
        class="floral-person"
        data-reveal
      >
        <figure>
          <DecorativeFrame />
          <img
            v-if="person.photo"
            :src="person.photo"
            :alt="person.name"
            loading="lazy"
          /><span v-else>{{ person.shortName[0] }}</span>
          <figcaption>
            {{ i === 0 ? 'MEMPELAI WANITA' : 'MEMPELAI PRIA' }}
          </figcaption>
        </figure>
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
    <article v-else class="floral-person floral-host" data-reveal>
      <figure v-if="wedding.eventDetails.photo">
        <DecorativeFrame />
        <img
          :src="wedding.eventDetails.photo"
          :alt="
            wedding.eventDetails.honoree_name || wedding.eventDetails.host_name
          "
          loading="lazy"
        />
      </figure>
      <h3>
        {{
          wedding.eventDetails.honoree_name || wedding.eventDetails.host_name
        }}
      </h3>
      <p
        v-if="
          wedding.eventDetails.father_name || wedding.eventDetails.mother_name
        "
      >
        {{
          [wedding.eventDetails.father_name, wedding.eventDetails.mother_name]
            .filter(Boolean)
            .join(' & ')
        }}
      </p>
      <p>{{ wedding.eventDetails.description }}</p>
      <p v-if="wedding.eventDetails.honoree_name">
        {{ wedding.eventDetails.host_name }}
      </p>
    </article>
  </section>
</template>
