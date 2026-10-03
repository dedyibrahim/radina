<script setup>
import { Check } from 'lucide-vue-next'
defineProps({ message: String })
</script>
<template>
  <Teleport to="body"
    ><Transition name="toast"
      ><div v-if="message" class="toast-message" role="status">
        <Check :size="18" /><span>{{ message }}</span>
      </div></Transition
    ></Teleport
  >
</template>
