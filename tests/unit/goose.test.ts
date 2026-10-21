import type { AvatarDef } from '~/types'
import { describe, expect, it } from 'vitest'
import { avatars } from '~/data/avatars'
import { avatarImageUrl, gooseSvg, svgToDataUri } from '~/utils/goose'

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
