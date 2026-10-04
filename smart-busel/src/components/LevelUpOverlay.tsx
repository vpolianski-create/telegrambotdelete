import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { ACCESSORIES } from '../engine/chest';
import { levelFor } from '../engine/level';
import { useApp } from '../store/useApp';
import { play } from '../audio/sfx';
import { Mascot } from './Mascot';

/** Повышение уровня. Ждёт, пока ребёнок закроет праздничный экран награды. */
export function LevelUpOverlay() {
  const { points, levelSeen, markLevelSeen, rewards, celebrated, settings } = useApp();
  const level = levelFor(points).level;
  const rewardShowing = rewards.some((r) => !celebrated.includes(r.id));
  const show = level > levelSeen && !rewardShowing;
  const unlocked = ACCESSORIES.filter((a) => a.level !== undefined && a.level > levelSeen && a.level <= level);

  useEffect(() => {
    if (show) play('level');
    if (show && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ['#ffd43b', '#ff8a3d', '#2f6fed'] });
    }
  }, [show]);

  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-accent p-8 text-center text-white">
      <motion.div animate={{ scale: [0.6, 1.15, 1] }} transition={{ duration: 0.6 }}><Mascot size={170} cheer /></motion.div>
      <h1 className="text-5xl font-extrabold">Уровень {level}!</h1>
      <p className="text-2xl">{settings.name}, ты стал ещё сильнее!</p>
      {unlocked.length > 0 && <p className="text-xl">Новый аксессуар для Бусела: {unlocked.map((a) => `${a.emoji} ${a.name}`).join(', ')}</p>}
      <button onClick={markLevelSeen} className="rounded-xl2 bg-white px-10 py-3 text-xl font-extrabold text-accent">Ура!</button>
    </motion.div>
  );
}
