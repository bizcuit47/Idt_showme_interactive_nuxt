<script setup lang="ts">
import type { AvatarId, WalkBounds } from '~/types'
import type { CharacterPainter, GoosePose } from '~/utils/goose'

import { getAvatar } from '~/data/avatars'
import { avatarImageUrl, characterBottomRatio, createCharacterPainter } from '~/utils/goose'

type Phase = 'waiting' | 'resting' | 'walking'

const { type, nickname, bounds, isEntering = false, isSelf = false, enterDelayMs = 0 } = defineProps<{
  type: AvatarId
  nickname: string
  bounds: WalkBounds
  isEntering?: boolean
  isSelf?: boolean
  enterDelayMs?: number
}>()

const gooseSize = 200
const characterHeightRatio = 0.8
const depthScaleMin = 1
const depthScaleMax = 1
const nameGap = 70
const fadeSeconds = 0.8
const maxBounce = 10
const walkSpeed = 120
const restChance = 0.25
const minTravel = 140
const maxPickAttempts = 6
const maxWanderX = 360
const maxWanderY = 160

const rootElement = useTemplateRef<HTMLElement>('root')
const shadowElement = useTemplateRef<HTMLElement>('shadow')
const flipElement = useTemplateRef<HTMLElement>('flip')
const imageElement = useTemplateRef<HTMLVideoElement>('image')
const canvasElement = useTemplateRef<HTMLCanvasElement>('canvas')

const nameTop = gooseSize * (1 - characterBottomRatio - characterHeightRatio) - nameGap

const poseUrls = computed(() => {
  const avatar = getAvatar(type)
  return {
    stand: avatarImageUrl(avatar, 'stand'),
    walk: avatarImageUrl(avatar, 'walk'),
    walk2: avatarImageUrl(avatar, 'walk2'),
  } satisfies Record<GoosePose, string>
})

let phase: Phase = isEntering ? 'waiting' : 'resting'
let phaseClock = isEntering ? enterDelayMs / 1000 : randomBetween(0.2, 2)
let x = randomBetween(bounds.minX, bounds.maxX)
let y = randomBetween(bounds.minY, bounds.maxY)
let targetX = x
let targetY = y
let fade = isEntering ? 0 : 1
let facing = 1
let elapsed = 0

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function depthScale(): number {
  const depth = (y - bounds.minY) / (bounds.maxY - bounds.minY)
  return depthScaleMin + (depthScaleMax - depthScaleMin) * clamp(depth, 0, 1)
}

function startResting(seconds: number) {
  phase = 'resting'
  phaseClock = seconds
}

function chooseNextMove() {
  if (Math.random() < restChance) {
    startResting(randomBetween(0.8, 2.2))
    return
  }
  for (let attempt = 0; attempt < maxPickAttempts; attempt++) {
    targetX = clamp(x + randomBetween(-maxWanderX, maxWanderX), bounds.minX, bounds.maxX)
    targetY = clamp(y + randomBetween(-maxWanderY, maxWanderY), bounds.minY, bounds.maxY)
    if (Math.hypot(targetX - x, targetY - y) >= minTravel)
      break
  }
  phase = 'walking'
}

function updateWalk(deltaSeconds: number) {
  const dx = targetX - x
  const dy = targetY - y
  const distance = Math.hypot(dx, dy)
  const step = walkSpeed * depthScale() * deltaSeconds

  if (Math.abs(dx) > 1)
    facing = dx > 0 ? 1 : -1

  if (distance <= step) {
    x = targetX
    y = targetY
    chooseNextMove()
    return
  }

  x += (dx / distance) * step
  y += (dy / distance) * step
}

function update(deltaSeconds: number) {
  elapsed += deltaSeconds

  if (phase === 'waiting') {
    phaseClock -= deltaSeconds
    if (phaseClock <= 0)
      startResting(randomBetween(0.8, 1.6))
  }
  else if (phase === 'resting') {
    phaseClock -= deltaSeconds
    if (phaseClock <= 0)
      chooseNextMove()
  }
  else {
    updateWalk(deltaSeconds)
  }

  if (phase !== 'waiting')
    fade = Math.min(1, fade + deltaSeconds / fadeSeconds)

  render()
}

function render() {
  const root = rootElement.value
  const shadow = shadowElement.value
  const flip = flipElement.value
  const image = imageElement.value
  if (!root || !shadow || !flip || !image)
    return

  const isWalking = phase === 'walking'
  const bounce = isWalking ? Math.abs(Math.sin(elapsed * 10)) * maxBounce : 0
  const sway = isWalking ? Math.sin(elapsed * 10) * 3 : 0

  root.style.transform = `translate3d(${x - gooseSize / 2}px, ${y - gooseSize}px, 0) scale(${depthScale()})`
  root.style.zIndex = String(Math.round(y))
  root.style.opacity = String(fade)
  const lift = bounce / maxBounce
  const footShift = facing * (getAvatar(type).footOffsetX ?? 0) * gooseSize
  shadow.style.opacity = String(0.35 * (1 - lift * 0.3))
  shadow.style.transform = `translateX(calc(-50% + ${footShift}px)) scale(${1 - lift * 0.2})`
  flip.style.transform = `translateY(${-bounce}px) rotate(${sway}deg) scaleX(${facing})`
  drawFrame(image)
}

let drawnTime = -1
let hasNewFrame = false
let isFrameWatched = false
let painter: CharacterPainter | null = null

function watchVideoFrames(video: HTMLVideoElement) {
  if (typeof video.requestVideoFrameCallback !== 'function')
    return
  isFrameWatched = true
  const markFrame = () => {
    hasNewFrame = true
    video.requestVideoFrameCallback(markFrame)
  }
  video.requestVideoFrameCallback(markFrame)
}

function drawFrame(video: HTMLVideoElement) {
  if (!painter || video.readyState < 2)
    return
  if (isFrameWatched) {
    if (!hasNewFrame)
      return
    hasNewFrame = false
  }
  else {
    if (video.currentTime === drawnTime)
      return
    drawnTime = video.currentTime
  }
  painter.draw(video)
}

useRafFn(({ delta }) => update(Math.min(delta / 1000, 0.05)))

onMounted(() => {
  const canvas = canvasElement.value
  if (canvas) {
    canvas.width = gooseSize
    canvas.height = gooseSize
    painter = createCharacterPainter(canvas, getAvatar(type).framing, characterHeightRatio)
  }
  if (imageElement.value)
    watchVideoFrames(imageElement.value)
  render()
})
</script>

<template>
  <div
    ref="root"
    class="map-walker"
    :style="{ width: `${gooseSize}px`, height: `${gooseSize}px` }"
  >
    <div ref="shadow" class="map-walker-shadow" />
    <div class="map-walker-name" :class="{ 'map-walker-name-self': isSelf }" :style="{ top: `${nameTop}px` }">
      {{ nickname }}
    </div>
    <div ref="flip" class="map-walker-flip">
      <video
        ref="image"
        class="map-walker-source"
        :src="poseUrls.walk"
        autoplay
        loop
        muted
        playsinline
      />
      <canvas ref="canvas" class="map-walker-image" />
    </div>
  </div>
</template>

<style scoped>
.map-walker {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transform-origin: 50% 100%;
  pointer-events: none;
  will-change: transform;
}

.map-walker-flip {
  width: 100%;
  height: 100%;
  transform-origin: 50% 100%;
}

.map-walker-source {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.map-walker-image {
  width: 100%;
  height: 100%;
  user-select: none;
}

.map-walker-shadow {
  position: absolute;
  left: 50%;
  bottom: 8px;
  width: 120px;
  height: 22px;
  border-radius: 50%;
  background: #000;
}

.map-walker-name {
  position: absolute;
  left: 50%;
  top: -34px;
  padding: 2px 20px;
  border: 5px solid #000;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 6px 6px 0 0 #000;
  color: #000;
  font-family: var(--fw-font-heading);
  font-size: 30px;
  font-weight: 800;
  white-space: nowrap;
  transform: translateX(-50%);
}

.map-walker-name-self {
  background: var(--fw-yellow);
}
</style>
