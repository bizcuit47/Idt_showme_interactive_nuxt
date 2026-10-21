import type { AvatarDef, AvatarId } from '~/types'

export const avatars: AvatarDef[] = [
  { id: 'rocket', title: 'สายบริการและสังคม', blurb: 'มีทักษะมนุษยสัมพันธ์ดีเยี่ยม ชอบช่วยเหลือ ดูแล และพัฒนาคน', color: '#ff6b6b', images: { walk: '/characters/Helper.mp4' }, framing: { x: 0.3724, y: 0.3046, width: 0.2488, height: 0.4094 }, footOffsetX: 0.02 },
  { id: 'spark', title: 'สายจัดระบบและข้อมูล', blurb: 'รักความเจ้าระเบียบ รอบคอบ แม่นยำกับตัวเลขและข้อมูล', color: '#ffb703', images: { walk: '/characters/Organize.mp4' }, framing: { x: 0.3680, y: 0.3046, width: 0.2493, height: 0.4094 }, footOffsetX: 0.055 },
  { id: 'wizard', title: 'สายผู้นำและธุรกิจ', blurb: 'กล้าเสี่ยง ชอบการแข่งขัน มีทักษะในการโน้มน้าวใจ', color: '#4cc9f0', images: { walk: '/characters/Persuader.mp4' }, framing: { x: 0.3720, y: 0.3046, width: 0.2434, height: 0.4094 }, footOffsetX: 0.04 },
  { id: 'maker', title: 'สายสร้างสรรค์และศิลปิน', blurb: 'รักอิสระ มีสุนทรียภาพ และสื่อสารไอเดียผ่านงานสร้างสรรค์', color: '#f78fb3', images: { walk: '/characters/Artistic.mp4' }, framing: { x: 0.3197, y: 0.2118, width: 0.3625, height: 0.6038 }, footOffsetX: 0.035 },
  { id: 'explorer', title: 'สายนักคิดและวิชาการ', blurb: 'ชอบตั้งคำถาม วิเคราะห์ข้อมูล และค้นคว้าหาความจริง', color: '#52d681', images: { walk: '/characters/วิจัยสึ.mp4' }, framing: { x: 0.3197, y: 0.2089, width: 0.4748, height: 0.6111 }, footOffsetX: -0.05 },
  { id: 'star', title: 'สายปฏิบัติการและเครื่องมือ', blurb: 'รักการลงมือทำ ถนัดจัดการกับสิ่งของ เครื่องจักร หรือธรรมชาติ', color: '#9b72f2', images: { walk: '/characters/Engineer.mp4' }, framing: { x: 0.3197, y: 0.2079, width: 0.4597, height: 0.6150 }, footOffsetX: -0.035 },
]

export function getAvatar(id: AvatarId): AvatarDef {
  return avatars.find(avatar => avatar.id === id) ?? avatars[0]!
}
