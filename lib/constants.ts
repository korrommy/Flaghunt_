// TODO: ค่าคงที่ของเกม — XP ต่อ difficulty, จำนวน hint, ชื่อ rank ฯลฯ
export const XP_REWARD = {
  easy: 100,
  medium: 150,
  hard: 200,
} as const;

export const MAX_HINTS = 3;
export const AI_RATE_LIMIT_PER_MIN = 10;
