<script setup lang="ts">
import type { AvatarId } from '~/types'
import type { GoosePose } from '~/utils/goose'

import { getAvatar } from '~/data/avatars'
import { avatarImageUrl } from '~/utils/goose'

const { type, pose = 'stand' } = defineProps<{
  type: AvatarId
  pose?: GoosePose
}>()

const avatar = computed(() => getAvatar(type))
const src = computed(() => avatarImageUrl(avatar.value, pose))
</script>

<template>
  <video :src="src" autoplay loop muted playsinline />
</template>
