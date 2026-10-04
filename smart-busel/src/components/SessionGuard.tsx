import { useEffect, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import { todayStr, useApp } from '../store/useApp';

const TICK = 10;

/** Считает время занятий, мягко напоминает о перерыве и о дневном лимите. Никаких штрафов. */
export function SessionGuard() {
  const { tick, settings, daily, unlockToday } = useApp();
  const session = useRef(0);
  const [onBreak, setOnBreak] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
      tick(TICK);
      session.current += TICK;
      if (settings.breakEveryMin > 0 && session.current >= settings.breakEveryMin * 60) setOnBreak(true);
    }, TICK * 1000);
    return () => clearInterval(t);
  }, [tick, settings.breakEveryMin]);

  const today = daily[todayStr()];
  const limitHit = settings.dailyLimitMin > 0 && (today?.sec ?? 0) >= settings.dailyLimitMin * 60 && !today?.unlocked;

  if (limitHit) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-brand p-8 text-center text-white">
        <Mascot size={150} cheer />
        <h1 className="text-4xl font-extrabold">Отличная работа на сегодня, {settings.name}!</h1>
        <p className="text-xl">Пора отдохнуть. Завтра продолжим!</p>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN родителя"
            aria-label="PIN родителя" className="rounded-xl2 px-3 py-2 text-ink" />
          <button onClick={() => pin === settings.pin && unlockToday()} className="rounded-xl2 bg-white/20 px-4">Продлить</button>
        </div>
      </div>
    );
  }
  if (onBreak) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-ok p-8 text-center text-white">
        <Mascot size={150} cheer />
        <h1 className="text-4xl font-extrabold">Пора сделать перерыв!</h1>
        <p className="text-xl">Встань, потянись, попей воды и посмотри вдаль.</p>
        <button onClick={() => { session.current = 0; setOnBreak(false); }}
          className="rounded-xl2 bg-white px-10 py-3 text-xl font-extrabold text-ok">Я отдохнул</button>
      </div>
    );
  }
  return null;
}
