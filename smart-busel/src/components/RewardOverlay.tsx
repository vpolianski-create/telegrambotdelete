import { useEffect } from 'react';
import { play } from '../audio/sfx';
import { Celebration } from './Celebration';
import { Mascot } from './Mascot';
import { Spark } from './Spark';
import { useApp } from '../store/useApp';

/** Поздравление при достижении порога. Показывается один раз для каждой награды. */
export function RewardOverlay() {
  const { rewards, celebrated, markCelebrated, settings, points } = useApp();
  const next = rewards.find((r) => !celebrated.includes(r.id));

  useEffect(() => { if (next) play('reward'); }, [next?.id]);

  if (!next) return null;
  return (
    <Celebration key={next.id} z={50} label="Награда">
      <Spark><Mascot size={180} cheer /></Spark>
      <p className="rounded-full bg-sun px-4 py-1 text-sm font-bold text-navy">Награда</p>
      <h1 className="text-4xl font-bold">{settings.name}, ты заработал {next.points} баллов!</h1>
      <p className="text-xl">Подойди к родителям и попроси свою награду: <b>{next.text}</b></p>
      <p className="text-mute">Всего баллов: {points}</p>
      <button autoFocus onClick={() => markCelebrated(next.id)} className="min-w-40 rounded-xl2 bg-brand px-10 text-xl font-bold text-onbrand">Ура!</button>
    </Celebration>
  );
}
