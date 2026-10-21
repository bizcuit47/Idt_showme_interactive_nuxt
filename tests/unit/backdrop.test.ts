import { describe, expect, it } from 'vitest'
import { clearConnectedBackdrop } from '~/utils/goose'

interface Scene {
  width: number
  height: number
  seed: number
  backdrop: [number, number, number]
}

function random(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function paintScene({ width, height, seed, backdrop }: Scene): Uint8ClampedArray {
  const next = random(seed)
  const data = new Uint8ClampedArray(width * height * 4)
  for (let index = 0; index < width * height; index++) {
    data[index * 4] = backdrop[0]
    data[index * 4 + 1] = backdrop[1]
    data[index * 4 + 2] = backdrop[2]
    data[index * 4 + 3] = 255
  }
  for (let shape = 0; shape < 5; shape++) {
    const left = Math.floor(next() * width * 0.7)
    const top = Math.floor(next() * height * 0.7)
    const shapeWidth = Math.max(3, Math.floor(next() * width * 0.4))
    const shapeHeight = Math.max(3, Math.floor(next() * height * 0.4))
    const color = [40 + Math.floor(next() * 215), 40 + Math.floor(next() * 215), 40 + Math.floor(next() * 215)]
    for (let y = top; y < Math.min(height, top + shapeHeight); y++) {
      for (let x = left; x < Math.min(width, left + shapeWidth); x++) {
        const isHole = x > left + 1 && x < left + shapeWidth - 2 && y > top + 1 && y < top + shapeHeight - 2 && shape % 2 === 0
        const offset = (y * width + x) * 4
        const paint = isHole ? backdrop : color
        data[offset] = paint[0]!
        data[offset + 1] = paint[1]!
        data[offset + 2] = paint[2]!
      }
    }
  }
  for (let index = 0; index < width * height; index += 37)
    data[index * 4 + 3] = next() < 0.5 ? 0 : 255
  return data
}

function asContext(value: unknown): CanvasRenderingContext2D {
  return value as CanvasRenderingContext2D
}

function clearScene(scene: Scene): Uint8ClampedArray {
  const data = paintScene(scene)
  const context = {
    canvas: { width: scene.width, height: scene.height },
    getImageData: () => ({ data }),
    putImageData: () => {},
  }
  clearConnectedBackdrop(asContext(context))
  return data
}

function hashAlpha(data: Uint8ClampedArray): string {
  let hash = 2166136261
  for (let index = 3; index < data.length; index += 4) {
    hash ^= data[index]!
    hash = Math.imul(hash, 16777619) >>> 0
  }
  return hash.toString(16)
}

function opaqueCount(data: Uint8ClampedArray): number {
  let count = 0
  for (let index = 3; index < data.length; index += 4) {
    if (data[index]! > 0)
      count++
  }
  return count
}

describe('clearConnectedBackdrop', () => {
  const scenes: Array<[string, Scene]> = [
    ['small black backdrop', { width: 64, height: 48, seed: 1, backdrop: [0, 0, 0] }],
    ['small grey backdrop', { width: 64, height: 48, seed: 2, backdrop: [30, 30, 30] }],
    ['wide scene with a bigger radius', { width: 900, height: 24, seed: 3, backdrop: [5, 5, 5] }],
    ['tall scene', { width: 40, height: 120, seed: 4, backdrop: [10, 12, 8] }],
    ['medium scene', { width: 300, height: 200, seed: 5, backdrop: [0, 0, 0] }],
  ]

  it.each(scenes)('keeps the same pixels as before for the %s', (_name, scene) => {
    const expected: Record<string, string> = {
      'small black backdrop': '88cba152',
      'small grey backdrop': '55168002',
      'wide scene with a bigger radius': '3250aa4d',
      'tall scene': '3a156435',
      'medium scene': '8df91994',
    }

    expect(hashAlpha(clearScene(scene))).toBe(expected[_name])
  })

  it('removes the backdrop but keeps the character', () => {
    const data = clearScene({ width: 64, height: 48, seed: 1, backdrop: [0, 0, 0] })
    const kept = opaqueCount(data)

    expect(kept).toBeGreaterThan(0)
    expect(kept).toBeLessThan(64 * 48)
  })

  it('leaves a fully transparent image alone', () => {
    const data = new Uint8ClampedArray(16 * 16 * 4)
    const context = {
      canvas: { width: 16, height: 16 },
      getImageData: () => ({ data }),
      putImageData: () => {
        throw new Error('should not write')
      },
    }

    expect(() => clearConnectedBackdrop(asContext(context))).not.toThrow()
  })
})
