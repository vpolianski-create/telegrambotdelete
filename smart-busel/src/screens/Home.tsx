import { useMemo } from 'react';
import { StatusChip } from '../components/StatusChip';
import { DailyFact } from '../components/DailyFact';
import { Logo } from '../components/Logo';
import { Quests } from '../components/Quests';
import { ProgressBar } from '../components/ProgressBar';
import { reviewList } from '../content/review';
import { allTopics, findTopic, learnSubjects } from '../content/loader';
import { inProgramOrder, planFor } from '../engine/plan';
import { topicStatus } from '../engine/status';
import { levelFor, levelTitle } from '../engine/level';
import { progressToNext } from '../engine/rewards';
import { currentStreak } from '../engine/streak';
import { todayStr, useApp } from '../store/useApp';

export function Home({ onSubject, onParent, onTopic, onCollection, onPlan, onReview }: { onSubject(id: string): void; onParent(): void; onTopic(subjectId: string, topicId: string): void; onCollection(): void; onPlan(): void; onReview(): void }) {
  const { settings, points, rewards, topicResults, daily, lastTopic, plan, opened, mistakes } = useApp();
  const p = progressToNext(points, settings.rewardThreshold);
  const lvl = levelFor(points);
  const stars = Object.values(topicResults).reduce((a, r) => a + (r.stars ?? 0), 0);
  const pending = rewards.filter((r) => r.status === 'pending').length;
  const today = daily[todayStr()];
  const goalDone = today?.tasks ?? 0;
  const streak = currentStreak((d) => (daily[d]?.tasks ?? 0) > 0, todayStr());

  // План на сегодня (в порядке программы) и «Продолжить»
  const order = allTopics.map((x) => x.topic.id);
  const planned = inProgramOrder(planFor(plan, todayStr()), order).map((id) => allTopics.find((x) => x.topic.id === id)).filter((x) => !!x);
  const statusOf = (id: string) => topicStatus(topicResults[id], opened.includes(id));
  const reviewCount = useMemo(() => reviewList(mistakes, 99).length, [mistakes]);
  let next: { subjectId: string; topicId: string; title: string } | undefined;
  const firstPlanned = planned.find((x) => x && !topicResults[x.topic.id]?.done);
  if (firstPlanned) next = { subjectId: firstPlanned.subject.id, topicId: firstPlanned.topic.id, title: firstPlanned.topic.title };
  const last = lastTopic ? findTopic(lastTopic.subjectId, lastTopic.topicId) : undefined;
  if (!next && last && !topicResults[last.topic.id]?.done) next = { subjectId: last.subject.id, topicId: last.topic.id, title: last.topic.title };
  for (const s of learnSubjects)
    for (const sec of s.sections)
      for (const t of sec.topics)
        if (!next && t.status === 'ready' && !topicResults[t.id]?.done) next = { subjectId: s.id, topicId: t.id, title: t.title };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center gap-6 rounded-xl3 bg-card p-6 shadow">
        <Logo height={176} />
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold">Привет, {settings.name}!</h1>
          <p className="text-mute">Уровень {lvl.level} · <b>{levelTitle(lvl.level)}</b> · {points} баллов{stars > 0 && <> · ⭐ {stars}</>}</p>
          <div className="mt-3">
            <ProgressBar ratio={p.ratio} label="До следующей награды" />
            <p className="mt-1 text-sm text-mute">До награды осталось {p.left} баллов</p>
          </div>
        </div>
        {streak.days > 0 && (
          <span className="rounded-full bg-soft px-4 py-2 font-extrabold" title={streak.freezeAvailable ? 'На этой неделе есть бесплатная заморозка серии' : 'Серия дней'}>
            🔥 {streak.days}{streak.freezeAvailable && ' ❄️'}
          </span>
        )}
        <button onClick={onCollection} aria-label="Моя коллекция" className="rounded-xl2 bg-soft px-4 text-2xl">🏅</button>
        {pending > 0 && (
          <span className="rounded-full bg-sun px-4 py-2 font-extrabold text-navy" title="Награды ждут">🎁 {pending}</span>
        )}
        <button onClick={onParent} aria-label="Родителям" className="rounded-xl2 bg-soft px-4 text-2xl">🔒</button>
      </header>

      <section className="flex flex-wrap items-center gap-4">
        {next && (
          <button onClick={() => onTopic(next!.subjectId, next!.topicId)}
            className="min-h-touch rounded-xl2 bg-brand px-6 py-3 text-lg font-extrabold text-white shadow active:scale-95">
            ▶ Продолжить: {next.title}
          </button>
        )}
        {settings.dailyGoal > 0 && (
          <div className="min-w-[220px] flex-1">
            <ProgressBar ratio={Math.min(1, goalDone / settings.dailyGoal)} label="Цель на сегодня" />
            <p className="mt-1 text-sm text-mute">
              Цель на сегодня: {Math.min(goalDone, settings.dailyGoal)} / {settings.dailyGoal} заданий
              {today?.goalDone && ' ✓'}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="flex-1 text-xl font-extrabold">🗓️ Мой план на сегодня</h2>
          <button onClick={onPlan} className="min-h-touch rounded-xl2 bg-brand px-5 font-extrabold text-white">{planned.length ? 'Изменить' : 'Выбрать темы'}</button>
          {reviewCount > 0 && (
            <button onClick={onReview} className="min-h-touch rounded-xl2 bg-sun px-5 font-extrabold text-navy">🔁 Работа над ошибками · {reviewCount}</button>
          )}
        </div>
        {planned.length === 0 ? (
          <p className="text-mute">Выбери, что хочешь пройти сегодня. Если ничего не выбрано, Бусел предложит следующую тему по программе.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {planned.map((x) => x && (
              <li key={x.topic.id}>
                <button onClick={() => onTopic(x.subject.id, x.topic.id)} className="flex min-h-touch w-full flex-wrap items-center justify-between gap-2 rounded-xl2 bg-bg px-4 py-2 text-left">
                  <span>{x.subject.icon} {x.topic.title}</span>
                  <StatusChip status={statusOf(x.topic.id)} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Quests />
        <DailyFact date={todayStr()} onOpen={onTopic} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {learnSubjects.map((s) => (
          <button key={s.id} onClick={() => onSubject(s.id)}
            className="flex min-h-[120px] items-center gap-4 rounded-xl3 p-5 text-left text-white shadow transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: s.color }}>
            <span className="text-5xl" aria-hidden>{s.icon}</span>
            <span className="text-xl font-extrabold">{s.title}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
