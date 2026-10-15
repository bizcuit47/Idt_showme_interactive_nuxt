<script setup lang="ts">
import { getAvatar } from '~/data/avatars'
import { renderCard } from '~/utils/card'

const me = useMe()

const cardBlob = shallowRef<Blob>()
const cardUrl = ref('')
const isGenerating = ref(true)
const isFailed = ref(false)
const isCopySupported = ref(false)
const statusMessage = ref('')

const avatar = computed(() => me.value ? getAvatar(me.value.avatarType) : undefined)
const fileName = computed(() => `future-wall-${me.value?.avatarType ?? 'card'}.png`)

async function generate() {
  if (!me.value || !avatar.value)
    return
  isGenerating.value = true
  isFailed.value = false
  try {
    const blob = await renderCard(me.value.nickname, avatar.value)
    cardBlob.value = blob
    cardUrl.value = URL.createObjectURL(blob)
  }
  catch {
    isFailed.value = true
  }
  isGenerating.value = false
}

function createFile(): File {
  return new File([cardBlob.value!], fileName.value, { type: 'image/png' })
}

function download() {
  const link = document.createElement('a')
  link.href = cardUrl.value
  link.download = fileName.value
  link.click()
  statusMessage.value = 'ถ้าไม่เห็นไฟล์ ให้กดค้างที่รูปแล้วเลือกบันทึกรูปภาพ'
}

async function share() {
  const file = createFile()
  const canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
  if (!canShareFile) {
    download()
    statusMessage.value = 'อุปกรณ์นี้แชร์ตรงไม่ได้ บันทึกรูปแล้วนำไปโพสต์เองได้เลย'
    return
  }
  try {
    await navigator.share({
      files: [file],
      title: 'Future Wall',
      text: `ฉันได้ ${avatar.value!.title} จาก Future Wall! มาลองกัน ${location.origin}`,
    })
    statusMessage.value = ''
  }
  catch (error) {
    if ((error as DOMException).name !== 'AbortError')
      statusMessage.value = 'แชร์ไม่สำเร็จ ลองบันทึกรูปแล้วโพสต์เองนะ'
  }
}

async function copyImage() {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': cardBlob.value! })])
    statusMessage.value = 'คัดลอกรูปแล้ว นำไปวางในแอปได้เลย'
  }
  catch {
    statusMessage.value = 'คัดลอกไม่สำเร็จ ลองบันทึกรูปแทนนะ'
  }
}

function goToMap() {
  navigateTo('/map')
}

onMounted(() => {
  if (!me.value) {
    navigateTo('/')
    return
  }
  isCopySupported.value = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write
  generate()
})

onBeforeUnmount(() => {
  if (cardUrl.value)
    URL.revokeObjectURL(cardUrl.value)
})
</script>

<template>
  <main class="page" px-5 py-8 flex min-h-screen justify-center>
    <div flex="~ col" gap-5 max-w-md w-full>
      <header text-center>
        <div text-sm tracking-widest font-extrabold text="[#ffd166]">
          FUTURE WALL
        </div>
        <h1 text-2xl font-extrabold mt-2>
          การ์ดของคุณพร้อมแล้ว
        </h1>
        <p text-sm mt-1 text="white/70">
          บันทึกหรือแชร์ไปลงสตอรี่ได้เลย
        </p>
      </header>

      <div class="card-frame">
        <img v-if="cardUrl" class="card-image" :src="cardUrl" alt="การ์ด Avatar ของคุณ">
        <div v-else-if="isFailed" class="card-placeholder">
          สร้างการ์ดไม่สำเร็จ
        </div>
        <div v-else class="card-placeholder">
          กำลังสร้างการ์ด...
        </div>
      </div>

      <div flex="~ col" gap-3>
        <ButtonPrimary :is-disabled="!cardUrl" @click="download">
          ดาวน์โหลดรูป
        </ButtonPrimary>
        <ButtonSecondary :is-disabled="!cardUrl" @click="share">
          แชร์ไปแอปอื่น
        </ButtonSecondary>
        <ButtonSecondary v-if="isCopySupported" :is-disabled="!cardUrl" @click="copyImage">
          คัดลอกรูป
        </ButtonSecondary>
        <ButtonSecondary v-if="isFailed" @click="generate">
          ลองสร้างการ์ดอีกครั้ง
        </ButtonSecondary>
      </div>

      <p v-if="statusMessage" text-sm text-center text="white/80">
        {{ statusMessage }}
      </p>

      <button class="link-button" @click="goToMap">
        ดูห่านของฉันบนเมือง 🏙️
      </button>
    </div>
  </main>
</template>

<style scoped>
.page {
  background: linear-gradient(to bottom, #12132b, #2a1f5c, #12132b);
}

.card-frame {
  align-self: center;
  width: min(100%, 280px);
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 1.25rem;
  background: rgb(255 255 255 / 0.08);
  box-shadow: 0 12px 40px rgb(0 0 0 / 0.4);
}

.card-image {
  display: block;
  width: 100%;
  height: 100%;
}

.card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(255 255 255 / 0.6);
  font-size: 0.875rem;
}

.link-button {
  padding: 0.5rem;
  border: 0;
  background: none;
  color: rgb(255 255 255 / 0.7);
  font: inherit;
  font-size: 0.95rem;
  text-decoration: underline;
  cursor: pointer;
}
</style>
