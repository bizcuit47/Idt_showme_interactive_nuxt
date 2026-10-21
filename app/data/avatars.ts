import type { AvatarDef, AvatarId } from '~/types'

export const avatars: AvatarDef[] = [
  { id: 'rocket', title: 'ห่านจรวดสตาร์ทอัป', blurb: 'กล้าฝัน กล้าลุย พร้อมปล่อยไอเดียขึ้นสู่อวกาศ', color: '#ff6b6b', images: { walk: '/characters/Helper.mov' } },
  { id: 'spark', title: 'ห่านประกายสร้างสรรค์', blurb: 'คิดนอกกรอบ เปลี่ยนทุกอย่างให้เป็นงานศิลป์', color: '#ffb703', images: { walk: '/characters/Organize.mov' } },
  { id: 'wizard', title: 'ห่านจอมเวทเทคโนโลยี', blurb: 'เสกโค้ดและข้อมูลให้กลายเป็นนวัตกรรม', color: '#4cc9f0', images: { walk: '/characters/Persuader.mov' } },
  { id: 'maker', title: 'ห่านนักสร้างผลกระทบ', blurb: 'ใช้ความใส่ใจเปลี่ยนโลกให้ดีขึ้นทีละนิด', color: '#f78fb3', images: { walk: '/characters/Article.mov' } },
  { id: 'explorer', title: 'ห่านนักสำรวจอนาคต', blurb: 'สงสัยทุกเรื่อง และไม่หยุดหาคำตอบใหม่ ๆ', color: '#52d681', images: { walk: '/characters/วิจัยสึ.mov' } },
  { id: 'star', title: 'ห่านซูเปอร์สตาร์', blurb: 'เกิดมาเพื่อเป็นจุดสนใจและเล่าเรื่องให้คนทั้งโลกฟัง', color: '#9b72f2', images: { walk: '/characters/Engineer.mov' } },
]

export function getAvatar(id: AvatarId): AvatarDef {
  return avatars.find(avatar => avatar.id === id) ?? avatars[0]!
}
