import { motion, useReducedMotion } from 'framer-motion';

/**
 * Окно поверх экрана: тёмная карточка по центру со свечением.
 * Используется для награды, нового уровня, перерыва и дневного лимита.
 */
export function Celebration({ children, z = 40, label }: { children: React.ReactNode; z?: number; label: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}
      role="dialog" aria-modal="true" aria-label={label}
      className="fixed inset-0 flex items-center justify-center overflow-y-auto p-6" style={{ zIndex: z, background: 'rgba(7, 14, 29, 0.78)' }}>
      <motion.div data-theme="dark" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative flex w-full max-w-xl flex-col items-center gap-4 overflow-hidden rounded-panel border border-line bg-card p-8 text-center text-ink shadow-xl">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,124,246,0.42) 0%, rgba(69,215,242,0.18) 45%, transparent 75%)' }} />
        <div className="relative flex flex-col items-center gap-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}
