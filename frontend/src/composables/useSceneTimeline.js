import { ref, watch, onUnmounted } from 'vue'
import { SceneTimeline } from '../components/cinematic/SceneTimeline'

export function useSceneTimeline(visible, reduced) {
  const state = ref('IDLE')
  const timeline = new SceneTimeline()
  watch(
    [visible, reduced],
    ([show, quiet]) => {
      if (!show && state.value === 'IDLE') return
      timeline.run(
        show
          ? [
              { at: 0, state: 'ENTERING' },
              { at: 650, state: 'ACTIVE' },
            ]
          : [
              { at: 0, state: 'EXITING' },
              { at: 350, state: 'COMPLETED' },
            ],
        (next) => {
          state.value = next
        },
        quiet,
      )
    },
    { immediate: true },
  )
  onUnmounted(() => timeline.stop())
  return state
}
