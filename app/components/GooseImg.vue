<script setup lang="ts">
import type { AvatarId } from '~/types'
import type { GoosePose } from '~/utils/goose'

import { getAvatar } from '~/data/avatars'
import { avatarImageUrl, paintCharacterFrame } from '~/utils/goose'

const { type, pose = 'stand' } = defineProps<{
  type: AvatarId
  pose?: GoosePose
}>()

const avatar = computed(() => getAvatar(type))
const src = computed(() => avatarImageUrl(avatar.value, pose))
const videoElement = useTemplateRef<HTMLVideoElement>('video')
const canvasElement = useTemplateRef<HTMLCanvasElement>('canvas')

useRafFn(() => {
  const video = videoElement.value
  const canvas = canvasElement.value
  if (video && canvas)
    paintCharacterFrame(canvas, video)
})
</script>

<template>
  <div class="character-frame">
    <video ref="video" :src="src" autoplay loop muted playsinline />
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.character-frame {
  position: relative;
  width: 100%;
}

.character-frame video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.character-frame canvas {
  display: block;
  width: 100%;
  aspect-ratio: 1;
}
</style>
