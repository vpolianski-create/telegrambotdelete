import { motion } from 'framer-motion';
import { ACCESSORIES } from '../engine/chest';
import { useApp } from '../store/useApp';

/** Бусел — оригинальный аист в мягком векторном стиле. */
export function Mascot({ size = 120, cheer = false, accessory }: { size?: number; cheer?: boolean; accessory?: string }) {
  const equipped = useApp((s) => s.settings.accessory);
  const acc = ACCESSORIES.find((a) => a.id === (accessory ?? equipped));
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Бусел"
      animate={cheer ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] } : { y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: cheer ? 0.7 : 3, ease: 'easeInOut' }}
    >
      <ellipse cx="58" cy="76" rx="30" ry="26" fill="#ffffff" stroke="#cfd8e6" strokeWidth="2" />
      <path d="M40 78 q18 22 40 -2 q-6 -16 -20 -16 q-16 0 -20 18z" fill="#2b3445" opacity="0.9" />
      <rect x="52" y="96" width="4" height="20" rx="2" fill="#e5483f" />
      <rect x="64" y="96" width="4" height="20" rx="2" fill="#e5483f" />
      <path d="M72 62 q14 -22 10 -38" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" fill="none" />
      <circle cx="82" cy="24" r="12" fill="#ffffff" stroke="#cfd8e6" strokeWidth="2" />
      <path d="M92 22 L116 28 L92 31z" fill="#e5483f" />
      <circle cx="84" cy="21" r="2.6" fill="#1e2a3a" />
      {acc && <text x={acc.x} y={acc.y} fontSize={acc.size} textAnchor="middle">{acc.emoji}</text>}
    </motion.svg>
  );
}
