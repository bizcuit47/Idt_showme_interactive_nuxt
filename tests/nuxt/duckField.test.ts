import { describe, expect, it } from 'vitest'
import { maxDucks, useDuckField } from '~/composables/useDuckField'

function newDuck(index: number) {
  return {
    id: `duck-${index}`,
    nickname: `เป็ด ${index}`,
    type: 'star' as const,
    isSelf: false,
    isEntering: true,
    enterDelayMs: 0,
  }
}

describe('duck field', () => {
  it('keeps every duck while the field has room', () => {
    const { ducks, addDuck } = useDuckField()
    for (let index = 0; index < maxDucks; index++)
      addDuck(newDuck(index))

    expect(ducks.value).toHaveLength(maxDucks)
    expect(ducks.value.some(duck => duck.isLeaving)).toBe(false)
  })

  it('starts fading out the oldest duck once the field is over the limit', () => {
    const { ducks, addDuck } = useDuckField()
    for (let index = 0; index < maxDucks + 1; index++)
      addDuck(newDuck(index))

    const leaving = ducks.value.filter(duck => duck.isLeaving)
    expect(leaving.map(duck => duck.id)).toEqual(['duck-0'])
  })

  it('fades out the oldest ducks first when several arrive together', () => {
    const { ducks, addDuck } = useDuckField()
    for (let index = 0; index < maxDucks + 3; index++)
      addDuck(newDuck(index))

    const leaving = ducks.value.filter(duck => duck.isLeaving).map(duck => duck.id)
    expect(leaving).toEqual(['duck-0', 'duck-1', 'duck-2'])
    expect(ducks.value.filter(duck => !duck.isLeaving)).toHaveLength(maxDucks)
  })

  it('does not count a fading duck against the limit again', () => {
    const { ducks, addDuck } = useDuckField()
    for (let index = 0; index < maxDucks + 1; index++)
      addDuck(newDuck(index))
    addDuck(newDuck(maxDucks + 1))

    const leaving = ducks.value.filter(duck => duck.isLeaving).map(duck => duck.id)
    expect(leaving).toEqual(['duck-0', 'duck-1'])
  })

  it('removes a duck once its fade finishes', () => {
    const { ducks, addDuck, removeDuck } = useDuckField()
    addDuck(newDuck(0))
    addDuck(newDuck(1))
    removeDuck('duck-0')

    expect(ducks.value.map(duck => duck.id)).toEqual(['duck-1'])
  })

  it('ignores a duck that was already added', () => {
    const { ducks, addDuck } = useDuckField()
    addDuck(newDuck(0))
    addDuck(newDuck(0))

    expect(ducks.value).toHaveLength(1)
  })

  it('tells whether the duck was added', () => {
    const { addDuck } = useDuckField()

    expect(addDuck(newDuck(0))).toBe(true)
    expect(addDuck(newDuck(0))).toBe(false)
  })
})
