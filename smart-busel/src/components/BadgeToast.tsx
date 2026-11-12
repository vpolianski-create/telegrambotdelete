import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { play } from '../audio/sfx';
import { useApp } from '../store/useApp';

/** Небольшое окошко: новый значок, задание дня, карточка знаний. Исчезает само. */
export function BadgeToast() {
  const { toasts, popToast } = useApp();
  const toast = toasts[0];
  const key = toast ? `${toast.title}|${toast.text}` : '';

  useEffect(() => {
    if (!toast) return;
    play('badge');
    const t = setTimeout(popToast, 3500);
    return () => clearTimeout(t);
  }, [key, popToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div key={key} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
          role="status" className="fixed right-4 top-4 z-[60] flex max-w-[min(26rem,90vw)] items-center gap-3 rounded-xl3 border border-line bg-card px-5 py-3 shadow-xl">
          <span className="text-4xl">{toast.icon}</span>
          <span><b>{toast.title}</b><br />{toast.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
