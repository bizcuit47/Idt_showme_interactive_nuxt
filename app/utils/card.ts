import type { AvatarDef } from '~/types'

import { avatarImageUrl } from '~/utils/goose'

export const cardWidth = 1080
export const cardHeight = 1920

const centerX = cardWidth / 2
const fontFamily = '"Noto Sans Thai", "Noto Sans", system-ui, sans-serif'

const videoPattern = /\.(mp4|webm|mov)(?:$|\?)/i

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Avatar image failed to load'))
    image.src = src
  })
}

function loadVideoFrame(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.crossOrigin = 'anonymous'
    const timer = window.setTimeout(() => fail(), 8000)

    function fail() {
      window.clearTimeout(timer)
      reject(new Error('Avatar video failed to load'))
    }

    function finish() {
      window.clearTimeout(timer)
      if (!video.videoWidth)
        fail()
      else
        resolve(video)
    }

    video.onerror = fail
    video.onloadeddata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0.05) {
        finish()
        return
      }
      video.addEventListener('seeked', finish, { once: true })
      try {
        video.currentTime = Math.min(0.12, video.duration / 2)
      }
      catch {
        finish()
      }
    }
    video.src = src
  })
}

function withoutBlackBackground(video: HTMLVideoElement): HTMLCanvasElement {
  const frame = document.createElement('canvas')
  frame.width = video.videoWidth
  frame.height = video.videoHeight
  const context = frame.getContext('2d')!
  context.drawImage(video, 0, 0)
  const pixels = context.getImageData(0, 0, frame.width, frame.height)
  const data = pixels.data
  for (let index = 0; index < data.length; index += 4) {
    const brightness = Math.max(data[index]!, data[index + 1]!, data[index + 2]!)
    if (brightness < 24)
      data[index + 3] = 0
    else if (brightness < 64)
      data[index + 3] = Math.round(((brightness - 24) / 40) * data[index + 3]!)
  }
  context.putImageData(pixels, 0, 0)
  return frame
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number) {
  ctx.font = `${weight} ${size}px ${fontFamily}`
}

function drawFittedText(ctx: CanvasRenderingContext2D, text: string, y: number, maxWidth: number, size: number, weight: number) {
  let fontSize = size
  setFont(ctx, weight, fontSize)
  while (ctx.measureText(text).width > maxWidth && fontSize > 24) {
    fontSize -= 2
    setFont(ctx, weight, fontSize)
  }
  ctx.fillText(text, centerX, y)
}

function splitWords(text: string): string[] {
  if (typeof Intl.Segmenter !== 'function')
    return [...text]
  return [...new Intl.Segmenter('th', { granularity: 'word' }).segment(text)].map(part => part.segment)
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of splitWords(text)) {
    if (line && ctx.measureText(line + word).width > maxWidth) {
      lines.push(line.trim())
      line = word
    }
    else {
      line += word
    }
  }
  if (line.trim())
    lines.push(line.trim())
  return lines
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function drawBackground(ctx: CanvasRenderingContext2D, color: string) {
  const background = ctx.createLinearGradient(0, 0, 0, cardHeight)
  background.addColorStop(0, '#12132b')
  background.addColorStop(0.55, '#2a1f5c')
  background.addColorStop(1, '#12132b')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, cardWidth, cardHeight)

  const glow = ctx.createRadialGradient(centerX, 720, 60, centerX, 720, 640)
  glow.addColorStop(0, `${color}aa`)
  glow.addColorStop(1, `${color}00`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 150, cardWidth, 1100)
}

function drawHeader(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffd166'
  setFont(ctx, 800, 64)
  ctx.letterSpacing = '12px'
  ctx.fillText('FUTURE WALL', centerX, 170)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = 'rgb(255 255 255 / 0.7)'
  setFont(ctx, 400, 34)
  ctx.fillText('อนาคตของฉันคือ...', centerX, 232)
}

async function drawAvatar(ctx: CanvasRenderingContext2D, avatar: AvatarDef) {
  const src = avatarImageUrl(avatar, 'stand')
  const source = videoPattern.test(src) ? withoutBlackBackground(await loadVideoFrame(src)) : await loadImage(src)
  const naturalWidth = source.width
  const naturalHeight = source.height
  const boxSize = 760
  const ratio = (naturalWidth || 1) / (naturalHeight || 1)
  const width = ratio >= 1 ? boxSize : boxSize * ratio
  const height = ratio >= 1 ? boxSize / ratio : boxSize
  ctx.drawImage(source, centerX - width / 2, 330 + (boxSize - height) / 2, width, height)
}

function drawNamePlate(ctx: CanvasRenderingContext2D, nickname: string, avatar: AvatarDef) {
  ctx.fillStyle = '#ffffff'
  drawFittedText(ctx, nickname, 1210, 900, 120, 800)

  ctx.fillStyle = avatar.color
  drawRoundedRect(ctx, 90, 1260, 900, 120, 60)
  ctx.fill()
  ctx.fillStyle = '#12132b'
  drawFittedText(ctx, avatar.title, 1340, 820, 58, 800)

  ctx.fillStyle = 'rgb(255 255 255 / 0.85)'
  setFont(ctx, 400, 42)
  const lines = wrapLines(ctx, avatar.blurb, 840).slice(0, 3)
  for (const [index, line] of lines.entries())
    ctx.fillText(line, centerX, 1450 + index * 64)
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgb(255 255 255 / 0.2)'
  ctx.fillRect(140, 1730, 800, 3)

  ctx.fillStyle = 'rgb(255 255 255 / 0.8)'
  setFont(ctx, 700, 36)
  ctx.fillText('วัยรุ่นมีของ Startup Season 6', centerX, 1800)

  ctx.fillStyle = 'rgb(255 255 255 / 0.5)'
  setFont(ctx, 400, 30)
  ctx.fillText('Increstive Company Limited | SIAMSCAPE | 30-31 ต.ค. 2569', centerX, 1855)
}

async function waitForFonts() {
  const sample = 'สวัสดี Hello'
  await Promise.allSettled([
    document.fonts.load(`400 40px ${fontFamily}`, sample),
    document.fonts.load(`700 40px ${fontFamily}`, sample),
    document.fonts.load(`800 40px ${fontFamily}`, sample),
  ])
}

export async function renderCard(nickname: string, avatar: AvatarDef): Promise<Blob> {
  await waitForFonts()

  const canvas = document.createElement('canvas')
  canvas.width = cardWidth
  canvas.height = cardHeight
  const ctx = canvas.getContext('2d')!
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  drawBackground(ctx, avatar.color)
  drawHeader(ctx)
  await drawAvatar(ctx, avatar)
  drawNamePlate(ctx, nickname, avatar)
  drawFooter(ctx)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Card export failed')), 'image/png')
  })
}
