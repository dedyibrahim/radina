<script setup>
import { computed } from 'vue'
import FormField from './FormField.vue'
import MediaUploader from './MediaUploader.vue'
import { eventDetailsFields, eventProfile } from '../services/invitationEvents'
const props = defineProps({
  modelValue: Object,
  eventType: String,
  weddingId: [String, Number],
  uploadPath: String,
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue', 'busy'])
const fields = computed(() => eventDetailsFields(props.eventType))
const photoLabel = computed(() =>
  eventProfile(props.eventType).honoree
    ? 'Foto anak / tokoh acara'
    : 'Foto atau logo penyelenggara',
)
function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
<template>
  <div class="event-details-form form-grid">
    <FormField
      v-for="[key, label, type, required] in fields"
      :key="key"
      :model-value="modelValue?.[key] || ''"
      :label="label"
      :type="type"
      :required="required"
      :disabled="disabled"
      @update:model-value="update(key, $event)"
    />
    <MediaUploader
      :model-value="modelValue?.photo || ''"
      :wedding-id="weddingId"
      :upload-path="uploadPath"
      collection="covers"
      :label="photoLabel"
      :disabled="disabled"
      @update:model-value="update('photo', $event)"
      @busy="$emit('busy', $event)"
    />
  </div>
</template>
