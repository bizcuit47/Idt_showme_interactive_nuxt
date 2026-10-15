import type { AvatarId } from '~/types'
import { avatars } from '~/data/avatars'
import { questions } from '~/data/questions'

function hashString(input: string): number {
  let hash = 2166136261
  for (const char of input)
    hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619)
  return hash >>> 0
}

function sumScores(answers: number[]): Record<AvatarId, number> {
  const totals = Object.fromEntries(avatars.map(avatar => [avatar.id, 0])) as Record<AvatarId, number>

  for (const [questionIndex, optionIndex] of answers.entries()) {
    const option = questions[questionIndex]?.options[optionIndex]
    for (const [id, points] of Object.entries(option?.scores ?? {}))
      totals[id as AvatarId] += points
  }

  return totals
}

export function computeAvatar(answers: number[], nickname: string): AvatarId {
  const totals = sumScores(answers)
  const best = Math.max(...Object.values(totals))
  const tied = avatars.filter(avatar => totals[avatar.id] === best)
  return tied[hashString(`${nickname}|${answers.join(',')}`) % tied.length]!.id
}
