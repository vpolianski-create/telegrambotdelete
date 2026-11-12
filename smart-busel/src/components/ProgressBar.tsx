import { motion } from 'framer-motion';

export function ProgressBar({ ratio, label, thin }: { ratio: number; label: string; thin?: boolean }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}
         className={`${thin ? 'h-2' : 'h-3'} w-full overflow-hidden rounded-full bg-soft`}>
      <motion.div className="h-full rounded-full bg-sun" initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
