import { useEffect } from 'react';
import { ACCESSORIES } from '../engine/chest';
import { levelFor, levelTitle } from '../engine/level';
import { useApp } from '../store/useApp';
import { play } from '../audio/sfx';
import { Celebration } from './Celebration';
import { Mascot } from './Mascot';
import { Spark } from './Spark';

/** Повышение уровня. Ждёт, пока ребёнок закроет экран награды. */
export function LevelUpOverlay() {
  const { points, levelSeen, markLevelSeen, rewards, celebrated, settings } = useApp();
  const level = levelFor(points).level;
  const rewardShowing = rewards.some((r) => !celebrated.includes(r.id));
  const show = level > levelSeen && !rewardShowing;
  const unlocked = ACCESSORIES.filter((a) => a.level !== undefined && a.level > levelSeen && a.level <= level);

  useEffect(() => { if (show) play('level'); }, [show]);

  if (!show) return null;
  return (
    <Celebration label="Новый уровень">
      <Spark><Mascot size={180} cheer /></Spark>
      <p className="rounded-full bg-sun px-4 py-1 text-sm font-bold text-navy">Новый уровень</p>
      <h1 className="text-4xl font-bold">Уровень {level} · {levelTitle(level)}</h1>
      <p className="text-xl text-mute">{settings.name}, ты стал ещё сильнее!</p>
      {unlocked.length > 0 && <p className="text-lg">Новое украшение Бусела: {unlocked.map((a) => `${a.emoji} ${a.name}`).join(', ')}</p>}
      <button autoFocus onClick={markLevelSeen} className="min-w-40 rounded-xl2 bg-brand px-10 text-xl font-bold text-onbrand">Ура!</button>
    </Celebration>
  );
}
