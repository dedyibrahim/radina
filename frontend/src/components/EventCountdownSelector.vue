<script setup>
import { computed, useId } from 'vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean })
const emit = defineEmits(['update:modelValue'])
const id = useId()
const selected = computed(() => {
  const index = props.modelValue.findIndex((event) => event.use_for_countdown)
  return index < 0 ? 'auto' : String(index)
})
const target = computed(() =>
  selected.value === 'auto'
    ? props.modelValue.find((event) => event.is_visible !== false)
    : props.modelValue[Number(selected.value)],
)
const zones = { 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' }
function label(event, index) {
  return `Acara ${index + 1} — ${event.title || 'Belum diberi nama'}${event.is_visible === false ? ' (disembunyikan)' : ''}`
}
function choose(value) {
  emit(
    'update:modelValue',
    props.modelValue.map((event, index) => ({
      ...event,
      use_for_countdown: value !== 'auto' && String(index) === value,
    })),
  )
}
</script>

<template>
  <section class="repeater-card countdown-selector">
    <h3>Countdown &amp; Simpan Tanggal</h3>
    <div class="field">
      <label :for="id">Sumber countdown</label>
      <select
        :id="id"
        :value="selected"
        :disabled="disabled || !modelValue.length"
        @change="choose($event.target.value)"
      >
        <option value="auto">Otomatis — acara pertama yang ditampilkan</option>
        <option
          v-for="(event, index) in modelValue"
          :key="index"
          :value="String(index)"
          :disabled="event.is_visible === false"
        >
          {{ label(event, index) }}
        </option>
      </select>
    </div>
    <p v-if="target?.is_visible === false" class="alert error" role="alert">
      Acara sumber countdown sedang disembunyikan. Aktifkan kembali acara ini atau pilih acara lain.
    </p>
    <p v-else-if="target" class="panel-subtitle">
      Menghitung menuju {{ target.title || 'acara yang dipilih' }}:
      {{ target.date || 'tanggal belum diisi' }}, pukul
      {{ target.start_time?.slice(0, 5) || 'jam belum diisi' }}
      {{ zones[target.timezone] || 'WIB' }}. Countdown dan tombol Simpan Tanggal mengikuti acara ini
      setelah data disimpan.
    </p>
    <p v-else class="panel-subtitle">
      Tambahkan dan tampilkan acara untuk menentukan sumber countdown.
    </p>
  </section>
</template>
