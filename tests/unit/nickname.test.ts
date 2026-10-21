import { describe, expect, it } from 'vitest'
import { MAX_NICKNAME_LENGTH } from '~/constants'
import { isNicknameAllowed, validateNickname } from '~/utils/nickname'

describe('validateNickname', () => {
  it('accepts normal Thai and English nicknames', () => {
    for (const name of ['มะลิ', 'ใบเตย', 'น้องส้ม', 'Mai', 'Jim', 'จิม', 'มงคล', 'แมงมุม'])
      expect(validateNickname(name), name).toBeNull()
  })

  it('rejects empty and whitespace-only input', () => {
    expect(validateNickname('')).toBe('empty')
    expect(validateNickname('   ')).toBe('empty')
  })

  it('trims surrounding spaces before checking', () => {
    expect(validateNickname('  มะลิ  ')).toBeNull()
  })

  it('allows exactly the maximum length and rejects one more', () => {
    expect(validateNickname('a'.repeat(MAX_NICKNAME_LENGTH))).toBeNull()
    expect(validateNickname('a'.repeat(MAX_NICKNAME_LENGTH + 1))).toBe('tooLong')
  })

  it('reports blocked words with the blocked error', () => {
    expect(validateNickname('fuck')).toBe('blocked')
  })
})

describe('isNicknameAllowed', () => {
  it('blocks the words requested for the event', () => {
    const requested = ['จู๋', 'หี', 'ควย', 'แตด', 'สัส', 'หน้าหี', 'ส้นตีน', 'Dig', 'Nigka', 'pussy', 'dick']
    for (const word of requested)
      expect(isNicknameAllowed(word), word).toBe(false)
  })

  it('ignores case', () => {
    expect(isNicknameAllowed('FUCK')).toBe(false)
    expect(isNicknameAllowed('PuSsY')).toBe(false)
  })

  it('sees through separators', () => {
    expect(isNicknameAllowed('f.u.c.k')).toBe(false)
    expect(isNicknameAllowed('p u s s y')).toBe(false)
    expect(isNicknameAllowed('f_u-c*k')).toBe(false)
  })

  it('sees through common leetspeak', () => {
    expect(isNicknameAllowed('sh1t')).toBe(false)
    expect(isNicknameAllowed('a55')).toBe(false)
    expect(isNicknameAllowed('n1gka')).toBe(false)
    expect(isNicknameAllowed('d1ck')).toBe(false)
  })

  it('sees through stretched letters', () => {
    expect(isNicknameAllowed('fuuuuck')).toBe(false)
    expect(isNicknameAllowed('ควยยยย')).toBe(false)
    expect(isNicknameAllowed('เหี้ยยย')).toBe(false)
  })

  it('blocks a banned word inside a longer name', () => {
    expect(isNicknameAllowed('น้องจู๋')).toBe(false)
    expect(isNicknameAllowed('xxfuckxx')).toBe(false)
  })

  it('blocks short words only when they stand alone', () => {
    expect(isNicknameAllowed('sex')).toBe(false)
    expect(isNicknameAllowed('S E X')).toBe(false)
    expect(isNicknameAllowed('น้อง กู')).toBe(false)
    expect(isNicknameAllowed('Essex')).toBe(true)
    expect(isNicknameAllowed('Sussex')).toBe(true)
    expect(isNicknameAllowed('Dickson')).toBe(true)
    expect(isNicknameAllowed('Digital')).toBe(true)
    expect(isNicknameAllowed('Assam')).toBe(true)
    expect(isNicknameAllowed('หีบ')).toBe(true)
  })

  it('does not block unrelated names that only look similar', () => {
    expect(isNicknameAllowed('Nigeria')).toBe(true)
    expect(isNicknameAllowed('Grape')).toBe(true)
    expect(isNicknameAllowed('จูน')).toBe(true)
    expect(isNicknameAllowed('สัดส่วน')).toBe(true)
  })
})
