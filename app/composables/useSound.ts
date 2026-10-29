export function useSound(source: string) {
  let audio: HTMLAudioElement | undefined

  function load() {
    audio ??= new Audio(source)
    audio.preload = 'auto'
    return audio
  }

  function play() {
    const sound = load()
    sound.currentTime = 0
    new Promise(resolve => resolve(sound.play())).catch(() => {})
  }

  onMounted(load)

  return { play }
}
