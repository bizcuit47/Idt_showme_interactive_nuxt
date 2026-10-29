import type { ApiDuck } from '~/types'

interface DuckListResponse {
  ducks: ApiDuck[]
}

export const duckPollMs = 3000

export function useDuckFeed(onDuck: (duck: ApiDuck, isFirstLoad: boolean) => void) {
  let since = 0
  let isPolling = false
  let hasLoaded = false

  async function poll() {
    if (isPolling)
      return
    isPolling = true
    try {
      const response = await $fetch<DuckListResponse>('/api/ducks', { query: since ? { since } : {} })
      for (const duck of response.ducks) {
        onDuck(duck, !hasLoaded)
        since = Math.max(since, duck.createdAt)
      }
      hasLoaded = true
    }
    catch {
      return
    }
    finally {
      isPolling = false
    }
  }

  const { resume, pause } = useIntervalFn(poll, duckPollMs, { immediate: false })

  onMounted(() => {
    poll()
    resume()
  })

  onBeforeUnmount(pause)

  return { poll }
}
