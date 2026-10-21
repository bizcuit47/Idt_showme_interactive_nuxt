<script setup lang="ts">
import type { WalkBounds } from '~/types'

import { avatars } from '~/data/avatars'

const stageWidth = 1080
const stageHeight = 1920
const demoNpcCount = 4
const demoNames = ['น้องส้ม', 'ไอติม', 'บีม', 'ใบเตย', 'เจ', 'มายด์']
const walkMarginX = 140
const walkMaxY = 1740
const walkMinY = 1250
const walkHeadroom = 280
const walkMinDepth = 120
const backOffset = 50

const me = useMe()
const { width, height } = useWindowSize({ initialWidth: stageWidth, initialHeight: stageHeight })

const stageScale = computed(() => Math.max(width.value / stageWidth, height.value / stageHeight))
const visibleWidth = computed(() => Math.min(stageWidth, width.value / stageScale.value))
const visibleHeight = computed(() => Math.min(stageHeight, height.value / stageScale.value))
const visibleLeft = computed(() => (stageWidth - visibleWidth.value) / 2)
const visibleTop = computed(() => stageHeight - visibleHeight.value)

const walkBounds = computed<WalkBounds>(() => {
  return {
    minX: visibleLeft.value + walkMarginX,
    maxX: stageWidth - visibleLeft.value - walkMarginX,
    minY: Math.min(Math.max(walkMinY, visibleTop.value + walkHeadroom), walkMaxY - walkMinDepth),
    maxY: walkMaxY,
  }
})
const stageStyle = computed(() => ({
  width: `${stageWidth}px`,
  height: `${stageHeight}px`,
  transform: `translateX(-50%) scale(${stageScale.value})`,
}))
const backStyle = computed(() => ({
  right: `${visibleLeft.value + backOffset}px`,
  bottom: `${backOffset}px`,
}))

const npcs = Array.from({ length: demoNpcCount }, (_, index) => ({
  id: index,
  nickname: demoNames[index]!,
  type: avatars[(index * 2 + 1) % avatars.length]!.id,
}))

function playAgain() {
  navigateTo('/')
}
</script>

<template>
  <main class="map-page">
    <ClientOnly>
      <div v-if="me" class="map-stage" :style="stageStyle">
        <img class="map-scene" src="/map-background.png" alt="">

        <MapWalker
          v-for="npc in npcs"
          :key="npc.id"
          :type="npc.type"
          :nickname="npc.nickname"
          :bounds="walkBounds"
        />

        <MapWalker
          :key="me.id"
          :type="me.avatarType"
          :nickname="me.nickname"
          :bounds="walkBounds"
          :enter-delay-ms="700"
          is-entering
          is-self
        />

        <button class="map-back" :style="backStyle" aria-label="เล่นอีกครั้ง" @click="playAgain">
          <img src="/home-icon.png" alt="">
        </button>
      </div>

      <div v-else class="dot-pattern" flex="~ col items-center justify-center" px-6 text-center gap-4 min-h-screen>
        <p>ยังไม่มีข้อมูลผู้เล่น</p>
        <NuxtLink to="/" class="neo-pill">
          ไปตอบคำถามก่อน
        </NuxtLink>
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
