import { MAX_NICKNAME_LENGTH } from '~/constants'
import { blockedExactWords, blockedSubstrings } from '~/data/blockedWords'

export type NicknameError = 'empty' | 'tooLong' | 'blocked'

export const nicknameErrorText: Record<NicknameError, string> = {
  empty: 'ใส่ชื่อเล่นก่อนนะ',
  tooLong: `ชื่อเล่นยาวได้ไม่เกิน ${MAX_NICKNAME_LENGTH} ตัวอักษร`,
  blocked: 'ชื่อนี้ใช้ไม่ได้ ลองชื่อเล่นอื่นนะ',
}

const separatorPattern = /[\s._\-*+#$|,/\\]+/

function foldCharacters(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[4@]/g, 'a')
    .replace(/3/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/(.)\1{2,}/g, '$1')
}

function squash(value: string): string {
  return foldCharacters(value).replace(new RegExp(separatorPattern, 'g'), '')
}

const substringWords = blockedSubstrings.map(squash)
const exactWords = new Set(blockedExactWords.map(squash))

export function isNicknameAllowed(nickname: string): boolean {
  const whole = squash(nickname)
  const tokens = nickname
    .split(separatorPattern)
    .map(squash)
    .filter(Boolean)

  if (substringWords.some(word => whole.includes(word)))
    return false
  return !exactWords.has(whole) && !tokens.some(token => exactWords.has(token))
}

export function validateNickname(input: string): NicknameError | null {
  const nickname = input.trim()
  if (!nickname)
    return 'empty'
  if ([...nickname].length > MAX_NICKNAME_LENGTH)
    return 'tooLong'
  if (!isNicknameAllowed(nickname))
    return 'blocked'
  return null
}
