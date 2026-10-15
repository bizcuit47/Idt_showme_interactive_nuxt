export type AvatarId = 'rocket' | 'spark' | 'wizard' | 'maker' | 'explorer' | 'star'

export interface AvatarImages {
  walk: string
  stand?: string
  walk2?: string
  prop?: string
}

export interface AvatarDef {
  id: AvatarId
  title: string
  blurb: string
  color: string
  images?: AvatarImages
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
