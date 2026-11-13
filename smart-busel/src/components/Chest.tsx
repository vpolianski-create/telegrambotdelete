import { motion, useReducedMotion } from 'framer-motion';
import { ACCESSORIES, type ChestResult } from '../engine/chest';

/** Рисунок сундука: закрытый или открытый со свечением. Только внешний вид — что выпадет, решает engine/chest.ts. */
export function ChestArt({ open = false, size = 56 }: { open?: boolean; size?: number }) {
  const box = `${size / 16}rem`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden focusable="false" className="shrink-0" style={{ width: box, height: box }}>
      {open ? (
        <>
          <path d="M11 27 15 9h34l4 18z" fill="#5B4BC4" />
          <path d="M15 9h34l1.2 5H13.8z" fill="#F6C453" />
          <ellipse cx="32" cy="28" rx="21" ry="7" fill="#FFE7A3" />
          <path d="M32 14l1.6 4.4L38 20l-4.4 1.6L32 26l-1.6-4.4L26 20l4.4-1.600zM46 12l.9 2.6 2.6.900-2.6.900L46 19l-.9-2.6-2.6-.900 2.6-.900zM19 15l.8 2.2 2.2.800-2.2.800L19 21l-.8-2.2-2.2-.800 2.2-.800z" fill="#F6C453" />
        </>
      ) : (
        <>
          <path d="M8 29v-7a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v7z" fill="#8B7CF6" />
          <path d="M16 10.700h5V29h-5zM43 10.700h5V29h-5z" fill="#F6C453" />
        </>
      )}
      <rect x="8" y="28" width="48" height="26" rx="4" fill="#6C5CE7" />
      <path d="M16 28h5v26h-5zM43 28h5v26h-5z" fill="#F6C453" />
      <rect x="8" y="27" width="48" height="5" fill="#F6C453" />
      {!open && <><rect x="26.5" y="24" width="11" height="13" rx="2.5" fill="#F6C453" stroke="#11152A" strokeWidth="1.5" /><circle cx="32" cy="29.5" r="1.8" fill="#11152A" /><path d="M31.2 30h1.600v3.500h-1.600z" fill="#11152A" /></>}
    </svg>
  );
}

/** Кнопка «Открыть сундук». */
export function ChestButton({ label, onOpen }: { label: string; onOpen(): void }) {
  const reduce = useReducedMotion();
  return (
    <motion.button onClick={onOpen} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}
      className="flex min-h-touch items-center gap-3 self-center rounded-xl3 bg-sun px-6 py-2 text-lg font-bold text-navy">
      <ChestArt size={48} /> {label}
    </motion.button>
  );
}

/** Что выпало из сундука. */
export function ChestPrize({ result, mascot = false }: { result: ChestResult; mascot?: boolean }) {
  const reduce = useReducedMotion();
  const acc = result.kind === 'accessory' ? ACCESSORIES.find((a) => a.id === result.id) : undefined;
  return (
    <motion.div role="status" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}
      className="flex items-center gap-4 self-center rounded-xl3 border border-sun bg-sun/15 px-5 py-3 text-left">
      <ChestArt open size={56} />
      <p className="text-lg font-bold">
        {result.kind === 'sticker' && <>В сундуке стикер <span className="text-2xl">{result.id}</span>!</>}
        {result.kind === 'accessory' && <>В сундуке украшение{mascot ? ' Бусела' : ''}: <span className="text-2xl">{acc?.emoji}</span> {acc?.name}!</>}
        {result.kind === 'points' && `В сундуке +${result.amount} баллов!`}
      </p>
    </motion.div>
  );
}
