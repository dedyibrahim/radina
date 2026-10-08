import { computed } from 'vue'

// Shared amplitude and phase keep the scene coherent; each object has a
// different duration and delay so movement does not synchronize unnaturally.
export function useAmbientWind(config, quality, motion) {
  return computed(() => ({
    '--wind-strength':
      !motion.value || quality.value === 'lite'
        ? 0
        : config.value.motionProfile.ambient === 'soft'
          ? 1
          : 0.55,
    '--wind-phase': `${-config.value.variant * 1.37}s`,
    '--wind-x': `${config.value.variant % 2 ? -2 : 2}px`,
  }))
}
