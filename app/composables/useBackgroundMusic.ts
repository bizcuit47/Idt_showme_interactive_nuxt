const retryEvents = ['pointerdown', 'keydown'] as const

export function useBackgroundMusic(source: string, volume = 0.4) {
  let music: HTMLAudioElement | undefined
  let isActive = true

  function stopWaiting() {
    for (const eventName of retryEvents)
      window.removeEventListener(eventName, start)
  }

  function waitForTouch() {
    for (const eventName of retryEvents)
      window.addEventListener(eventName, start, { once: true })
  }

  function start() {
    stopWaiting()
    if (!music) {
      music = new Audio(source)
      music.loop = true
      music.volume = volume
    }
    new Promise(resolve => resolve(music!.play())).catch(() => {
      if (isActive)
        waitForTouch()
    })
  }

  onMounted(start)

  onBeforeUnmount(() => {
    isActive = false
    stopWaiting()
    music?.pause()
    music = undefined
  })
}
