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
  <div class="page dot-pattern">
    <AppHeader />

    <main class="content">
      <section v-if="step === 'intro'" flex="~ col" gap-6>
        <div flex="~ col" gap-3 items-start>
          <span class="neo-pill">NEW: ค้นหาห่านประจำตัวคุณ</span>
          <h1 class="hero-title">
            อนาคตของคุณ<br>คือ<span class="neo-outline-text">ห่านตัวไหน?</span>
          </h1>
          <p text-base>
            ตอบ {{ questions.length }} ข้อ ใช้เวลาไม่ถึง 2 นาที
          </p>
        </div>

        <div class="neo-card" p-5 flex="~ col" gap-5>
          <div class="neo-panel-dark goose-box">
            <div class="goose-bob" w-52>
              <GooseImg type="rocket" />
            </div>
          </div>
          <form flex="~ col" gap-4 @submit.prevent="start">
            <input
              v-model="nickname"
              class="nickname-input"
              type="text"
              placeholder="ใส่ชื่อเล่นของคุณ"
              autocomplete="off"
              :maxlength="MAX_NICKNAME_LENGTH"
            >
            <p v-if="nameError" class="neo-pill" self-start>
              {{ nameError }}
            </p>
            <ButtonPrimary type="submit">
              เริ่มเลย
            </ButtonPrimary>
          </form>
        </div>

        <p text-xs leading-relaxed>
          เราเก็บเฉพาะชื่อเล่นและคำตอบของคุณ ไม่เก็บรูปหรือข้อมูลติดต่อ
        </p>
      </section>

      <section v-else-if="step === 'quiz'" flex="~ col" gap-5>
        <div flex="~ col" gap-3>
          <div flex items-center justify-between>
            <span class="neo-pill">ข้อ {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span class="neo-pill name-pill">{{ nickname.trim() }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
          </div>
        </div>

        <div class="neo-card" p-5>
          <h2 :key="currentIndex" class="fade-in question-title">
            {{ question.text }}
          </h2>
        </div>

        <div :key="`options-${currentIndex}`" class="fade-in" flex="~ col" gap-4>
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

      <section v-else-if="step === 'calculating'" class="neo-card" flex="~ col items-center" p-8 text-center gap-5>
        <div class="goose-wiggle" text-6xl>
          🪿
        </div>
        <p class="calculating-text">
          กำลังค้นหาห่านของ {{ nickname.trim() }}…
        </p>
      </section>

      <section v-else-if="me && avatar" flex="~ col" gap-5>
        <span class="neo-pill" self-start>ผลของ {{ me.nickname }}</span>
        <div class="neo-card goose-pop" p-5 flex="~ col" gap-5>
          <div class="neo-panel-dark goose-box">
            <div w-64>
              <GooseImg :type="me.avatarType" />
            </div>
          </div>
          <div>
            <h2 class="result-title">
              {{ avatar.title }}
            </h2>
            <p text-base mt-2>
              {{ avatar.blurb }}
            </p>
          </div>
        </div>
        <div flex="~ col" gap-4>
          <ButtonPrimary @click="send">
            ส่งห่านของฉันไปที่เมือง 🏙️
          </ButtonPrimary>
          <button class="text-link" @click="playAgain">
            เล่นใหม่
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.content {
  box-sizing: border-box;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
}

.hero-title {
  margin: 0;
  font-size: 2.5rem;
  line-height: 1.15;
}

.goose-box {
  display: grid;
  place-items: center;
  padding: 1rem 0;
}

.nickname-input {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem 1.25rem;
  border: var(--fw-border);
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: var(--fw-shadow-sm);
  color: #000;
  font: inherit;
  font-size: 1.125rem;
  text-align: center;
  outline: none;
  transition: all 0.2s var(--fw-push-ease);
}

.nickname-input::placeholder {
  color: rgb(0 0 0 / 0.45);
}

.nickname-input:focus {
  background: var(--fw-yellow);
  box-shadow: 0 0 0 0 #000;
  transform: translate(4px, 4px);
}

.name-pill {
  background: var(--fw-sage);
}

.progress-track {
  height: 1.25rem;
  overflow: hidden;
  border: var(--fw-border);
  border-radius: 9999px;
  background: #fff;
}

.progress-fill {
  height: 100%;
  background: var(--fw-charcoal);
  transition: width 0.3s;
}

.question-title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.3;
}

.option {
  padding: 1rem 1.25rem;
  border: var(--fw-border);
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: var(--fw-shadow-sm);
  color: #000;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s var(--fw-push-ease);
}

.option:hover,
.option:active {
  box-shadow: 0 0 0 0 #000;
  transform: translate(4px, 4px);
}

.option-picked {
  background: var(--fw-charcoal);
  box-shadow: 0 0 0 0 #000;
  color: #fff;
  transform: translate(4px, 4px);
}

.calculating-text {
  margin: 0;
  font-family: var(--fw-font-heading);
  font-size: 1.25rem;
  font-weight: 800;
}

.result-title {
  margin: 0;
  font-size: 1.875rem;
  line-height: 1.2;
}

.text-link {
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
