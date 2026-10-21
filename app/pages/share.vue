<script setup lang="ts">
import { getAvatar } from '~/data/avatars'
import { renderCard } from '~/utils/card'

const me = useMe()
const route = useRoute()

const cardBlob = shallowRef<Blob>()
const cardUrl = ref('')
const isGenerating = ref(true)
const isFailed = ref(false)
const isCopySupported = ref(false)
const statusMessage = ref('')

const isSent = computed(() => route.query.sent === '1')
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

function goHome() {
  navigateTo('/')
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
  <div class="page dot-pattern">
    <AppHeader />

    <main class="content">
      <div flex="~ col" gap-2>
        <h1 class="share-title">
          การ์ดของคุณพร้อมแล้ว
        </h1>
        <p text-sm>
          บันทึกหรือแชร์ไปลงสตอรี่ได้เลย
        </p>
        <p v-if="isSent && me" class="neo-pill sent-pill">
          ส่งเป็ดขึ้นจอแล้ว มองหาชื่อ {{ me.nickname }} บนจอได้เลย
        </p>
      </div>

      <div class="card-frame">
        <img v-if="cardUrl" class="card-image" :src="cardUrl" alt="การ์ด Avatar ของคุณ">
        <div v-else-if="isFailed" class="card-placeholder">
          สร้างการ์ดไม่สำเร็จ
        </div>
        <div v-else class="card-placeholder">
          กำลังสร้างการ์ด...
        </div>
      </div>

      <div flex="~ col" gap-4>
        <div class="action-row">
          <ButtonPrimary :is-disabled="!cardUrl" @click="download">
            ดาวน์โหลดรูป
          </ButtonPrimary>
          <ButtonSecondary :is-disabled="!cardUrl" @click="share">
            แชร์ไปแอปอื่น
          </ButtonSecondary>
          <ButtonSecondary v-if="isCopySupported" :is-disabled="!cardUrl" @click="copyImage">
            คัดลอกรูป
          </ButtonSecondary>
        </div>
        <ButtonSecondary v-if="isFailed" @click="generate">
          ลองสร้างการ์ดอีกครั้ง
        </ButtonSecondary>
      </div>

      <p v-if="statusMessage" class="neo-pill status-pill">
        {{ statusMessage }}
      </p>

      <div flex="~ col" gap-1>
        <button class="link-button" @click="goToMap">
          ดูเป็ดของฉันบนเมือง 🏙️
        </button>
        <button class="link-button" @click="goHome">
          กลับสู่หน้าหลัก
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
}

.sent-pill {
  align-self: flex-start;
  border-radius: 0.75rem;
  line-height: 1.5;
}

.share-title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
}

.card-frame {
  align-self: center;
  width: min(100%, 280px);
  aspect-ratio: 1080 / 1520;
  overflow: hidden;
}

.card-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.action-row {
  display: flex;
  gap: 0.75rem;
}

.action-row > button {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.75rem 0.5rem;
  box-shadow: var(--fw-shadow-sm);
  font-size: 0.9rem;
  line-height: 1.3;
}

.card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.875rem;
  font-weight: 700;
}

.status-pill {
  align-self: center;
  border-radius: 0.75rem;
  text-align: center;
  line-height: 1.5;
}

.link-button {
  padding: 0.5rem;
  border: 0;
  background: none;
  color: #000;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
</style>
