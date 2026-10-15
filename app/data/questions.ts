import type { Question } from '~/types'

export const questions: Question[] = [
  {
    text: 'วันหยุดยาว คุณอยากทำอะไรมากที่สุด?',
    options: [
      { label: 'ลองทำโปรเจกต์ของตัวเอง', scores: { rocket: 2, wizard: 1 } },
      { label: 'วาดรูป ถ่ายคลิป ทำคอนเทนต์', scores: { spark: 2, star: 1 } },
      { label: 'ไปเป็นอาสาสมัครช่วยคนอื่น', scores: { maker: 2, explorer: 1 } },
      { label: 'ไปเที่ยวที่ใหม่ ๆ ที่ไม่เคยไป', scores: { explorer: 2, spark: 1 } },
    ],
  },
  {
    text: 'เพื่อนในกลุ่มมักเรียกคุณว่าอะไร?',
    options: [
      { label: 'ผู้นำ ชวนทุกคนลุย', scores: { rocket: 2, star: 1 } },
      { label: 'สายครีเอทีฟ ไอเดียพุ่ง', scores: { spark: 2 } },
      { label: 'สายเทค แก้ปัญหาเก่ง', scores: { wizard: 2, explorer: 1 } },
      { label: 'คนใจดี ที่พึ่งของทุกคน', scores: { maker: 2, star: 1 } },
    ],
  },
  {
    text: 'ถ้ามีเงินทุนก้อนแรก 100,000 บาท คุณจะ…',
    options: [
      { label: 'เปิดธุรกิจของตัวเองทันที', scores: { rocket: 3 } },
      { label: 'ทำสตูดิโอหรือแบรนด์ของตัวเอง', scores: { spark: 2, star: 1 } },
      { label: 'ลงทุนกับอุปกรณ์และคอร์สเรียนรู้', scores: { wizard: 2, explorer: 1 } },
      { label: 'ตั้งโครงการเพื่อสังคม', scores: { maker: 3 } },
    ],
  },
  {
    text: 'คุณชอบงานแบบไหนมากที่สุด?',
    options: [
      { label: 'งานที่ได้ตัดสินใจและรับผิดชอบเอง', scores: { rocket: 2, maker: 1 } },
      { label: 'งานที่ได้คิดและออกแบบอะไรใหม่ ๆ', scores: { spark: 2, wizard: 1 } },
      { label: 'งานที่ได้ทดลอง วิจัย ค้นหาคำตอบ', scores: { explorer: 2, wizard: 1 } },
      { label: 'งานที่ได้อยู่หน้ากล้องหรือบนเวที', scores: { star: 3 } },
    ],
  },
  {
    text: 'เมื่อเจอปัญหายาก ๆ คุณทำอย่างไร?',
    options: [
      { label: 'หาทางลัดที่เร็วที่สุด', scores: { rocket: 2, wizard: 1 } },
      { label: 'ลองวิธีแปลก ๆ ที่ไม่มีใครคิด', scores: { spark: 2, explorer: 1 } },
      { label: 'ค้นคว้าข้อมูลจนเข้าใจรากของปัญหา', scores: { explorer: 2, wizard: 2 } },
      { label: 'ชวนเพื่อนมาช่วยกันแก้', scores: { maker: 2, star: 1 } },
    ],
  },
  {
    text: 'อีก 10 ปีข้างหน้า คุณอยากให้คนจดจำคุณว่าเป็นใคร?',
    options: [
      { label: 'ผู้ก่อตั้งบริษัทที่เปลี่ยนวงการ', scores: { rocket: 3, wizard: 1 } },
      { label: 'ศิลปินหรือครีเอเตอร์ที่มีสไตล์เฉพาะตัว', scores: { spark: 2, star: 2 } },
      { label: 'ผู้คิดค้นสิ่งที่ช่วยคนได้ทั้งโลก', scores: { wizard: 2, maker: 2, explorer: 1 } },
      { label: 'คนที่สร้างแรงบันดาลใจให้คนอื่น', scores: { star: 2, maker: 2 } },
    ],
  },
]
