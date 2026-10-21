import type { AvatarDef } from '~/types'

import { avatarImageUrl, characterDrawRect } from '~/utils/goose'

export const cardWidth = 1080
export const cardHeight = 1920

const centerX = cardWidth / 2
const fontFamily = '"Cabinet Grotesk", "Satoshi", "Noto Sans Thai", system-ui, sans-serif'
const yellow = '#ffe17c'
const charcoal = '#171e19'
const sage = '#b7c6c2'
const borderWidth = 6
const shadowOffset = 24

const videoPattern = /\.(?:mp4|webm|mov)(?:$|\?)/i

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
    const timer = window.setTimeout(fail, 8000)

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

function drawDots(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgb(0 0 0 / 0.1)'
  for (let y = 16; y < cardHeight; y += 96) {
    for (let x = 16; x < cardWidth; x += 96) {
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = yellow
  ctx.fillRect(0, 0, cardWidth, cardHeight)
  drawDots(ctx)
}

function drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string, shadow = 0) {
  if (shadow) {
    ctx.fillStyle = '#000'
    drawRoundedRect(ctx, x + shadow, y + shadow, width, height, radius)
    ctx.fill()
  }
  drawRoundedRect(ctx, x, y, width, height, radius)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = borderWidth
  ctx.strokeStyle = '#000'
  ctx.stroke()
}

function drawBolt(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const points: Array<[number, number]> = [[58, 12], [24, 56], [46, 56], [40, 88], [76, 42], [54, 42]]
  ctx.beginPath()
  for (const [index, [px, py]] of points.entries()) {
    const targetX = x + (px / 100) * size
    const targetY = y + (py / 100) * size
    if (index === 0)
      ctx.moveTo(targetX, targetY)
    else
      ctx.lineTo(targetX, targetY)
  }
  ctx.closePath()
  ctx.fillStyle = yellow
  ctx.fill()
}

function drawHeader(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#000'
  ctx.fillRect(60, 70, 100, 100)
  drawBolt(ctx, 60, 70, 100)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#000'
  setFont(ctx, 800, 72)
  ctx.fillText('FUTURE WALL', 190, 146)

  drawBox(ctx, 770, 85, 250, 70, 35, '#fff')
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000'
  setFont(ctx, 700, 32)
  ctx.fillText('Season 6', 895, 131)
}

async function drawAvatar(ctx: CanvasRenderingContext2D, avatar: AvatarDef) {
  const src = avatarImageUrl(avatar, 'stand')
  const source = videoPattern.test(src) ? withoutBlackBackground(await loadVideoFrame(src)) : await loadImage(src)
  const boxX = 110
  const boxY = 370
  const box = { width: 860, height: 680 }

  if (avatar.framing) {
    const rect = characterDrawRect(avatar.framing, { width: source.width, height: source.height }, box)
    ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, boxX + rect.dx, boxY + rect.dy, rect.dw, rect.dh)
    return
  }

  const ratio = (source.width || 1) / (source.height || 1)
  const width = Math.min(780, 660 * ratio)
  const height = width / ratio
  ctx.drawImage(source, centerX - width / 2, 400 + (660 - height) / 2, width, height)
}

function drawPanel(ctx: CanvasRenderingContext2D) {
  drawBox(ctx, 60, 250, 960, 1390, 48, '#fff', shadowOffset)
  ctx.fillStyle = '#000'
  setFont(ctx, 500, 40)
  ctx.fillText('อนาคตของฉันคือ...', centerX, 330)
  drawBox(ctx, 110, 370, 860, 680, 36, charcoal)
}

function drawNamePlate(ctx: CanvasRenderingContext2D, nickname: string, avatar: AvatarDef) {
  ctx.fillStyle = '#000'
  drawFittedText(ctx, nickname, 1170, 820, 112, 800)

  drawBox(ctx, 110, 1210, 860, 110, 22, charcoal)
  ctx.fillStyle = yellow
  drawFittedText(ctx, avatar.title, 1286, 780, 54, 800)

  ctx.fillStyle = '#000'
  setFont(ctx, 500, 40)
  const lines = wrapLines(ctx, avatar.blurb, 820).slice(0, 2)
  for (const [index, line] of lines.entries())
    ctx.fillText(line, centerX, 1400 + index * 58)
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = charcoal
  ctx.fillRect(0, 1740, cardWidth, 180)

  ctx.fillStyle = yellow
  setFont(ctx, 700, 40)
  ctx.fillText('วัยรุ่นมีของ Startup Season 6', centerX, 1818)

  ctx.fillStyle = sage
  setFont(ctx, 500, 30)
  ctx.fillText('Increstive Company Limited | SIAMSCAPE | 30-31 ต.ค. 2569', centerX, 1868)
}

async function waitForFonts() {
  const sample = 'สวัสดี Hello'
  await Promise.allSettled([
    document.fonts.load(`500 40px ${fontFamily}`, sample),
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

  drawBackground(ctx)
  drawHeader(ctx)
  drawPanel(ctx)
  await drawAvatar(ctx, avatar)
  drawNamePlate(ctx, nickname, avatar)
  drawFooter(ctx)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Card export failed')), 'image/png')
  })
}
