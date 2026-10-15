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

        <header pt-20 text-center inset-x-0 top-0 absolute>
          <div class="map-title">
            FUTURE WALL
          </div>
          <div class="map-subtitle">
            วัยรุ่นมีของ Startup Season 6
          </div>
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

      <div v-else flex="~ col items-center justify-center" text-white px-6 text-center gap-4 min-h-screen>
        <p>ยังไม่มีข้อมูลผู้เล่น</p>
        <NuxtLink to="/" font-bold px-6 py-2 rounded-full bg="[#ffd166]" text="[#12132b]">
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
  background: #12132b;
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

.map-title {
  color: #ffd166;
  font-size: 72px;
  font-weight: 800;
  letter-spacing: 0.3em;
}

.map-subtitle {
  margin-top: 8px;
  color: rgb(255 255 255 / 0.7);
  font-size: 34px;
}

.map-back {
  position: absolute;
  left: 50%;
  bottom: 40px;
  z-index: 9999;
  padding: 18px 48px;
  border: 0;
  border-radius: 9999px;
  background: rgb(18 19 43 / 0.7);
  color: #fff;
  font: inherit;
  font-size: 32px;
  transform: translateX(-50%);
  cursor: pointer;
}
</style>
