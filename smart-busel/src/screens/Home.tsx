import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { findTopic, subjects } from '../content/loader';
import { levelFor } from '../engine/level';
import { progressToNext } from '../engine/rewards';
import { currentStreak } from '../engine/streak';
import { todayStr, useApp } from '../store/useApp';

export function Home({ onSubject, onParent, onTopic, onCollection }: { onSubject(id: string): void; onParent(): void; onTopic(subjectId: string, topicId: string): void; onCollection(): void }) {
  const { settings, points, rewards, topicResults, daily, lastTopic } = useApp();
  const p = progressToNext(points, settings.rewardThreshold);
  const lvl = levelFor(points);
  const pending = rewards.filter((r) => r.status === 'pending').length;
  const today = daily[todayStr()];
  const goalDone = today?.tasks ?? 0;
  const streak = currentStreak((d) => (daily[d]?.tasks ?? 0) > 0, todayStr());

  // «Продолжить»: первая готовая тема, которую ещё не прошли
  let next: { subjectId: string; topicId: string; title: string } | undefined;
  const last = lastTopic ? findTopic(lastTopic.subjectId, lastTopic.topicId) : undefined;
  if (last && !topicResults[last.topic.id]?.done) next = { subjectId: last.subject.id, topicId: last.topic.id, title: last.topic.title };
  for (const s of subjects)
    for (const sec of s.sections)
      for (const t of sec.topics)
        if (!next && t.status === 'ready' && !topicResults[t.id]?.done) next = { subjectId: s.id, topicId: t.id, title: t.title };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center gap-6 rounded-xl3 bg-card p-6 shadow">
        <Mascot />
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold">Привет, {settings.name}!</h1>
          <p className="text-mute">Уровень {lvl.level} · {points} баллов</p>
          <div className="mt-3">
            <ProgressBar ratio={p.ratio} label="До следующей награды" />
            <p className="mt-1 text-sm text-mute">До награды осталось {p.left} баллов</p>
          </div>
        </div>
        {streak.days > 0 && (
          <span className="rounded-full bg-black/5 px-4 py-2 font-extrabold" title={streak.freezeAvailable ? 'На этой неделе есть бесплатная заморозка серии' : 'Серия дней'}>
            🔥 {streak.days}{streak.freezeAvailable && ' ❄️'}
          </span>
        )}
        <button onClick={onCollection} aria-label="Моя коллекция" className="rounded-xl2 bg-black/5 px-4 text-2xl">🏅</button>
        {pending > 0 && (
          <span className="rounded-full bg-accent px-4 py-2 font-extrabold text-white" title="Награды ждут">🎁 {pending}</span>
        )}
        <button onClick={onParent} aria-label="Родителям" className="rounded-xl2 bg-black/5 px-4 text-2xl">🔒</button>
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
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
