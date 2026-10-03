<script setup>
import { computed, ref } from 'vue'
import { presetFor } from '../templates/contentPresets'
const props = defineProps({ modelValue: Object, templateKey: String })
const emit = defineEmits(['update:modelValue'])
const dragging = ref(null)
const preset = computed(() => presetFor(props.templateKey))
const order = computed(() =>
  props.modelValue.section_order?.length ? props.modelValue.section_order : preset.value.order,
)
const labels = {
  opening: 'Opening',
  home: 'Hero',
  couple: 'Couple & Parents',
  quote: 'Quote',
  date: 'Countdown',
  story: 'Love Story',
  event: 'Events',
  gallery: 'Gallery',
  video: 'Video',
  location: 'Location',
  gift: 'Wedding Gift',
  rsvp: 'RSVP',
  wishes: 'Wishes',
  livestream: 'Livestream',
  closing: 'Closing',
}
function content(key) {
  return { ...preset.value.sections[key], ...props.modelValue.section_content?.[key] }
}
function patch(key, field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    section_content: {
      ...props.modelValue.section_content,
      [key]: { ...content(key), [field]: value },
    },
  })
}
function reorder(from, to) {
  if (from === null || from === to || to < 0 || to >= order.value.length) return
  const values = [...order.value]
  values.splice(to, 0, values.splice(from, 1)[0])
  emit('update:modelValue', { ...props.modelValue, section_order: values })
  dragging.value = null
}
function defaults() {
  emit('update:modelValue', { ...props.modelValue, section_order: [...preset.value.order] })
}
</script>
<template>
  <div class="section-manager">
    <h2>Section Manager</h2>
    <p>
      Urutan rekomendasi {{ preset.name }}. Seret pegangan atau gunakan tombol ↑ ↓. Teks yang sudah
      diedit tetap tersimpan ketika berganti template.
    </p>
    <button type="button" class="p-button secondary small" @click="defaults">
      Gunakan urutan rekomendasi template
    </button>
    <article class="managed-section">
      <strong>Opening Cover</strong>
      <label class="toggle-row">Tampilkan Opening Cover<input type="checkbox" :checked="content('opening').enabled !== false" @change="patch('opening','enabled',$event.target.checked)" /></label>
      <p>Opening tetap menjadi gerbang undangan; tidak termasuk urutan scroll.</p>
      <label class="form-field"
        >Konten opening<textarea
          :value="modelValue.opening_text"
          rows="3"
          @input="$emit('update:modelValue', { ...modelValue, opening_text: $event.target.value })"
        ></textarea>
      </label>
    </article>
    <article
      v-for="(key, i) in order"
      :key="key"
      class="managed-section"
      @dragover.prevent
      @drop.prevent="reorder(dragging, i)"
    >
      <header>
        <span
          draggable="true"
          @dragstart="dragging = i"
          @dragend="dragging = null"
          aria-label="Seret section"
          class="drag-grip"
          >☰</span
        ><strong>{{ labels[key] }}</strong>
        <div>
          <button
            type="button"
            :disabled="i === 0"
            @click="reorder(i, i - 1)"
            :aria-label="`Naikkan ${labels[key]}`"
          >
            ↑</button
          ><button
            type="button"
            :disabled="i === order.length - 1"
            @click="reorder(i, i + 1)"
            :aria-label="`Turunkan ${labels[key]}`"
          >
            ↓
          </button>
        </div>
      </header>
      <label class="toggle-row"
        >Enabled<input
          type="checkbox"
          :checked="content(key).enabled !== false"
          @change="patch(key, 'enabled', $event.target.checked)" /></label
      ><label class="form-field"
        >Heading<input
          :value="content(key).heading || ''"
          maxlength="255"
          @input="patch(key, 'heading', $event.target.value)" /></label
      ><label class="form-field"
        >Subheading<input
          :value="content(key).subheading || ''"
          maxlength="1000"
          @input="patch(key, 'subheading', $event.target.value)" /></label
      ><label class="form-field"
        >Content<textarea
          :value="content(key).content || ''"
          rows="3"
          maxlength="5000"
          @input="patch(key, 'content', $event.target.value)"
        ></textarea>
      </label>
    </article>
  </div>
</template>
<style>
.section-manager > p {
  font-size: 13px;
  line-height: 1.8;
  margin: 18px 0;
}
.managed-section {
  padding: 20px;
  border: 1px solid #e2d3c8;
  border-radius: 12px;
  margin: 20px 0;
  background: #fffaf6;
}
.managed-section header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.managed-section header > div {
  margin-left: auto;
  display: flex;
  gap: 6px;
}
.managed-section header button {
  height: 40px;
  width: 36px;
  background: white;
  border: 1px solid #d9c6b8;
  border-radius: 6px;
}
.drag-grip {
  cursor: grab;
  padding: 10px;
  touch-action: none;
}
.managed-section > p {
  font-size: 12px;
  line-height: 1.8;
  margin: 14px 0;
}
</style>
