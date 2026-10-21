<script setup lang="ts">
import type { WalkBounds } from '~/types'

const stageWidth = 1080
const stageHeight = 1920
const walkMarginX = 140
const walkMaxY = 1740
const walkMinY = 1250
const walkHeadroom = 280
const walkMinDepth = 120
const backOffset = 50
const qrHeight = 400

const me = useMe()
const route = useRoute()
const requestUrl = useRequestURL()
const { width, height } = useWindowSize({ initialWidth: stageWidth, initialHeight: stageHeight })

const stageScale = computed(() => Math.max(width.value / stageWidth, height.value / stageHeight))
const visibleWidth = computed(() => Math.min(stageWidth, width.value / stageScale.value))
const visibleHeight = computed(() => Math.min(stageHeight, height.value / stageScale.value))
const visibleLeft = computed(() => (stageWidth - visibleWidth.value) / 2)
const visibleTop = computed(() => stageHeight - visibleHeight.value)
const isKiosk = computed(() => route.query.kiosk === '1')
const quizUrl = computed(() => `${requestUrl.origin}/`)

const walkBounds = computed<WalkBounds>(() => {
  const clearedTop = visibleTop.value + (isKiosk.value ? backOffset + qrHeight : 0) + walkHeadroom
  return {
    minX: visibleLeft.value + walkMarginX,
    maxX: stageWidth - visibleLeft.value - walkMarginX,
    minY: Math.min(Math.max(walkMinY, clearedTop), walkMaxY - walkMinDepth),
    maxY: walkMaxY,
  }
})
const stageStyle = computed(() => ({
  width: `${stageWidth}px`,
  height: `${stageHeight}px`,
  transform: `translateX(-50%) scale(${stageScale.value})`,
}))
const qrStyle = computed(() => ({
  left: `${visibleLeft.value + backOffset}px`,
  top: `${visibleTop.value + backOffset}px`,
}))
const backStyle = computed(() => ({
  right: `${visibleLeft.value + backOffset}px`,
  bottom: `${backOffset}px`,
}))

const { ducks, addDuck, removeDuck } = useDuckField()

useDuckFeed((duck) => {
  addDuck({
    id: duck.id,
    nickname: duck.nickname,
    type: duck.type,
    isSelf: !isKiosk.value && duck.id === me.value?.id,
    isEntering: true,
    enterDelayMs: 0,
  })
})

function playAgain() {
  navigateTo('/')
}
</script>

<template>
  <main class="map-page">
    <ClientOnly>
      <div class="map-stage" :style="stageStyle">
        <img class="map-scene" src="/map-background.png" alt="">

        <MapWalker
          v-for="duck in ducks"
          :key="duck.id"
          :type="duck.type"
          :nickname="duck.nickname"
          :bounds="walkBounds"
          :is-entering="duck.isEntering"
          :is-leaving="duck.isLeaving"
          :is-self="duck.isSelf"
          :enter-delay-ms="duck.enterDelayMs"
          @left="removeDuck(duck.id)"
        />

        <MapQr v-if="isKiosk" :url="quizUrl" :style="qrStyle" />

        <button v-if="!isKiosk" class="map-back" :style="backStyle" aria-label="เล่นอีกครั้ง" @click="playAgain">
          <img src="/home-icon.png" alt="">
        </button>
      </div>
    </ClientOnly>
  </main>
</template>

<style scoped>
.map-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: var(--fw-charcoal);
  touch-action: none;
  user-select: none;
}

.map-stage {
  position: absolute;
  left: 50%;
  bottom: 0;
  overflow: hidden;
  transform-origin: 50% 100%;
}

.map-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-back {
  position: absolute;
  z-index: 9999;
  width: 150px;
  height: 150px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  transition: transform 0.2s var(--fw-push-ease);
  cursor: pointer;
}

.map-back img {
  display: block;
  width: 100%;
  height: 100%;
}

.map-back:hover,
.map-back:active {
  transform: scale(0.92);
}
</style>
