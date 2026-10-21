import type { ApiDuck } from '~/types'
import { describe, expect, it, vi } from 'vitest'
import { MAX_MAP_DUCKS } from '~/constants'
import { createMemoryStore, createUpstashStore, keepDucks, maxListed, sendWindowMs } from '../../server/utils/duckStore'

function newDuck(index: number, createdAt = 1000 + index): ApiDuck {
  return { id: `duck-${index}`, nickname: `เป็ด ${index}`, type: 'star', createdAt }
}

describe('memory store', () => {
  it('adds a duck once and reports a repeat as a duplicate', async () => {
    const store = createMemoryStore({ maxPerWindow: 100 })

    expect(await store.add(newDuck(1), 'ip-a')).toBe('added')
    expect(await store.add(newDuck(1), 'ip-a')).toBe('duplicate')
    expect(await store.list(0)).toHaveLength(1)
  })

  it('limits how many ducks one client can send in a window', async () => {
    const store = createMemoryStore({ maxPerWindow: 3 })

    const outcomes = []
    for (let index = 0; index < 5; index++)
      outcomes.push(await store.add(newDuck(index), 'ip-a'))

    expect(outcomes).toEqual(['added', 'added', 'added', 'limited', 'limited'])
    expect(await store.list(0)).toHaveLength(3)
  })

  it('counts each client on its own', async () => {
    const store = createMemoryStore({ maxPerWindow: 1 })

    expect(await store.add(newDuck(1), 'ip-a')).toBe('added')
    expect(await store.add(newDuck(2), 'ip-b')).toBe('added')
    expect(await store.add(newDuck(3), 'ip-a')).toBe('limited')
  })

  it('opens a new window after the old one ends', async () => {
    let clock = 0
    const store = createMemoryStore({ maxPerWindow: 1, now: () => clock })

    expect(await store.add(newDuck(1), 'ip-a')).toBe('added')
    expect(await store.add(newDuck(2), 'ip-a')).toBe('limited')
    clock += sendWindowMs
    expect(await store.add(newDuck(3), 'ip-a')).toBe('added')
  })

  it('lets a limited duck retry later instead of marking it as sent', async () => {
    let clock = 0
    const store = createMemoryStore({ maxPerWindow: 1, now: () => clock })
    await store.add(newDuck(1), 'ip-a')

    expect(await store.add(newDuck(2), 'ip-a')).toBe('limited')
    clock += sendWindowMs

    expect(await store.add(newDuck(2), 'ip-a')).toBe('added')
  })

  it('lists only the latest ducks when nothing was seen yet', async () => {
    const store = createMemoryStore({ maxPerWindow: 1000 })
    for (let index = 0; index < MAX_MAP_DUCKS + 5; index++)
      await store.add(newDuck(index), `ip-${index}`)

    const ducks = await store.list(0)

    expect(ducks).toHaveLength(MAX_MAP_DUCKS)
    expect(ducks.at(-1)!.id).toBe(`duck-${MAX_MAP_DUCKS + 4}`)
  })

  it('lists ducks from the last seen time on, including that moment', async () => {
    const store = createMemoryStore({ maxPerWindow: 1000 })
    for (let index = 0; index < 5; index++)
      await store.add(newDuck(index, 2000 + index), `ip-${index}`)

    const ducks = await store.list(2003)

    expect(ducks.map(duck => duck.id)).toEqual(['duck-3', 'duck-4'])
  })

  it('caps one poll at the list limit, oldest first', async () => {
    const store = createMemoryStore({ maxPerWindow: 1000 })
    for (let index = 0; index < maxListed + 10; index++)
      await store.add(newDuck(index, 5000 + index), `ip-${index}`)

    const ducks = await store.list(5000)

    expect(ducks).toHaveLength(maxListed)
    expect(ducks[0]!.id).toBe('duck-0')
  })

  it('forgets the oldest ducks beyond the keep limit', async () => {
    const store = createMemoryStore({ maxPerWindow: 1_000_000 })
    for (let index = 0; index < keepDucks + 10; index++)
      await store.add(newDuck(index, 9000 + index), `ip-${index}`)

    const ducks = await store.list(9000)

    expect(ducks[0]!.id).toBe('duck-10')
  })
})

function asFetch(handler: unknown): typeof fetch {
  return handler as typeof fetch
}

function fakeUpstash(replies: Array<Array<{ result?: unknown, error?: string }>>) {
  const calls: Array<Array<Array<string | number>>> = []
  const fetcher = vi.fn(async (_url: string, init: { body: string }) => {
    calls.push(JSON.parse(init.body))
    const reply = replies.shift() ?? []
    return { ok: true, status: 200, json: async () => reply }
  })
  return { calls, fetcher: asFetch(fetcher) }
}

describe('upstash store', () => {
  const options = { url: 'https://redis.example', token: 'secret', maxPerWindow: 5, now: () => 120_000 }

  it('counts the sender, claims the id, then stores the duck', async () => {
    const { calls, fetcher } = fakeUpstash([
      [{ result: 1 }, { result: 1 }],
      [{ result: 'OK' }],
      [{ result: 1 }, { result: 0 }, { result: 1 }],
    ])
    const store = createUpstashStore({ ...options, fetcher })

    const outcome = await store.add(newDuck(1), '1.2.3.4')

    expect(outcome).toBe('added')
    expect(calls[0]![0]).toEqual(['INCR', 'fw:rate:1.2.3.4:2'])
    expect(calls[1]![0]).toEqual(['SET', 'fw:duck:duck-1', '1', 'NX', 'EX', 43200])
    expect(calls[2]![0]![0]).toBe('ZADD')
    expect(calls[2]![0]![1]).toBe('fw:ducks')
    expect(calls[2]![1]).toEqual(['ZREMRANGEBYRANK', 'fw:ducks', 0, -(keepDucks + 1)])
  })

  it('sends the token as a bearer header', async () => {
    const fetcher = vi.fn(async () => ({ ok: true, status: 200, json: async () => [{ result: [] }] }))
    const store = createUpstashStore({ ...options, fetcher: asFetch(fetcher) })

    await store.list(0)

    expect(fetcher).toHaveBeenCalledWith('https://redis.example/pipeline', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
    }))
  })

  it('stops at the limit without claiming the id', async () => {
    const { calls, fetcher } = fakeUpstash([[{ result: 6 }, { result: 1 }]])
    const store = createUpstashStore({ ...options, fetcher })

    expect(await store.add(newDuck(1), '1.2.3.4')).toBe('limited')
    expect(calls).toHaveLength(1)
  })

  it('reports a duplicate when the id was already claimed', async () => {
    const { calls, fetcher } = fakeUpstash([
      [{ result: 1 }, { result: 1 }],
      [{ result: null }],
    ])
    const store = createUpstashStore({ ...options, fetcher })

    expect(await store.add(newDuck(1), '1.2.3.4')).toBe('duplicate')
    expect(calls).toHaveLength(2)
  })

  it('releases the claim when storing the duck fails', async () => {
    const { calls, fetcher } = fakeUpstash([
      [{ result: 1 }, { result: 1 }],
      [{ result: 'OK' }],
      [{ error: 'ERR boom' }],
      [{ result: 1 }],
    ])
    const store = createUpstashStore({ ...options, fetcher })

    await expect(store.add(newDuck(1), '1.2.3.4')).rejects.toThrow('boom')
    expect(calls[3]![0]).toEqual(['DEL', 'fw:duck:duck-1'])
  })

  it('reads the latest ducks, or the ones since a time', async () => {
    const stored = JSON.stringify(newDuck(1))
    const { calls, fetcher } = fakeUpstash([[{ result: [stored, 'not json'] }], [{ result: [stored] }]])
    const store = createUpstashStore({ ...options, fetcher })

    expect(await store.list(0)).toEqual([newDuck(1)])
    expect(await store.list(1001)).toEqual([newDuck(1)])
    expect(calls[0]![0]).toEqual(['ZRANGE', 'fw:ducks', -MAX_MAP_DUCKS, -1])
    expect(calls[1]![0]).toEqual(['ZRANGE', 'fw:ducks', 1001, '+inf', 'BYSCORE', 'LIMIT', 0, maxListed])
  })

  it('fails when Upstash answers with an error status', async () => {
    const fetcher = vi.fn(async () => ({ ok: false, status: 500, json: async () => [] }))
    const store = createUpstashStore({ ...options, fetcher: asFetch(fetcher) })

    await expect(store.list(0)).rejects.toThrow('500')
  })
})
