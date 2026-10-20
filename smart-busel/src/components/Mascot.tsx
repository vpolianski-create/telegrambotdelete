import { motion } from 'framer-motion';
import mascotUrl from '../assets/mascot.png';
import { ACCESSORIES } from '../engine/chest';
import { useApp } from '../store/useApp';

/** Бусел — главный герой бренда. Выбранное украшение показывается значком в углу. */
export function Mascot({ size = 120, cheer = false, accessory }: { size?: number; cheer?: boolean; accessory?: string }) {
  const equipped = useApp((s) => s.settings.accessory);
  const acc = ACCESSORIES.find((a) => a.id === (accessory ?? equipped));
  return (
    <motion.div
      role="img" aria-label="Бусел" style={{ width: size, height: size, flexShrink: 0, position: 'relative' }}
      animate={cheer ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] } : { y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: cheer ? 0.7 : 3, ease: 'easeInOut' }}
    >
      <img src={mascotUrl} alt="" width={size} height={size} draggable={false} style={{ width: size, height: size }} />
      {acc && (
        <span aria-hidden style={{
          position: 'absolute', right: -size * 0.05, bottom: -size * 0.05, width: size * 0.38, height: size * 0.38,
          fontSize: size * 0.24, background: 'var(--card)', boxShadow: '0 2px 6px rgba(0,0,0,.3)',
        }} className="flex items-center justify-center rounded-full">{acc.emoji}</span>
      )}
    </motion.div>
  );
}
