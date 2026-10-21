import type { AvatarDef, AvatarId } from '~/types'

export const avatars: AvatarDef[] = [
  { id: 'rocket', title: 'ห่านจรวดสตาร์ทอัป', blurb: 'กล้าฝัน กล้าลุย พร้อมปล่อยไอเดียขึ้นสู่อวกาศ', color: '#ff6b6b', images: { walk: '/characters/Helper.mov' }, framing: { x: 0.3724, y: 0.3046, width: 0.2488, height: 0.4094 } },
  { id: 'spark', title: 'ห่านประกายสร้างสรรค์', blurb: 'คิดนอกกรอบ เปลี่ยนทุกอย่างให้เป็นงานศิลป์', color: '#ffb703', images: { walk: '/characters/Organize.MOV' }, framing: { x: 0.3680, y: 0.3363, width: 0.2493, height: 0.3635 } },
  { id: 'wizard', title: 'ห่านจอมเวทเทคโนโลยี', blurb: 'เสกโค้ดและข้อมูลให้กลายเป็นนวัตกรรม', color: '#4cc9f0', images: { walk: '/characters/Persuader.mov' }, framing: { x: 0.3720, y: 0.3348, width: 0.2434, height: 0.3694 } },
  { id: 'maker', title: 'ห่านนักสร้างผลกระทบ', blurb: 'ใช้ความใส่ใจเปลี่ยนโลกให้ดีขึ้นทีละนิด', color: '#f78fb3', images: { walk: '/characters/Article.mov' }, framing: { x: 0.3197, y: 0.2118, width: 0.3625, height: 0.6038 } },
  { id: 'explorer', title: 'ห่านนักสำรวจอนาคต', blurb: 'สงสัยทุกเรื่อง และไม่หยุดหาคำตอบใหม่ ๆ', color: '#52d681', images: { walk: '/characters/วิจัยสึ.mov' }, framing: { x: 0.3197, y: 0.2089, width: 0.4748, height: 0.6111 } },
  { id: 'star', title: 'ห่านซูเปอร์สตาร์', blurb: 'เกิดมาเพื่อเป็นจุดสนใจและเล่าเรื่องให้คนทั้งโลกฟัง', color: '#9b72f2', images: { walk: '/characters/Engineer.mov' }, framing: { x: 0.3197, y: 0.2079, width: 0.4597, height: 0.6150 } },
]

export function getAvatar(id: AvatarId): AvatarDef {
  return avatars.find(avatar => avatar.id === id) ?? avatars[0]!
}
