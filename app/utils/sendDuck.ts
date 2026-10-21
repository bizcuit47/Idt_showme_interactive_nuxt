import type { Player } from '~/types'

export type SendDuckError = 'blocked' | 'limited' | 'failed'

export const sendDuckErrorText: Record<SendDuckError, string> = {
  blocked: 'ชื่อนี้ใช้ไม่ได้ ลองเล่นใหม่แล้วใช้ชื่อเล่นอื่นนะ',
  limited: 'ส่งถี่เกินไป รอสักครู่แล้วลองใหม่นะ',
  failed: 'ส่งเป็ดไม่สำเร็จ ลองอีกครั้งนะ',
}

export function classifySendError(error: unknown): SendDuckError {
  const { statusCode, status } = (error ?? {}) as { statusCode?: number, status?: number }
  const code = statusCode ?? status
  if (code === 422)
    return 'blocked'
  if (code === 429)
    return 'limited'
  return 'failed'
}

export async function sendDuck(player: Player): Promise<void> {
  await $fetch('/api/ducks', {
    method: 'POST',
    body: { id: player.id, nickname: player.nickname, type: player.avatarType },
  })
}
