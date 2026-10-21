import type { AvatarDef } from '~/types'
import { describe, expect, it } from 'vitest'
import { avatars } from '~/data/avatars'
import { avatarImageUrl, characterBottomRatio, characterDrawRect, characterHeightRatio, gooseSvg, svgToDataUri } from '~/utils/goose'

const poses = ['walk', 'walk2', 'stand'] as const

describe('gooseSvg', () => {
  it('draws a sized svg for every avatar and pose', () => {
    for (const avatar of avatars) {
      for (const pose of poses) {
        const svg = gooseSvg(avatar, pose)
        expect(svg).toContain('<svg')
        expect(svg).toContain('width="512"')
        expect(svg).toContain(avatar.color)
      }
    }
  })

  it('uses different leg positions for each pose', () => {
    const avatar = avatars[0]!
    const drawings = new Set(poses.map(pose => gooseSvg(avatar, pose)))
    expect(drawings.size).toBe(poses.length)
  })
})

describe('svgToDataUri', () => {
  it('produces a data uri that decodes back to the svg', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><title>ห่าน</title></svg>'
    const uri = svgToDataUri(svg)
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)
    expect(decodeURIComponent(uri.split(',')[1]!)).toBe(svg)
  })
})

describe('avatarImageUrl', () => {
  const placeholder: AvatarDef = { ...avatars[0]!, images: undefined }

  it('falls back to the generated placeholder when no real art is set', () => {
    expect(avatarImageUrl(placeholder, 'walk').startsWith('data:image/svg+xml')).toBe(true)
  })

  it('uses real art when it is provided', () => {
    const avatar: AvatarDef = {
      ...placeholder,
      images: { walk: '/avatars/a-walk.png', stand: '/avatars/a-stand.png', walk2: '/avatars/a-walk2.png' },
    }
    expect(avatarImageUrl(avatar, 'walk')).toBe('/avatars/a-walk.png')
    expect(avatarImageUrl(avatar, 'stand')).toBe('/avatars/a-stand.png')
    expect(avatarImageUrl(avatar, 'walk2')).toBe('/avatars/a-walk2.png')
  })

  it('falls back to the walk image when the stand or walk2 image is missing', () => {
    const avatar: AvatarDef = { ...placeholder, images: { walk: '/avatars/a-walk.png' } }
    expect(avatarImageUrl(avatar, 'stand')).toBe('/avatars/a-walk.png')
    expect(avatarImageUrl(avatar, 'walk2')).toBe('/avatars/a-walk.png')
  })
})

describe('characterDrawRect', () => {
  const source = { width: 2048, height: 2048 }
  const box = { width: 320, height: 320 }
  const withFraming = avatars.filter(avatar => avatar.framing)

  it('has framing for every avatar that uses a character clip', () => {
    for (const avatar of avatars) {
      if (avatar.images)
        expect(avatar.framing, avatar.id).toBeDefined()
    }
  })

  it('draws every character at the same height', () => {
    const heights = withFraming.map(avatar => characterDrawRect(avatar.framing!, source, box).dh)
    expect(heights.length).toBeGreaterThan(0)
    for (const height of heights)
      expect(height).toBeCloseTo(box.height * characterHeightRatio, 5)
  })

  it('keeps the feet on the same line for every character', () => {
    for (const avatar of withFraming) {
      const rect = characterDrawRect(avatar.framing!, source, box)
      expect(rect.dy + rect.dh, avatar.id).toBeCloseTo(box.height * (1 - characterBottomRatio), 5)
    }
  })

  it('centres each character horizontally and keeps it inside the box', () => {
    for (const avatar of withFraming) {
      const rect = characterDrawRect(avatar.framing!, source, box)
      expect(rect.dx + rect.dw / 2, avatar.id).toBeCloseTo(box.width / 2, 5)
      expect(rect.dx).toBeGreaterThanOrEqual(0)
      expect(rect.dx + rect.dw).toBeLessThanOrEqual(box.width)
    }
  })

  it('crops the source rectangle from the framing fractions', () => {
    const rect = characterDrawRect({ x: 0.25, y: 0.5, width: 0.25, height: 0.5 }, source, box)

    expect(rect.sx).toBe(512)
    expect(rect.sy).toBe(1024)
    expect(rect.sw).toBe(512)
    expect(rect.sh).toBe(1024)
  })

  it('scales to the requested height ratio', () => {
    const rect = characterDrawRect(withFraming[0]!.framing!, source, box, 0.5)

    expect(rect.dh).toBeCloseTo(160, 5)
  })

  it('shrinks a very wide character to fit the box without distorting it', () => {
    const framing = { x: 0, y: 0, width: 1, height: 0.25 }
    const rect = characterDrawRect(framing, source, box)

    expect(rect.dw).toBeLessThanOrEqual(box.width)
    expect(rect.dw / rect.dh).toBeCloseTo((framing.width * source.width) / (framing.height * source.height), 5)
  })
})
