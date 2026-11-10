import { motion } from 'framer-motion';
import mascotUrl from '../assets/mascot.png';
import { ACCESSORIES } from '../engine/chest';
import { useApp } from '../store/useApp';

/** Настроение Бусела: спокойный, радуется, думает (подсказка), поддерживает (после ошибки). */
export type Mood = 'idle' | 'cheer' | 'think' | 'support';

// Если в папку assets положить рисунки mascot-cheer.png, mascot-think.png, mascot-support.png —
// они будут показываться вместо основного рисунка для этого настроения. Код менять не нужно.
const moodImages = import.meta.glob<string>('../assets/mascot-*.png', { eager: true, import: 'default' });
const imageFor = (mood: Mood) => moodImages[`../assets/mascot-${mood}.png`] ?? mascotUrl;

const MOTION: Record<Mood, { animate: Record<string, number[]>; duration: number }> = {
  idle: { animate: { y: [0, -3, 0] }, duration: 3 },
  cheer: { animate: { y: [0, -12, 0], rotate: [0, -4, 4, 0] }, duration: 0.7 },
  think: { animate: { rotate: [0, -6, 0, 6, 0] }, duration: 2.4 },
  support: { animate: { scale: [1, 1.05, 1] }, duration: 1.6 },
};
const MOOD_SIGN: Record<Mood, string> = { idle: '', cheer: '🎉', think: '💡', support: '💪' };

/** Бусел — главный герой бренда. Выбранное украшение показывается значком в углу. */
export function Mascot({ size = 120, cheer = false, mood, accessory }: { size?: number; cheer?: boolean; mood?: Mood; accessory?: string }) {
  const equipped = useApp((s) => s.settings.accessory);
  const acc = ACCESSORIES.find((a) => a.id === (accessory ?? equipped));
  const m: Mood = mood ?? (cheer ? 'cheer' : 'idle');
  const badge = (emoji: string, pos: React.CSSProperties) => (
    <span aria-hidden style={{
      position: 'absolute', width: size * 0.38, height: size * 0.38, fontSize: size * 0.24,
      background: 'var(--card)', boxShadow: '0 2px 6px rgba(0,0,0,.3)', ...pos,
    }} className="flex items-center justify-center rounded-full">{emoji}</span>
  );
  return (
    <motion.div
      role="img" aria-label="Бусел" style={{ width: size, height: size, flexShrink: 0, position: 'relative' }}
      animate={MOTION[m].animate} transition={{ repeat: Infinity, duration: MOTION[m].duration, ease: 'easeInOut' }}
    >
      <img src={imageFor(m)} alt="" width={size} height={size} draggable={false} style={{ width: size, height: size }} />
      {MOOD_SIGN[m] && badge(MOOD_SIGN[m], { right: -size * 0.05, top: -size * 0.05 })}
      {acc && badge(acc.emoji, { right: -size * 0.05, bottom: -size * 0.05 })}
    </motion.div>
  );
}
