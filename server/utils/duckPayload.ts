import type { ApiDuck, AvatarId } from '~/types'
import type { NicknameError } from '~/utils/nickname'

import { avatars } from '~/data/avatars'
import { validateNickname } from '~/utils/nickname'

export type DuckInput = Omit<ApiDuck, 'createdAt'>
export type DuckRejection = 'invalid' | NicknameError
export type DuckParseResult = { duck: DuckInput } | { rejection: DuckRejection }

const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const controlPattern = /\p{Cc}/u
const zeroWidthCodes = new Set([0x200B, 0x200C, 0x200D, 0x2060, 0xFEFF])

function isVisible(character: string): boolean {
  return !controlPattern.test(character) && !zeroWidthCodes.has(character.codePointAt(0)!)
}

export function cleanNickname(value: string): string {
  return [...value.replace(/\s+/g, ' ')].filter(isVisible).join('').trim()
}

export function parseDuck(body: unknown): DuckParseResult {
  if (!body || typeof body !== 'object')
    return { rejection: 'invalid' }
  const { id, nickname, type } = body as Record<string, unknown>
  if (typeof id !== 'string' || typeof nickname !== 'string' || typeof type !== 'string')
    return { rejection: 'invalid' }
  if (!idPattern.test(id) || !avatars.some(avatar => avatar.id === type))
    return { rejection: 'invalid' }

  const cleaned = cleanNickname(nickname)
  const error = validateNickname(cleaned)
  if (error)
    return { rejection: error }
  return { duck: { id: id.toLowerCase(), nickname: cleaned, type: type as AvatarId } }
}
