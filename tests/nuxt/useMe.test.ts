import { beforeEach, describe, expect, it } from 'vitest'

const player = {
  id: 'p1',
  nickname: 'มะลิ',
  avatarType: 'star' as const,
  answers: [0, 1, 2, 3, 0, 1],
  createdAt: '2026-10-21T00:00:00.000Z',
}

describe('useMe', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty when nothing is stored', () => {
    expect(useMe().value).toBeNull()
  })

  it('saves the player to localStorage as JSON', async () => {
    const me = useMe()
    me.value = player
    await nextTick()

    expect(JSON.parse(localStorage.getItem('fw:me')!)).toEqual(player)
  })

  it('reads a stored player back as an object', () => {
    localStorage.setItem('fw:me', JSON.stringify(player))

    expect(useMe().value).toEqual(player)
  })

  it('clears the stored player when set to null', async () => {
    const me = useMe()
    me.value = player
    await nextTick()
    me.value = null
    await nextTick()

    expect(useMe().value).toBeNull()
  })
})
