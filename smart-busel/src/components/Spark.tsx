import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'framer-motion';

const COLORS = ['#F6C453', '#A495FF', '#45D7F2'];

/**
 * «Искра» — эффект награды: короткая вспышка и десяток частиц возле аиста, один раз, меньше секунды.
 * При «уменьшить движение» не показывается ничего: содержимое просто появляется.
 */
export function Spark({ children, fire = true }: { children: React.ReactNode; fire?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const on = fire && !reduce;

  useEffect(() => {
    if (!on || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    void confetti({
      particleCount: 10, spread: 75, startVelocity: 16, gravity: 0.9, scalar: 0.7, ticks: 55, colors: COLORS,
      origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.45) / window.innerHeight },
      disableForReducedMotion: true, zIndex: 80,
    });
  }, [on]);

  return (
    <span ref={ref} className="relative inline-flex items-center justify-center">
      {on && (
        <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(246,196,83,0.55) 0%, rgba(164,149,255,0.3) 40%, transparent 70%)' }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 1.25] }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}
