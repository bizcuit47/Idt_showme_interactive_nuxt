import type { AvatarId } from '~/types'

import { getAvatar } from '~/data/avatars'
import { avatarImageUrl, createCharacterPainter } from '~/utils/goose'

export interface CharacterSource {
  canvas: HTMLCanvasElement
  refresh: () => number
}

export const characterCanvasSize = 200
export const characterFillRatio = 0.8

const sources = new Map<AvatarId, CharacterSource>()

function createVideo(src: string): HTMLVideoElement {
  const video = document.createElement('video')
  video.src = src
  video.muted = true
  video.loop = true
  video.autoplay = true
  video.playsInline = true
  video.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none'
  document.body.append(video)
  video.play().catch(() => {})
  return video
}

function createSource(type: AvatarId): CharacterSource | null {
  const avatar = getAvatar(type)
  const canvas = document.createElement('canvas')
  canvas.width = characterCanvasSize
  canvas.height = characterCanvasSize
  const painter = createCharacterPainter(canvas, avatar.framing, characterFillRatio)
  if (!painter)
    return null

  const video = createVideo(avatarImageUrl(avatar, 'walk'))
  let version = 0
  let isFrameFresh = false
  let paintedTime = -1

  if (typeof video.requestVideoFrameCallback === 'function') {
    const markFrame = () => {
      isFrameFresh = true
      video.requestVideoFrameCallback(markFrame)
    }
    video.requestVideoFrameCallback(markFrame)
  }

  function hasNewFrame(): boolean {
    if (typeof video.requestVideoFrameCallback === 'function') {
      const isFresh = isFrameFresh
      isFrameFresh = false
      return isFresh
    }
    const isNew = video.currentTime !== paintedTime
    paintedTime = video.currentTime
    return isNew
  }

  return {
    canvas,
    refresh() {
      if (video.readyState >= 2 && hasNewFrame()) {
        painter!.draw(video)
        version++
      }
      return version
    },
  }
}

export function getCharacterSource(type: AvatarId): CharacterSource | null {
  const existing = sources.get(type)
  if (existing)
    return existing
  const created = createSource(type)
  if (created)
    sources.set(type, created)
  return created
}
