import { useMemo } from 'react';
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
import { dueTopics, WARMUP_BONUS, WARMUP_TOPICS } from '../engine/warmup';
import { todayStr, useApp } from '../store/useApp';

export function Home({ onSubject, onParent, onTopic, onCollection, onPlan, onReview, onWarmup }: { onSubject(id: string): void; onParent(): void; onTopic(subjectId: string, topicId: string): void; onCollection(): void; onPlan(): void; onReview(): void; onWarmup(): void }) {
  const { settings, points, rewards, rewardBase, topicResults, daily, lastTopic, plan, opened, mistakes, albumCards } = useApp();
  const p = progressToNext(points, settings.rewardThreshold, rewardBase);
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

  const warmupTopics = dueTopics(topicResults, todayStr(), WARMUP_TOPICS).length;
  const warmupDone = today?.warmup === true;

  /** Один шаг дня: номер или галочка, текст и кнопка. */
  const Step = ({ n, done, icon, title, note, action, onClick, primary }: { n: number; done?: boolean; icon: string; title: string; note?: string; action: string; onClick(): void; primary?: boolean }) => (
    <li className="flex flex-wrap items-center gap-3 rounded-xl2 bg-bg px-4 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-extrabold ${done ? 'bg-ok text-white' : 'bg-soft text-mute'}`}>{done ? '✓' : n}</span>
      <span className="min-w-[200px] flex-1">
        <span className={`block text-lg font-extrabold ${done ? 'text-mute' : ''}`}><span aria-hidden>{icon}</span> {title}</span>
        {note && <span className="block text-sm text-mute">{note}</span>}
      </span>
      <button onClick={onClick} className={`min-h-touch rounded-xl2 px-5 font-extrabold active:scale-95 ${primary ? 'bg-brand text-white shadow' : 'bg-soft'}`}>{action}</button>
    </li>
  );
  const steps: React.ReactNode[] = [];
  let primaryUsed = false;
  const takePrimary = (can: boolean) => { if (!can || primaryUsed) return false; primaryUsed = true; return true; };
  if (warmupTopics > 0 || warmupDone) {
    steps.push(<Step key="w" n={steps.length + 1} done={warmupDone} icon="🧠" title="Разминка: вспомни пройденное"
      note={warmupDone ? (warmupTopics > 0 ? 'Сделано! Можно повторить ещё.' : 'Сделано!') : `Несколько вопросов из прошлых тем · +${WARMUP_BONUS} баллов`}
      action={warmupDone ? 'Ещё' : 'Начать'} primary={takePrimary(!warmupDone)} onClick={onWarmup} />);
  }
  const todayTopics = planned.length ? planned.filter((x) => !!x) : [];
  if (todayTopics.length) {
    todayTopics.forEach((x) => {
      const st = statusOf(x!.topic.id);
      steps.push(<Step key={x!.topic.id} n={steps.length + 1} done={st === 'done'} icon={x!.subject.icon} title={x!.topic.title}
        note={`${x!.subject.title} · из твоего плана`} action={st === 'done' ? 'Повторить' : st === 'new' ? 'Начать' : 'Продолжить'}
        primary={takePrimary(st !== 'done')} onClick={() => onTopic(x!.subject.id, x!.topic.id)} />);
    });
  } else if (next) {
    const subj = learnSubjects.find((x) => x.id === next!.subjectId);
    steps.push(<Step key="next" n={steps.length + 1} icon={subj?.icon ?? '▶'} title={next.title} note={`${subj?.title ?? ''} · следующая тема`}
      action={statusOf(next.topicId) === 'new' ? 'Начать' : 'Продолжить'} primary={takePrimary(true)} onClick={() => onTopic(next!.subjectId, next!.topicId)} />);
  }
  if (reviewCount > 0) {
    steps.push(<Step key="r" n={steps.length + 1} icon="🔁" title="Работа над ошибками" note={`Вопросов, к которым стоит вернуться: ${reviewCount}`}
      action="Исправить" primary={takePrimary(true)} onClick={onReview} />);
  }
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 p-6">
      <header className="flex flex-wrap items-center gap-5 rounded-xl3 bg-card p-5 shadow">
        <Logo height={120} />
        <div className="min-w-[220px] flex-1">
          <h1 className="text-3xl font-extrabold">Привет, {settings.name}!</h1>
          <p className="text-mute">Уровень {lvl.level} · <b>{levelTitle(lvl.level)}</b> · {points} баллов</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm font-extrabold">
            <span className="rounded-full bg-soft px-3 py-1" title={streak.freezeAvailable ? 'На этой неделе есть бесплатная заморозка серии' : 'Дней подряд'}>
              🔥 {streak.days} {streak.days === 1 ? 'день' : streak.days >= 2 && streak.days <= 4 ? 'дня' : 'дней'} подряд{streak.freezeAvailable && streak.days > 0 && ' ❄️'}
            </span>
            <span className="rounded-full bg-soft px-3 py-1" title="Карточки знаний в альбоме">📚 Знаний собрано: {albumCards.length}</span>
            <span className="rounded-full bg-soft px-3 py-1" title="Звёзды за темы">⭐ {stars}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pending > 0 && <span className="rounded-full bg-sun px-4 py-2 font-extrabold text-navy" title="Награды ждут">🎁 {pending}</span>}
          <button onClick={onCollection} aria-label="Моя коллекция" className="min-h-touch rounded-xl2 bg-soft px-4 font-extrabold">🏅 Коллекция</button>
          <button onClick={onParent} aria-label="Родителям" className="min-h-touch rounded-xl2 bg-soft px-4 text-2xl">🔒</button>
        </div>
      </header>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="flex-1 text-2xl font-extrabold">Сегодня</h2>
          <button onClick={onPlan} className="min-h-touch rounded-xl2 bg-soft px-5 font-bold">🗓️ {planned.length ? 'Изменить план' : 'Выбрать темы самому'}</button>
        </div>
        <ol className="flex flex-col gap-2">{steps}</ol>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {settings.dailyGoal > 0 && (
            <div>
              <ProgressBar ratio={Math.min(1, goalDone / settings.dailyGoal)} label="Цель на сегодня" />
              <p className="mt-1 text-sm text-mute">Цель на сегодня: {Math.min(goalDone, settings.dailyGoal)} / {settings.dailyGoal} заданий{today?.goalDone && ' ✓'}</p>
            </div>
          )}
          <div>
            <ProgressBar ratio={p.ratio} label="До следующей награды" />
            <p className="mt-1 text-sm text-mute">🎁 До награды осталось {p.left} баллов</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Quests />
        <DailyFact date={todayStr()} onOpen={onTopic} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {learnSubjects.map((s) => {
          const ready = s.sections.flatMap((sec) => sec.topics).filter((t) => t.status === 'ready');
          const passed = ready.filter((t) => topicResults[t.id]?.done).length;
          return (
            <button key={s.id} onClick={() => onSubject(s.id)}
              className="flex min-h-[120px] flex-col justify-between gap-3 rounded-xl3 p-5 text-left text-white shadow transition-transform hover:scale-[1.02] active:scale-95"
              style={{ background: s.color }}>
              <span className="flex items-center gap-4">
                <span className="text-5xl" aria-hidden>{s.icon}</span>
                <span className="text-xl font-extrabold">{s.title}</span>
              </span>
              <span className="block">
                <span className="block h-2 overflow-hidden rounded-full bg-white/30"><span className="block h-full rounded-full bg-white" style={{ width: `${ready.length ? (passed / ready.length) * 100 : 0}%` }} /></span>
                <span className="mt-1 block text-sm font-bold text-white/90">Пройдено тем: {passed} из {ready.length}</span>
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}
