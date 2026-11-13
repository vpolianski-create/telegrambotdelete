import art from '../assets/brand/subject-art.webp';
import english from '../assets/brand/subject-english.webp';
import history from '../assets/brand/subject-history.webp';
import krugozor from '../assets/brand/subject-krugozor.webp';
import math from '../assets/brand/subject-math.webp';
import world from '../assets/brand/subject-world.webp';

// Картинки и цвета предметов подключаются по id предмета; поле icon в контенте не трогаем.
const ART: Record<string, string> = { math, history, world, english, art, krugozor };

/** Картинка предмета. Если её нет (новый предмет) — undefined, и интерфейс покажет эмодзи из контента. */
export const subjectArt = (id: string): string | undefined => ART[id];

/**
 * Цвет предмета: насыщенная метка и приглушённая подложка (14 %).
 * Для известных предметов — токены --subj-* из index.css (свои для светлой и тёмной темы),
 * для остальных — цвет из контента.
 */
export function subjectTone(id: string, fallback: string): { mark: string; tint: string; line: string } {
  if (ART[id]) return { mark: `rgb(var(--subj-${id}))`, tint: `rgb(var(--subj-${id}) / 0.14)`, line: `rgb(var(--subj-${id}) / 0.4)` };
  return { mark: fallback, tint: `color-mix(in srgb, ${fallback} 14%, transparent)`, line: `color-mix(in srgb, ${fallback} 40%, transparent)` };
}
