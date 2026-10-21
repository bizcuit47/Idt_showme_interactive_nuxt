import type { AvatarId } from '~/types'

export interface FieldDuck {
  id: string
  nickname: string
  type: AvatarId
  isSelf: boolean
  isEntering: boolean
  enterDelayMs: number
  isLeaving: boolean
}

export const maxDucks = 20

export function useDuckField() {
  const ducks = ref<FieldDuck[]>([])

  function addDuck(duck: Omit<FieldDuck, 'isLeaving'>) {
    if (ducks.value.some(existing => existing.id === duck.id))
      return
    ducks.value.push({ ...duck, isLeaving: false })
    const staying = ducks.value.filter(existing => !existing.isLeaving)
    for (const oldest of staying.slice(0, Math.max(0, staying.length - maxDucks)))
      oldest.isLeaving = true
  }

  function removeDuck(id: string) {
    ducks.value = ducks.value.filter(existing => existing.id !== id)
  }

  return { ducks, addDuck, removeDuck }
}
