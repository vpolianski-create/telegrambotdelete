import { pick, randInt, type Rng } from './rng';

export const STICKERS = ['🦊', '🐼', '🚀', '⭐', '🏆', '🎨', '🐢', '🦉', '🐬', '🌈', '⚽', '🎸'];

export interface Accessory { id: string; emoji: string; name: string; level?: number; x: number; y: number; size: number }
/** level — открывается с этого уровня; без level — только из сундука. */
export const ACCESSORIES: Accessory[] = [
  { id: 'scarf', emoji: '🧣', name: 'Шарф', level: 2, x: 74, y: 48, size: 20 },
  { id: 'glasses', emoji: '🕶️', name: 'Очки', level: 3, x: 84, y: 28, size: 16 },
  { id: 'hat', emoji: '🎩', name: 'Шляпа', level: 5, x: 80, y: 14, size: 22 },
  { id: 'crown', emoji: '👑', name: 'Корона', level: 8, x: 80, y: 14, size: 22 },
  { id: 'bow', emoji: '🎀', name: 'Бант', x: 70, y: 18, size: 20 },
  { id: 'cap', emoji: '🧢', name: 'Кепка', x: 80, y: 14, size: 22 },
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
