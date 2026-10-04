import { reactive, watch, provide } from 'vue'
import { weddingView } from '../utils/weddingView'
export function useWedding(props) {
  const wedding = reactive(weddingView(props.wedding))
  watch(
    () => props.wedding,
    (value) => Object.assign(wedding, weddingView(value)),
    { deep: true },
  )
  provide('wedding', wedding)
  provide('weddingContext', {
    get slug() {
      return wedding.slug
    },
    get guestToken() {
      return (
        props.wedding.guest?.token ||
        new URLSearchParams(window.location.search).get('guest') ||
        undefined
      )
    },
    preview: Boolean(props.preview),
    isPreviewMode: Boolean(props.preview),
  })
  return wedding
}
