<script setup lang="ts">
import { MAX_NICKNAME_LENGTH } from '~/constants'
import { getAvatar } from '~/data/avatars'
import { questions } from '~/data/questions'
import { nicknameErrorText, validateNickname } from '~/utils/nickname'
import { computeAvatar } from '~/utils/scoring'

type Step = 'intro' | 'quiz' | 'calculating' | 'result'

const optionPauseMs = 280
const calculatingMs = 1600

const me = useMe()

const step = ref<Step>('intro')
const nickname = ref('')
const nameError = ref('')
const currentIndex = ref(0)
const answers = ref<number[]>([])
const pickedIndex = ref<number>()

const question = computed(() => questions[currentIndex.value]!)
const progressPercent = computed(() => Math.round((currentIndex.value / questions.length) * 100))
const avatar = computed(() => me.value ? getAvatar(me.value.avatarType) : undefined)

watch(nickname, () => {
  nameError.value = ''
})

function start() {
  const error = validateNickname(nickname.value)
  if (error) {
    nameError.value = nicknameErrorText[error]
    return
  }
  nameError.value = ''
  answers.value = []
  currentIndex.value = 0
  step.value = 'quiz'
}

function pick(optionIndex: number) {
  if (pickedIndex.value !== undefined)
    return
  pickedIndex.value = optionIndex
  setTimeout(goNext, optionPauseMs)
}

function goNext() {
  answers.value.push(pickedIndex.value!)
  pickedIndex.value = undefined
  if (currentIndex.value + 1 < questions.length)
    currentIndex.value++
  else
    finish()
}

function finish() {
  const name = nickname.value.trim()
  me.value = {
    id: crypto.randomUUID(),
    nickname: name,
    avatarType: computeAvatar(answers.value, name),
    answers: [...answers.value],
    createdAt: new Date().toISOString(),
  }
  step.value = 'calculating'
  setTimeout(showResult, calculatingMs)
}

function showResult() {
  step.value = 'result'
}

function send() {
  navigateTo('/share')
}

function playAgain() {
  me.value = null
  nickname.value = ''
  step.value = 'intro'
}
</script>

<template>
  <main class="page" px-5 py-8 flex min-h-screen justify-center>
    <div max-w-md w-full flex="~ col">
      <header mb-6 text-center>
        <div text-sm tracking-widest font-extrabold text="[#ffd166]">
          FUTURE WALL
        </div>
        <div text-xs mt-1 text="white/60">
          วัยรุ่นมีของ Startup Season 6
        </div>
      </header>

      <section v-if="step === 'intro'" flex="~ col 1 items-center justify-center" text-center gap-6>
        <div class="goose-bob" w-40>
          <GooseImg type="rocket" />
        </div>
        <div>
          <h1 text-3xl font-extrabold>
            อนาคตของคุณ<br>คือห่านตัวไหน?
          </h1>
          <p text-sm mt-2 text="white/70">
            ตอบ {{ questions.length }} ข้อ ใช้เวลาไม่ถึง 2 นาที
          </p>
        </div>
        <form flex="~ col" gap-3 w-full @submit.prevent="start">
          <input
            v-model="nickname"
            class="nickname-input"
            type="text"
            placeholder="ใส่ชื่อเล่นของคุณ"
            autocomplete="off"
            :maxlength="MAX_NICKNAME_LENGTH"
          >
          <p v-if="nameError" text-sm text="[#ff8fa3]">
            {{ nameError }}
          </p>
          <ButtonPrimary type="submit">
            เริ่มเลย
          </ButtonPrimary>
        </form>
        <p text-xs leading-relaxed text="white/50">
          เราเก็บเฉพาะชื่อเล่นและคำตอบของคุณ<br>ไม่เก็บรูปหรือข้อมูลติดต่อ
        </p>
      </section>

      <section v-else-if="step === 'quiz'" flex="~ col 1" gap-6>
        <div>
          <div text-xs mb-2 flex justify-between text="white/60">
            <span>ข้อ {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span>{{ nickname.trim() }}</span>
          </div>
          <div rounded-full h-2 overflow-hidden bg="white/15">
            <div class="progress-fill" rounded-full h-full :style="{ width: `${progressPercent}%` }" />
          </div>
        </div>

        <h2 :key="currentIndex" class="fade-in" text-2xl leading-snug font-extrabold>
          {{ question.text }}
        </h2>

        <div :key="`options-${currentIndex}`" class="fade-in" flex="~ col" gap-3>
          <button
            v-for="(option, optionIndex) in question.options"
            :key="optionIndex"
            class="option"
            :class="{ 'option-picked': pickedIndex === optionIndex }"
            @click="pick(optionIndex)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section v-else-if="step === 'calculating'" flex="~ col 1 items-center justify-center" text-center gap-6>
        <div class="goose-wiggle" text-6xl>
          🪿
        </div>
        <p text-lg font-bold>
          กำลังค้นหาห่านของ {{ nickname.trim() }}…
        </p>
      </section>

      <section v-else-if="me && avatar" flex="~ col 1 items-center justify-center" text-center gap-5>
        <p text-sm text="white/70">
          ผลของ <span text-white font-bold>{{ me.nickname }}</span>
        </p>
        <div class="goose-pop" w-64 relative>
          <div class="goose-glow" :style="{ background: `${avatar.color}88` }" />
          <GooseImg :type="me.avatarType" />
        </div>
        <div>
          <h2 text-3xl font-extrabold :style="{ color: avatar.color }">
            {{ avatar.title }}
          </h2>
          <p text-base mt-2 text="white/80">
            {{ avatar.blurb }}
          </p>
        </div>
        <div flex="~ col" mt-2 gap-3 w-full>
          <ButtonPrimary @click="send">
            ส่งห่านของฉันไปที่เมือง 🏙️
          </ButtonPrimary>
          <button text-sm py-2 underline text="white/60" @click="playAgain">
            เล่นใหม่
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page {
  background: linear-gradient(to bottom, #12132b, #2a1f5c, #12132b);
}

.nickname-input {
  width: 100%;
  box-sizing: border-box;
  padding: 1rem 1.25rem;
  border: 0;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.1);
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / 0.2);
  color: #fff;
  font: inherit;
  font-size: 1.125rem;
  text-align: center;
  outline: none;
  transition: box-shadow 0.2s;
}

.nickname-input::placeholder {
  color: rgb(255 255 255 / 0.4);
}

.nickname-input:focus {
  box-shadow: inset 0 0 0 2px #ffd166;
}

.option {
  padding: 1rem 1.25rem;
  border: 0;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.1);
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / 0.15);
  color: #fff;
  font: inherit;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s,
    background 0.15s;
}

.option:active {
  transform: scale(0.98);
}

.option-picked {
  background: #ffd166;
  box-shadow: inset 0 0 0 2px #ffd166;
  color: #12132b;
  font-weight: 700;
}

.progress-fill {
  background: #ffd166;
  transition: width 0.3s;
}

.goose-glow {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 9999px;
  filter: blur(48px);
}

.goose-bob {
  animation: bob 1.6s ease-in-out infinite;
}

.goose-pop {
  animation: pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.goose-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

.fade-in {
  animation: fade-in 0.35s ease both;
}

@keyframes bob {
  50% {
    transform: translateY(-12px);
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.4) rotate(-8deg);
  }
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-12deg) scale(1);
  }
  50% {
    transform: rotate(12deg) scale(1.2);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
