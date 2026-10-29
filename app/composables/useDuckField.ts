import type { AvatarId } from '~/types'

import { MAX_MAP_DUCKS } from '~/constants'

export interface FieldDuck {
  id: string
  nickname: string
  type: AvatarId
  isSelf: boolean
  isEntering: boolean
  enterDelayMs: number
  isLeaving: boolean
}

export const maxDucks = MAX_MAP_DUCKS

export function useDuckField() {
  const ducks = ref<FieldDuck[]>([])

  function addDuck(duck: Omit<FieldDuck, 'isLeaving'>): boolean {
    if (ducks.value.some(existing => existing.id === duck.id))
      return false
    ducks.value.push({ ...duck, isLeaving: false })
    const staying = ducks.value.filter(existing => !existing.isLeaving)
    for (const oldest of staying.slice(0, Math.max(0, staying.length - maxDucks)))
      oldest.isLeaving = true
    return true
  }

  function removeDuck(id: string) {
    ducks.value = ducks.value.filter(existing => existing.id !== id)
  }

  return { ducks, addDuck, removeDuck }
}
