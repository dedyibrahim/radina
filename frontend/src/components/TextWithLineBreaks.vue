<script setup>
import { computed } from 'vue'

const props = defineProps({ text: { type: String, default: '' } })
const lines = computed(() =>
  String(props.text ?? '')
    // Preserve links whose paths include /n, such as /news or /notes.
    .replace(/https?:\/\/[^\s]+|\\r\\n|\\n|\/n/g, (token) =>
      /^https?:\/\//.test(token) ? token : '\n',
    )
    .split(/\r\n?|\n/),
)
</script>

<template>
  <template v-for="(line, index) in lines" :key="index">
    <br v-if="index" /><bdi dir="auto">{{ line }}</bdi>
  </template>
</template>
