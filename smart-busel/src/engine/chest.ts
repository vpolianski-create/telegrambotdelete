import { pick, randInt, type Rng } from './rng';

export const STICKERS = ['🦊', '🐼', '🚀', '⭐', '🏆', '🎨', '🐢', '🦉', '🐬', '🌈', '⚽', '🎸'];

export interface Accessory { id: string; emoji: string; name: string; level?: number }
/** Значок-украшение рядом с Буселом. level — открывается с этого уровня; без level — только из сундука. (id старых нарядов сохранены, чтобы не терять прогресс.) */
export const ACCESSORIES: Accessory[] = [
  { id: 'scarf', emoji: '⭐', name: 'Звезда', level: 2 },
  { id: 'glasses', emoji: '🚀', name: 'Ракета', level: 3 },
  { id: 'hat', emoji: '🏅', name: 'Медаль', level: 5 },
  { id: 'crown', emoji: '👑', name: 'Корона', level: 8 },
  { id: 'bow', emoji: '🎀', name: 'Бант' },
  { id: 'rainbow', emoji: '🌈', name: 'Радуга' },
];

export type ChestResult =
  | { kind: 'points'; amount: number }
  | { kind: 'sticker'; id: string }
  | { kind: 'accessory'; id: string };

export function openChest(rng: Rng, stickers: string[], chestAccessories: string[]): ChestResult {
  const newStickers = STICKERS.filter((s) => !stickers.includes(s));
  const newAcc = ACCESSORIES.filter((a) => a.level === undefined && !chestAccessories.includes(a.id));
  const r = rng();
  if (r < 0.45 && newStickers.length) return { kind: 'sticker', id: pick(rng, newStickers) };
  if (r < 0.6 && newAcc.length) return { kind: 'accessory', id: pick(rng, newAcc).id };
  return { kind: 'points', amount: randInt(rng, 2, 6) * 5 };
}

export function unlockedAccessories(level: number, chestAccessories: string[]): string[] {
  return ACCESSORIES.filter((a) => (a.level !== undefined ? level >= a.level : chestAccessories.includes(a.id))).map((a) => a.id);
}
