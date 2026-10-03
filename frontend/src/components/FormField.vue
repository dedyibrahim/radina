<script setup>
import { useId } from 'vue'
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  required: Boolean,
  placeholder: String,
  options: Array,
  help: String,
})
defineEmits(['update:modelValue'])
const id = useId()
</script>
<template>
  <div class="field">
    <label :for="id">{{ label }} <span v-if="required">*</span></label
    ><textarea
      v-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      :required="required"
      :placeholder="placeholder"
      rows="4"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea
    ><select
      v-else-if="type === 'select'"
      :id="id"
      :value="modelValue"
      :required="required"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option></select
    ><input
      v-else
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :placeholder="placeholder"
      @input="
        $emit(
          'update:modelValue',
          type === 'number' ? Number($event.target.value) : $event.target.value,
        )
      "
    /><small v-if="help">{{ help }}</small>
  </div>
</template>
