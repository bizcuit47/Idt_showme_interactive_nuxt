<script setup lang="ts">
import { getAvatar } from '~/data/avatars'

const me = useMe()

const avatar = computed(() => me.value ? getAvatar(me.value.avatarType) : undefined)
</script>

<template>
  <main flex="~ col items-center justify-center" bg="[#12132b]" text-white px-6 text-center gap-4 min-h-screen>
    <template v-if="me && avatar">
      <div w-40>
        <GooseImg :type="me.avatarType" pose="walk" />
      </div>
      <p text-xl font-bold>
        {{ me.nickname }} - {{ avatar.title }}
      </p>
      <p text-sm text="white/60">
        หน้าที่ 2 (แมพ/เมือง) - รอทีมทำต่อ ดู docs/TASKS.md
      </p>
    </template>
    <template v-else>
      <p>ยังไม่มีข้อมูลผู้เล่น</p>
      <NuxtLink to="/" font-bold px-6 py-2 rounded-full bg="[#ffd166]" text="[#12132b]">
        ไปตอบคำถามก่อน
      </NuxtLink>
    </template>
  </main>
</template>
