import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { play } from '../audio/sfx';
import { BADGES } from '../engine/badges';
import { useApp } from '../store/useApp';

/** Небольшое окошко «Новый значок!» — исчезает само. */
export function BadgeToast() {
  const { toasts, popToast } = useApp();
  const id = toasts[0];
  const badge = BADGES.find((b) => b.id === id);

  useEffect(() => {
    if (!id) return;
    play('badge');
    const t = setTimeout(popToast, 3500);
    return () => clearTimeout(t);
  }, [id, popToast]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div key={id} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
          role="status" className="fixed left-1/2 top-4 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-xl3 bg-card px-6 py-3 shadow-xl">
          <span className="text-4xl">{badge.icon}</span>
          <span><b>Новый значок!</b><br />{badge.title}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
