import { motion } from 'framer-motion';

export function ProgressBar({ ratio, label }: { ratio: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}
         className="h-5 w-full overflow-hidden rounded-full bg-black/10">
      <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
