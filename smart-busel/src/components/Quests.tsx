import { useState } from 'react';
import { motion } from 'framer-motion';
import { learnSubjects } from '../content/loader';
import { ACCESSORIES, type ChestResult } from '../engine/chest';
import { questProgress, questsFor, QUEST_POINTS } from '../engine/quests';
import { todayStr, useApp } from '../store/useApp';

/** Три задания дня и сундук дня. Задания меняются каждый день; пропущенный день ничего не отнимает. */
export function Quests() {
  const { daily, openDayChest } = useApp();
  const [res, setRes] = useState<ChestResult>();
  const date = todayStr();
  const d = daily[date] ?? { tasks: 0 };
  const quests = questsFor(date, learnSubjects);
  const doneIds = (daily[date]?.quests ?? []) as string[];
  const all = quests.every((q) => doneIds.includes(q.id));
  const chestOpened = daily[date]?.questChest;

  return (
    <section className="flex flex-col gap-3 rounded-xl3 bg-card p-5 shadow">
      <h2 className="text-xl font-extrabold">Задания дня</h2>
      <ul className="flex flex-col gap-2">
        {quests.map((q) => {
          const p = questProgress(q, d);
          const done = doneIds.includes(q.id);
          return (
            <li key={q.id} className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>{done ? '✅' : q.icon}</span>
              <span className="flex-1">
                <span className={done ? 'text-mute line-through' : ''}>{q.text}</span>
                <span className="mt-1 block h-2 overflow-hidden rounded-full bg-soft">
                  <motion.span className="block h-full rounded-full bg-sun" initial={{ width: 0 }} animate={{ width: `${(p / q.target) * 100}%` }} />
                </span>
              </span>
              <span className="w-14 text-right text-sm font-bold text-mute">{p}/{q.target}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-mute">За каждое задание +{QUEST_POINTS} баллов. Выполни все три — откроется сундук дня.</p>
      {all && !chestOpened && !res && (
        <motion.button whileTap={{ scale: 0.92 }} animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}
          onClick={() => setRes(openDayChest())} className="rounded-xl2 bg-sun px-6 py-3 text-lg font-extrabold text-navy">🎁 Открыть сундук дня!</motion.button>
      )}
      {res && (
        <p className="rounded-xl2 bg-ok/15 px-4 py-2 text-lg font-extrabold">
          {res.kind === 'sticker' && `В сундуке стикер ${res.id}!`}
          {res.kind === 'accessory' && `В сундуке украшение: ${ACCESSORIES.find((a) => a.id === res.id)?.emoji} ${ACCESSORIES.find((a) => a.id === res.id)?.name}!`}
          {res.kind === 'points' && `В сундуке +${res.amount} баллов!`}
        </p>
      )}
      {all && chestOpened && !res && <p className="font-bold text-okink">Сегодня всё выполнено. Отличная работа!</p>}
    </section>
  );
}
