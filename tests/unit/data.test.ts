import { describe, expect, it } from 'vitest'
import { avatars, getAvatar } from '~/data/avatars'
import { blockedExactWords, blockedSubstrings } from '~/data/blockedWords'
import { questions } from '~/data/questions'

describe('avatars', () => {
  it('has unique ids', () => {
    const ids = avatars.map(avatar => avatar.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has a title, blurb and hex colour for every avatar', () => {
    for (const avatar of avatars) {
      expect(avatar.title, avatar.id).not.toBe('')
      expect(avatar.blurb, avatar.id).not.toBe('')
      expect(avatar.color, avatar.id).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('looks avatars up by id and falls back to the first one', () => {
    expect(getAvatar('star').id).toBe('star')
    expect(getAvatar('unknown' as never).id).toBe(avatars[0]!.id)
  })
})

describe('questions', () => {
  it('has the same number of options on every question', () => {
    const counts = new Set(questions.map(question => question.options.length))
    expect(counts.size).toBe(1)
  })

  it('has text and at least two options per question', () => {
    for (const question of questions) {
      expect(question.text).not.toBe('')
      expect(question.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('only scores existing avatars with positive points', () => {
    const ids = new Set(avatars.map(avatar => avatar.id))
    for (const question of questions) {
      for (const option of question.options) {
        expect(option.label).not.toBe('')
        expect(Object.keys(option.scores).length).toBeGreaterThan(0)
        for (const [id, points] of Object.entries(option.scores)) {
          expect(ids.has(id as never), id).toBe(true)
          expect(points).toBeGreaterThan(0)
        }
      }
    }
  })

  it('gives every avatar points somewhere', () => {
    const scored = new Set<string>()
    for (const question of questions) {
      for (const option of question.options) {
        for (const id of Object.keys(option.scores))
          scored.add(id)
      }
    }
    expect([...scored].sort()).toEqual(avatars.map(avatar => avatar.id).sort())
  })
})

describe('blocked words', () => {
  it('has no empty or duplicate entries', () => {
    for (const list of [blockedSubstrings, blockedExactWords]) {
      expect(list.every(word => word.trim() !== '')).toBe(true)
      expect(new Set(list).size).toBe(list.length)
    }
  })

  it('does not list a word in both lists', () => {
    const exact = new Set(blockedExactWords)
    expect(blockedSubstrings.filter(word => exact.has(word))).toEqual([])
  })
})
