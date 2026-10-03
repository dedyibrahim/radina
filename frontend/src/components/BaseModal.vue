<script setup>
import { watch, nextTick, onUnmounted, ref } from 'vue'
import { X } from 'lucide-vue-next'
const props = defineProps({ open: Boolean, title: String, wide: Boolean })
const emit = defineEmits(['close', 'keydown'])
const panel = ref(null)
let previousFocus, oldOverflow
function keyHandler(event) {
  emit('keydown', event)
  if (event.key === 'Escape') emit('close')
  if (event.key !== 'Tab') return
  const items = [
    ...panel.value.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]'),
  ].filter((el) => !el.disabled)
  const first = items[0],
    last = items.at(-1)
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === panel.value)
  ) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
function cleanup() {
  document.body.style.overflow = oldOverflow ?? ''
  document.removeEventListener('keydown', keyHandler)
  previousFocus?.focus()
}
watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement
      oldOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', keyHandler)
      await nextTick()
      panel.value?.focus()
    } else cleanup()
  },
)
onUnmounted(() => {
  if (props.open) cleanup()
})
</script>
<template>
  <Teleport to="body"
    ><Transition name="modal"
      ><div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
        <div
          ref="panel"
          class="modal-panel"
          :class="{ 'modal-wide': wide }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <button class="modal-close icon-button" aria-label="Tutup dialog" @click="$emit('close')">
            <X :size="20" /></button
          ><slot />
        </div></div></Transition
  ></Teleport>
</template>
