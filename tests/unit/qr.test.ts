import { describe, expect, it } from 'vitest'
import { createQr } from '~/utils/qr'

describe('createQr', () => {
  it('draws a square code with dark cells', () => {
    const qr = createQr('https://example.com/')

    expect(qr.size).toBeGreaterThanOrEqual(21)
    expect(qr.path.startsWith('M')).toBe(true)
  })

  it('puts the finder pattern in the top left corner', () => {
    const { path } = createQr('https://example.com/')

    for (let index = 0; index < 7; index++)
      expect(path).toContain(`M${index} 0h1v1h-1z`)
    expect(path).not.toContain('M7 0h1v1h-1z')
  })

  it('gives a longer address a bigger code', () => {
    const short = createQr('https://a.co/')
    const long = createQr(`https://example.com/${'path/'.repeat(20)}`)

    expect(long.size).toBeGreaterThan(short.size)
  })

  it('gives the same code for the same address', () => {
    expect(createQr('https://example.com/')).toEqual(createQr('https://example.com/'))
  })

  it('gives a different code for a different address', () => {
    expect(createQr('https://example.com/').path).not.toBe(createQr('https://example.org/').path)
  })
})
