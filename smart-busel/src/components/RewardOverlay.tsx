import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Mascot } from './Mascot';
import { useApp } from '../store/useApp';

/** Полноэкранное поздравление при достижении порога. Показывается один раз для каждой награды. */
export function RewardOverlay() {
  const { rewards, celebrated, markCelebrated, settings, points } = useApp();
  const next = rewards.find((r) => !celebrated.includes(r.id));

  useEffect(() => {
    if (!next) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
  }, [next?.id]);

  if (!next) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand p-8 text-center text-white">
      <Mascot size={180} cheer />
      <h1 className="text-4xl font-extrabold">
        {settings.name}, ты заработал {next.points} баллов! 🎁
      </h1>
      <p className="max-w-xl text-2xl">Подойди к родителям и попроси свою награду: {next.text}</p>
      <p className="opacity-80">Всего баллов: {points}</p>
      <button onClick={() => markCelebrated(next.id)}
        className="rounded-xl2 bg-white px-10 py-3 text-xl font-extrabold text-brand">Ура!</button>
    </motion.div>
  );
}
