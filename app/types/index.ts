export type AvatarId = 'rocket' | 'spark' | 'wizard' | 'maker' | 'explorer' | 'star'

export interface AvatarImages {
  walk: string
  stand?: string
  walk2?: string
  prop?: string
}

export interface AvatarFraming {
  x: number
  y: number
  width: number
  height: number
}

export interface AvatarDef {
  id: AvatarId
  title: string
  blurb: string
  color: string
  images?: AvatarImages
  framing?: AvatarFraming
}

export interface QuestionOption {
  label: string
  scores: Partial<Record<AvatarId, number>>
}

export interface Question {
  text: string
  options: QuestionOption[]
}

export interface Player {
  id: string
  nickname: string
  avatarType: AvatarId
  answers: number[]
  createdAt: string
}

export interface WalkBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}
