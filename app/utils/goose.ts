import type { AvatarDef, AvatarId } from '~/types'

export type GoosePose = 'walk' | 'walk2' | 'stand'

const ink = '#1b1b2f'

function propFor(id: AvatarId, color: string): string {
  switch (id) {
    case 'rocket':
      return `
    <g transform="rotate(-18 120 300)">
      <path d="M92 250 L120 200 L148 250 L148 330 L92 330 Z" fill="${color}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="120" cy="268" r="12" fill="#bdeaff" stroke="${ink}" stroke-width="5"/>
      <path d="M92 300 L72 335 L92 330 Z M148 300 L168 335 L148 330 Z" fill="#fff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 330 L120 385 L140 330 Z" fill="#ffd166" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
    </g>`
    case 'spark':
      return `
    <ellipse cx="320" cy="122" rx="62" ry="26" fill="${color}" stroke="${ink}" stroke-width="6"/>
    <circle cx="320" cy="92" r="9" fill="${color}" stroke="${ink}" stroke-width="5"/>
    <g transform="rotate(25 215 335)"><rect x="205" y="290" width="14" height="90" rx="6" fill="#8d5a3b" stroke="${ink}" stroke-width="5"/>
    <path d="M205 290 L219 290 L212 262 Z" fill="${color}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/></g>`
    case 'wizard':
      return `
    <circle cx="352" cy="190" r="30" fill="none" stroke="${ink}" stroke-width="7"/>
    <circle cx="352" cy="190" r="22" fill="#e9fbff" fill-opacity=".7"/>
    <path d="M262 170 Q282 110 340 108 Q392 110 408 150" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
    <rect x="248" y="162" width="22" height="46" rx="10" fill="${color}" stroke="${ink}" stroke-width="5"/>`
    case 'maker':
      return `
    <path d="M250 330 C205 300 215 262 250 280 C285 262 295 300 250 330 Z" fill="${color}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>`
    case 'explorer':
      return `
    <path d="M262 150 Q340 100 420 150" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
    <circle cx="318" cy="150" r="26" fill="#e9fbff" stroke="${ink}" stroke-width="7"/>
    <circle cx="378" cy="156" r="26" fill="#e9fbff" stroke="${ink}" stroke-width="7"/>
    <rect x="334" y="138" width="28" height="12" fill="${color}" stroke="${ink}" stroke-width="5"/>`
    case 'star':
      return `
    <path d="M330 60 L342 92 L376 94 L350 114 L359 147 L330 129 L301 147 L310 114 L284 94 L318 92 Z" fill="#ffd166" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M296 300 L330 318 L296 336 Z M364 300 L330 318 L364 336 Z" fill="${color}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>`
  }
}

export function gooseSvg(avatar: Pick<AvatarDef, 'id' | 'color'>, pose: GoosePose = 'walk'): string {
  const stride = pose === 'stand' ? 0 : pose === 'walk' ? 26 : -26
  const leftFoot = 205 + stride
  const rightFoot = 265 - stride

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g stroke="${ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M${leftFoot - 8} 410 L${leftFoot + 8} 450 M${rightFoot - 8} 410 L${rightFoot + 8} 450" fill="none" stroke="#ff9f1c" stroke-width="12"/>
    <path d="M${leftFoot - 14} 456 Q${leftFoot + 20} 440 ${leftFoot + 44} 456 Q${leftFoot + 20} 470 ${leftFoot - 14} 456 Z" fill="#ff9f1c"/>
    <path d="M${rightFoot - 14} 456 Q${rightFoot + 20} 440 ${rightFoot + 44} 456 Q${rightFoot + 20} 470 ${rightFoot - 14} 456 Z" fill="#ff9f1c"/>
    <path d="M118 330 Q70 305 62 270 Q108 280 140 300 Z" fill="#fff"/>
    <ellipse cx="235" cy="330" rx="125" ry="95" fill="#fff"/>
    <path d="M300 250 Q330 215 335 160 L385 170 Q375 250 340 295 Z" fill="#fff" stroke="none"/>
    <circle cx="352" cy="165" r="78" fill="#fff"/>
    <path d="M262 350 Q300 315 335 345 Q300 390 262 350 Z" fill="#f1f1f8"/>
    <ellipse cx="175" cy="325" rx="52" ry="38" fill="#eef0ff" transform="rotate(-12 175 325)"/>
    <path d="M410 168 Q460 168 468 190 Q455 214 410 205 Z" fill="#ff9f1c"/>
    <path d="M412 188 L460 192" fill="none" stroke-width="4"/>
  </g>
  <path d="M286 262 Q336 292 392 252 L392 238 Q335 262 292 232 Z" fill="${avatar.color}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="378" cy="158" r="11" fill="${ink}"/>
  <circle cx="382" cy="154" r="4" fill="#fff"/>
  <circle cx="394" cy="195" r="11" fill="#ff9fb2" fill-opacity=".7"/>
  ${propFor(avatar.id, avatar.color)}
</svg>`
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function avatarImageUrl(avatar: AvatarDef, pose: GoosePose = 'walk'): string {
  const images = avatar.images
  if (!images)
    return svgToDataUri(gooseSvg(avatar, pose))
  if (pose === 'stand')
    return images.stand ?? images.walk
  if (pose === 'walk2')
    return images.walk2 ?? images.walk
  return images.walk
}
