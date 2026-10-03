<script setup>
import { useRSVP } from '../../../composables/useRSVP'
import { Minus, Plus, Send, CheckCircle2 } from 'lucide-vue-next'
import SectionHeading from './SectionHeading.vue'
import FlowerMotion from './FlowerMotion.vue'
const props = defineProps({ guest: String })
const { name, guests, attendance, message, error, success, pending, submit, previewOnly } = useRSVP(
  props.guest,
)
</script>
<template>
  <section id="rsvp" class="section rsvp-section">
    <FlowerMotion /><SectionHeading
      eyebrow="RSVP"
      title="Will you attend?"
      subtitle="Kami menantikan kehadiran Anda di hari istimewa kami."
    />
    <form class="invitation-form" @submit.prevent="submit" data-reveal>
      <label for="rsvp-name">Nama lengkap *</label
      ><input
        id="rsvp-name"
        v-model="name"
        required
        minlength="2"
        maxlength="120"
        autocomplete="name"
        placeholder="Tulis nama Anda"
      />
      <div class="guest-counter">
        <label for="guest-number">Jumlah tamu</label>
        <div>
          <button
            type="button"
            class="icon-button"
            aria-label="Kurangi jumlah tamu"
            :disabled="guests <= 1"
            @click="guests--"
          >
            <Minus :size="16" /></button
          ><output id="guest-number" aria-live="polite">{{ guests }}</output
          ><button
            type="button"
            class="icon-button"
            aria-label="Tambah jumlah tamu"
            :disabled="guests >= 10"
            @click="guests++"
          >
            <Plus :size="16" />
          </button>
        </div>
      </div>
      <fieldset>
        <legend>Konfirmasi kehadiran *</legend>
        <label
          v-for="option in ['Hadir', 'Tidak Hadir', 'Masih Ragu']"
          :key="option"
          class="radio-option"
          ><input
            v-model="attendance"
            type="radio"
            name="attendance"
            :value="option"
            required
          /><span>{{ option }}</span></label
        >
      </fieldset>
      <label for="rsvp-message">Pesan (opsional)</label
      ><textarea
        id="rsvp-message"
        v-model="message"
        maxlength="1000"
        rows="3"
        placeholder="Tinggalkan pesan untuk kami…"
      ></textarea
      ><button class="button full-width" :disabled="pending">
        <Send :size="15" />{{ pending ? 'Mengirim…' : 'Kirim Konfirmasi' }}
      </button>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <p v-if="success" class="form-success" role="status">
        <CheckCircle2 :size="18" />{{
          previewOnly
            ? 'Pratinjau berhasil. Konfirmasi ini tidak dikirim kepada pasangan.'
            : 'Terkirim! Terima kasih atas konfirmasinya.'
        }}
      </p>
    </form>
  </section>
</template>
