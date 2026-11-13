import { useEffect, useRef, useState } from 'react';
import { Celebration } from './Celebration';
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
      <Celebration label="На сегодня всё">
        <Mascot size={170} mood="rest" />
        <h1 className="text-4xl font-bold">Отличная работа на сегодня, {settings.name}!</h1>
        <p className="text-xl text-mute">Пора отдохнуть. Завтра продолжим!</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN родителя"
            aria-label="PIN родителя" className="min-h-touch rounded-xl2 border px-3" />
          <button onClick={() => pin === settings.pin && unlockToday()} className="rounded-xl2 bg-soft px-4 font-bold">Продлить</button>
        </div>
      </Celebration>
    );
  }
  if (onBreak) {
    return (
      <Celebration label="Перерыв">
        <Mascot size={170} mood="rest" />
        <h1 className="text-4xl font-bold">Пора сделать перерыв!</h1>
        <p className="text-xl text-mute">Встань, потянись, попей воды и посмотри вдаль.</p>
        <button autoFocus onClick={() => { session.current = 0; setOnBreak(false); }}
          className="min-w-40 rounded-xl2 bg-brand px-10 text-xl font-bold text-onbrand">Я отдохнул</button>
      </Celebration>
    );
  }
  return null;
}
