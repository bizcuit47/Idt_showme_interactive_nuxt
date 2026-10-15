import { MAX_NICKNAME_LENGTH } from '~/constants'

export type NicknameError = 'empty' | 'tooLong' | 'blocked'

const blockedWords = [
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'pussy',
  'asshole',
  'nigger',
  'nigga',
  'porn',
  'เหี้ย',
  'สัส',
  'ควย',
  'เย็ด',
  'แม่ง',
  'มึง',
  'ไอ้สัตว์',
  'อีดอก',
  'ชาติหมา',
  'ตอแหล',
  'จัญไร',
  'เฮงซวย',
  'ระยำ',
  'ส้นตีน',
  'ปากหมา',
]

export const nicknameErrorText: Record<NicknameError, string> = {
  empty: 'ใส่ชื่อเล่นก่อนนะ',
  tooLong: `ชื่อเล่นยาวได้ไม่เกิน ${MAX_NICKNAME_LENGTH} ตัวอักษร`,
  blocked: 'ชื่อนี้ใช้ไม่ได้ ลองชื่อเล่นอื่นนะ',
}

function normalizeNickname(value: string): string {
  return value
    .toLowerCase()
    .replace(/[4@]/g, 'a')
    .replace(/3/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[\s._\-*+#$]+/g, '')
}

export function isNicknameAllowed(nickname: string): boolean {
  const normalized = normalizeNickname(nickname)
  return !blockedWords.some(word => normalized.includes(word))
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
