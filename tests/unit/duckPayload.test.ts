import { describe, expect, it } from 'vitest'
import { MAX_NICKNAME_LENGTH } from '~/constants'
import { cleanNickname, parseDuck } from '../../server/utils/duckPayload'

const id = '2d0254f8-8e09-43b9-851f-641a23d2bafe'

function body(overrides: Record<string, unknown> = {}) {
  return { id, nickname: 'มะลิ', type: 'star', ...overrides }
}

describe('parseDuck', () => {
  it('accepts a valid duck and lowercases the id', () => {
    const result = parseDuck(body({ id: id.toUpperCase() }))

    expect(result).toEqual({ duck: { id, nickname: 'มะลิ', type: 'star' } })
  })

  it('trims and collapses whitespace in the nickname', () => {
    const result = parseDuck(body({ nickname: '  น้อง   ส้ม  ' }))

    expect(result).toEqual({ duck: { id, nickname: 'น้อง ส้ม', type: 'star' } })
  })

  it('strips zero-width characters used to dodge the filter', () => {
    expect(cleanNickname('fu​ck')).toBe('fuck')
    expect(parseDuck(body({ nickname: 'fu​ck' }))).toEqual({ rejection: 'blocked' })
  })

  it('rejects anything that is not an object', () => {
    for (const value of [null, undefined, 'duck', 42, []])
      expect(parseDuck(value), String(value)).toEqual({ rejection: 'invalid' })
  })

  it('rejects a missing or malformed id', () => {
    expect(parseDuck(body({ id: undefined }))).toEqual({ rejection: 'invalid' })
    expect(parseDuck(body({ id: 'not-a-uuid' }))).toEqual({ rejection: 'invalid' })
    expect(parseDuck(body({ id: 42 }))).toEqual({ rejection: 'invalid' })
  })

  it('rejects an unknown character type', () => {
    expect(parseDuck(body({ type: 'dragon' }))).toEqual({ rejection: 'invalid' })
    expect(parseDuck(body({ type: undefined }))).toEqual({ rejection: 'invalid' })
  })

  it('rejects an empty nickname', () => {
    expect(parseDuck(body({ nickname: '   ' }))).toEqual({ rejection: 'empty' })
  })

  it('rejects a nickname that is too long', () => {
    expect(parseDuck(body({ nickname: 'a'.repeat(MAX_NICKNAME_LENGTH + 1) }))).toEqual({ rejection: 'tooLong' })
  })

  it('rejects a blocked nickname', () => {
    expect(parseDuck(body({ nickname: 'FUCK' }))).toEqual({ rejection: 'blocked' })
  })
})
