import type { ApiDuck } from '~/types'

import process from 'node:process'
import { MAX_MAP_DUCKS } from '~/constants'

export type AddOutcome = 'added' | 'duplicate' | 'limited'

export interface DuckStore {
  add: (duck: ApiDuck, clientKey: string) => Promise<AddOutcome>
  list: (since: number) => Promise<ApiDuck[]>
}

interface UpstashReply {
  result?: unknown
  error?: string
}

interface MemoryOptions {
  maxPerWindow: number
  now?: () => number
}

interface UpstashOptions {
  url: string
  token: string
  maxPerWindow: number
  now?: () => number
  fetcher?: typeof fetch
}

export const keepDucks = 200
export const maxListed = 50
export const sendWindowMs = 60_000
export const claimSeconds = 12 * 60 * 60
export const duckListSeconds = 2 * 24 * 60 * 60
export const defaultMaxPerWindow = 60

const duckListKey = 'fw:ducks'

function parseDuckJson(value: unknown): ApiDuck | null {
  if (typeof value !== 'string')
    return null
  try {
    const duck = JSON.parse(value) as ApiDuck
    return typeof duck.id === 'string' && typeof duck.createdAt === 'number' ? duck : null
  }
  catch {
    return null
  }
}

export function createMemoryStore({ maxPerWindow, now = Date.now }: MemoryOptions): DuckStore {
  const ducks: ApiDuck[] = []
  const claimed = new Set<string>()
  const windows = new Map<string, { count: number, resetAt: number }>()

  function isOverLimit(clientKey: string): boolean {
    const current = now()
    const window = windows.get(clientKey)
    if (!window || window.resetAt <= current) {
      windows.set(clientKey, { count: 1, resetAt: current + sendWindowMs })
      return false
    }
    window.count++
    return window.count > maxPerWindow
  }

  return {
    async add(duck, clientKey) {
      if (isOverLimit(clientKey))
        return 'limited'
      if (claimed.has(duck.id))
        return 'duplicate'
      claimed.add(duck.id)
      ducks.push(duck)
      if (ducks.length > keepDucks)
        ducks.splice(0, ducks.length - keepDucks)
      return 'added'
    },
    async list(since) {
      if (!since)
        return ducks.slice(-MAX_MAP_DUCKS)
      return ducks.filter(duck => duck.createdAt >= since).slice(0, maxListed)
    },
  }
}

export function createUpstashStore({ url, token, maxPerWindow, now = Date.now, fetcher = fetch }: UpstashOptions): DuckStore {
  async function pipeline(commands: Array<Array<string | number>>): Promise<UpstashReply[]> {
    const response = await fetcher(`${url}/pipeline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    })
    if (!response.ok)
      throw new Error(`Upstash request failed with ${response.status}`)
    const replies = await response.json() as UpstashReply[]
    const failed = replies.find(reply => reply.error)
    if (failed)
      throw new Error(`Upstash command failed: ${failed.error}`)
    return replies
  }

  return {
    async add(duck, clientKey) {
      const windowKey = `fw:rate:${clientKey}:${Math.floor(now() / sendWindowMs)}`
      const [count] = await pipeline([['INCR', windowKey], ['EXPIRE', windowKey, 120]])
      if (Number(count!.result) > maxPerWindow)
        return 'limited'

      const claimKey = `fw:duck:${duck.id}`
      const [claim] = await pipeline([['SET', claimKey, '1', 'NX', 'EX', claimSeconds]])
      if (claim!.result !== 'OK')
        return 'duplicate'

      try {
        await pipeline([
          ['ZADD', duckListKey, duck.createdAt, JSON.stringify(duck)],
          ['ZREMRANGEBYRANK', duckListKey, 0, -(keepDucks + 1)],
          ['EXPIRE', duckListKey, duckListSeconds],
        ])
      }
      catch (error) {
        await pipeline([['DEL', claimKey]]).catch(() => {})
        throw error
      }
      return 'added'
    },
    async list(since) {
      const command = since
        ? ['ZRANGE', duckListKey, since, '+inf', 'BYSCORE', 'LIMIT', 0, maxListed]
        : ['ZRANGE', duckListKey, -MAX_MAP_DUCKS, -1]
      const [reply] = await pipeline([command])
      const members = Array.isArray(reply!.result) ? reply!.result as unknown[] : []
      return members.map(parseDuckJson).filter((duck): duck is ApiDuck => duck !== null)
    },
  }
}

let store: DuckStore | undefined

export function getDuckStore(): DuckStore {
  if (store)
    return store

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  const maxPerWindow = Number(process.env.DUCK_RATE_LIMIT_PER_MINUTE) || defaultMaxPerWindow

  if (url && token) {
    store = createUpstashStore({ url, token, maxPerWindow })
    return store
  }
  if (process.env.NODE_ENV === 'production')
    throw new Error('Duck storage is not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')

  console.warn('[ducks] Upstash is not configured, using in-memory storage for development')
  store = createMemoryStore({ maxPerWindow })
  return store
}
