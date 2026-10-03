<script setup>
import { useWishes } from '../../../composables/useWishes'
import { Send } from 'lucide-vue-next'
import SectionHeading from './SectionHeading.vue'
import FlowerMotion from './FlowerMotion.vue'
const props = defineProps({ guest: String })
const { name, message, error, pending, wishes, next, load, submit, relative, previewOnly } =
  useWishes(props.guest)
</script>
<template>
  <section id="wishes" class="section wishes-section">
    <FlowerMotion /><SectionHeading
      eyebrow="WEDDING WISHES"
      title="Words from the heart"
      subtitle="Sebuah doa kecil dari Anda, kebahagiaan besar untuk kami."
    />
    <form class="invitation-form" @submit.prevent="submit" data-reveal>
      <p v-if="previewOnly" class="sample-note">Ucapan demo hanya muncul di sesi pratinjau ini.</p>
      <label for="wish-name">Nama</label
      ><input
        id="wish-name"
        v-model="name"
        required
        minlength="2"
        maxlength="120"
        autocomplete="name"
        placeholder="Nama Anda"
      /><label for="wish-message">Ucapan & doa</label
      ><textarea
        id="wish-message"
        v-model="message"
        required
        minlength="5"
        maxlength="1000"
        rows="3"
        placeholder="Tuliskan doa terbaik Anda…"
      ></textarea
      ><button class="button full-width" :disabled="pending">
        <Send :size="15" />{{ pending ? 'Mengirim…' : 'Kirim Ucapan' }}
      </button>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </form>
    <div class="wishes-list" aria-live="polite">
      <article v-for="wish in wishes" :key="wish.id" class="wish">
        <div class="wish-avatar">{{ Array.from(wish.name)[0]?.toUpperCase() }}</div>
        <div>
          <h3>{{ wish.name }}</h3>
          <p>{{ wish.message }}</p>
          <time>{{ relative(wish.created_at) }}</time>
        </div>
      </article>
      <p v-if="!wishes.length" class="gallery-hint">Jadilah yang pertama memberikan doa terbaik.</p>
    </div>
    <button v-if="next" class="button button-outline" @click="load(next)">
      Muat ucapan lainnya
    </button>
  </section>
</template>
