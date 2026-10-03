import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useUiStore = defineStore('ui', () => {
  const message = ref('')
  let timer
  function toast(text) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = ''
    }, 4500)
  }
  return { message, toast }
})
