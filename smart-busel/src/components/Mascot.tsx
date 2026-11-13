import { motion, useReducedMotion } from 'framer-motion';
import cheerUrl from '../assets/brand/mascot-cheer.webp';
import encourageUrl from '../assets/brand/mascot-encourage.webp';
import readUrl from '../assets/brand/mascot-read.webp';
import restUrl from '../assets/brand/mascot-rest.webp';
import thinkUrl from '../assets/brand/mascot-think.webp';
import waveUrl from '../assets/brand/mascot-wave.webp';
import { ACCESSORIES } from '../engine/chest';
import { useApp } from '../store/useApp';

/**
 * Настроение Бусела — у каждого своя поза:
 * idle — приветствует, cheer — радуется (награда, тема пройдена), think — думает (подсказка),
 * support — подбадривает (после ошибки), read — читает (объяснение, словарь, пустые экраны), rest — отдыхает (перерыв).
 */
export type Mood = 'idle' | 'cheer' | 'think' | 'support' | 'read' | 'rest';

const IMAGES: Record<Mood, string> = {
  idle: waveUrl, cheer: cheerUrl, think: thinkUrl, support: encourageUrl, read: readUrl, rest: restUrl,
};
/** Ширина фигуры в долях высоты: картинки квадратные, но аист в них узкий — так рядом с ним не остаётся пустоты. */
const WIDTH: Record<Mood, number> = { idle: 0.7, cheer: 0.9, think: 0.58, support: 0.74, read: 0.58, rest: 0.64 };

/** Бусел — главный герой бренда. Поза показывает настроение; выбранное украшение — значком в углу. */
export function Mascot({ size = 120, cheer = false, mood, accessory }: { size?: number; cheer?: boolean; mood?: Mood; accessory?: string }) {
  const equipped = useApp((s) => s.settings.accessory);
  const reduce = useReducedMotion();
  const acc = ACCESSORIES.find((a) => a.id === (accessory ?? equipped));
  const m: Mood = mood ?? (cheer ? 'cheer' : 'idle');
  const width = size * WIDTH[m];
  return (
    <motion.div
      key={m} role="img" aria-label="Бусел" style={{ width, height: size, flexShrink: 0, position: 'relative' }}
      // одно короткое появление, без постоянного покачивания; при «уменьшить движение» — только плавное проявление
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <img src={IMAGES[m]} alt="" width={size} height={size} draggable={false}
        style={{ position: 'absolute', top: 0, left: (width - size) / 2, width: size, height: size, maxWidth: 'none' }} />
      {acc && (
        <span aria-hidden style={{
          position: 'absolute', right: -size * 0.06, bottom: 0, width: size * 0.3, height: size * 0.3, fontSize: size * 0.18,
          background: 'var(--card)', border: '1px solid var(--line)',
        }} className="flex items-center justify-center rounded-full">{acc.emoji}</span>
      )}
    </motion.div>
  );
}
