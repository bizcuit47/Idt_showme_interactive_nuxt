<script setup lang="ts">
import type { WalkBounds } from '~/types'

import { avatars } from '~/data/avatars'

const stageWidth = 1080
const stageHeight = 1920
const demoNpcCount = 4
const demoNames = ['น้องส้ม', 'ไอติม', 'บีม', 'ใบเตย', 'เจ', 'มายด์']
const walkBounds: WalkBounds = { minX: 140, maxX: 940, minY: 1080, maxY: 1740 }

const me = useMe()
const { width, height } = useWindowSize({ initialWidth: stageWidth, initialHeight: stageHeight })

const stageScale = computed(() => Math.min(width.value / stageWidth, height.value / stageHeight))
const stageStyle = computed(() => ({
  width: `${stageWidth}px`,
  height: `${stageHeight}px`,
  transform: `translate(-50%, -50%) scale(${stageScale.value})`,
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
        <MapScene />

        <header class="map-header">
          <div class="map-logo">
            <span class="map-logo-icon">
              <span i-carbon-flash />
            </span>
            <span class="map-title">FUTURE WALL</span>
          </div>
          <span class="map-pill">Season 6</span>
        </header>

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
          :drop-delay-ms="700"
          is-dropping
          is-self
        />

        <button class="map-back" @click="playAgain">
          เล่นอีกครั้ง
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
  top: 50%;
  overflow: hidden;
  transform-origin: center;
}

.map-header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 9998;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 200px;
  padding: 0 60px;
  border-bottom: 6px solid #000;
  background: var(--fw-yellow);
}

.map-logo {
  display: flex;
  align-items: center;
  gap: 28px;
}

.map-logo-icon {
  display: grid;
  place-items: center;
  width: 110px;
  height: 110px;
  background: #000;
  color: var(--fw-yellow);
  font-size: 64px;
}

.map-title {
  font-family: var(--fw-font-heading);
  font-size: 76px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.map-pill {
  padding: 12px 36px;
  border: 6px solid #000;
  border-radius: 9999px;
  background: #fff;
  font-family: var(--fw-font-heading);
  font-size: 38px;
  font-weight: 700;
}

.map-back {
  position: absolute;
  left: 50%;
  bottom: 50px;
  z-index: 9999;
  padding: 24px 64px;
  border: 6px solid #000;
  border-radius: 36px;
  background: #000;
  box-shadow: 24px 24px 0 0 #000;
  color: #fff;
  font-family: var(--fw-font-heading);
  font-size: 44px;
  font-weight: 800;
  transform: translateX(-50%);
  transition: all 0.2s var(--fw-push-ease);
  cursor: pointer;
}

.map-back:hover,
.map-back:active {
  box-shadow: 12px 12px 0 0 #000;
  transform: translate(calc(-50% + 12px), 12px);
}
</style>
