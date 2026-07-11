// Non-linear progression — harder to level up over time (ตาม CLAUDE.md)
export const getLevel = (xp: number): number =>
  Math.floor(Math.sqrt(xp / 100)) + 1;

export const getXPForNextLevel = (level: number): number =>
  Math.pow(level, 2) * 100;

export interface XPProgress {
  level: number;
  current: number;
  needed: number;
  percent: number;
}

export const getXPProgress = (xp: number): XPProgress => {
  const level = getLevel(xp);
  const prevXP = Math.pow(level - 1, 2) * 100;
  const nextXP = getXPForNextLevel(level);
  const current = xp - prevXP;
  const needed = nextXP - prevXP;
  return { level, current, needed, percent: Math.round((current / needed) * 100) };
};
