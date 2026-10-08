<script setup>
import { inject } from 'vue'
import { Play, Pause } from 'lucide-vue-next'
const journey = inject('weddingJourney')
</script>
<template>
  <div v-if="journey?.canRun.value" class="auto-journey" data-journey-control>
    <button
      type="button"
      :aria-label="
        journey.state.value === 'playing'
          ? 'Jeda Auto Journey'
          : 'Mulai atau lanjutkan Auto Journey'
      "
      :aria-pressed="journey.state.value === 'playing'"
      @click="
        journey.state.value === 'playing' ? journey.pause() : journey.start()
      "
    >
      <Pause v-if="journey.state.value === 'playing'" :size="14" />
      <Play v-else :size="14" />
      {{
        journey.state.value === 'playing'
          ? 'Jeda perjalanan'
          : journey.state.value === 'paused'
            ? 'Lanjutkan perjalanan'
            : journey.state.value === 'complete'
              ? 'Ulangi perjalanan'
              : 'Auto Journey'
      }}
    </button>
    <span
      class="journey-progress"
      role="progressbar"
      aria-label="Kemajuan perjalanan"
      :aria-valuenow="Math.round(journey.progress.value * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <i :style="{ width: `${journey.progress.value * 100}%` }" />
    </span>
  </div>
</template>
