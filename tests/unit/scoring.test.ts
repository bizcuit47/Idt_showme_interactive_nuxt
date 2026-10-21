import { describe, expect, it } from 'vitest'
import { avatars } from '~/data/avatars'
import { questions } from '~/data/questions'
import { computeAvatar } from '~/utils/scoring'

function answersFor(optionIndex: number): number[] {
  return questions.map(() => optionIndex)
}

describe('computeAvatar', () => {
  it('returns a valid avatar id', () => {
    const ids = avatars.map(avatar => avatar.id)
    expect(ids).toContain(computeAvatar(answersFor(0), 'มะลิ'))
  })

  it('is deterministic for the same nickname and answers', () => {
    const answers = [0, 1, 2, 3, 0, 1]
    expect(computeAvatar(answers, 'มะลิ')).toBe(computeAvatar(answers, 'มะลิ'))
  })

  it('picks the avatar with the highest total score', () => {
    const answers = answersFor(0)
    const totals: Record<string, number> = {}
    for (const [questionIndex, optionIndex] of answers.entries()) {
      for (const [id, points] of Object.entries(questions[questionIndex]!.options[optionIndex]!.scores))
        totals[id] = (totals[id] ?? 0) + points
    }
    const best = Math.max(...Object.values(totals))
    const winners = Object.keys(totals).filter(id => totals[id] === best)

    expect(winners).toContain(computeAvatar(answers, 'x'))
  })

  it('only breaks ties between avatars that share the top score', () => {
    const answers = answersFor(1)
    const totals: Record<string, number> = {}
    for (const [questionIndex, optionIndex] of answers.entries()) {
      for (const [id, points] of Object.entries(questions[questionIndex]!.options[optionIndex]!.scores))
        totals[id] = (totals[id] ?? 0) + points
    }
    const best = Math.max(...Object.values(totals))
    const winners = Object.keys(totals).filter(id => totals[id] === best)

    for (const nickname of ['a', 'b', 'c', 'มะลิ', 'ใบเตย', 'Mai', 'Pun'])
      expect(winners).toContain(computeAvatar(answers, nickname))
  })

  it('ignores answers that do not match any option', () => {
    expect(computeAvatar([99, -1, 7], 'x')).toBeTypeOf('string')
    expect(computeAvatar([], 'x')).toBeTypeOf('string')
  })

  it('can produce every avatar for some combination of answers', () => {
    const reached = new Set<string>()
    const optionCount = questions[0]!.options.length

    for (let seed = 0; seed < 4 ** 6; seed++) {
      const answers = questions.map((_, index) => Math.floor(seed / optionCount ** index) % optionCount)
      reached.add(computeAvatar(answers, `n${seed}`))
    }

    expect([...reached].sort()).toEqual(avatars.map(avatar => avatar.id).sort())
  })
})
