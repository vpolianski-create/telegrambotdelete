import heroUrl from '../assets/brand/hero-continue.webp';
import { DailyFact } from '../components/DailyFact';
import { Icon, type IconName } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { Quests } from '../components/Quests';
import { ProgressBar } from '../components/ProgressBar';
import { SubjectGrid } from '../components/SubjectGrid';
import { allTopics, findTopic, learnSubjects } from '../content/loader';
import { inProgramOrder, planFor } from '../engine/plan';
import { topicStatus } from '../engine/status';
import { levelFor, levelTitle } from '../engine/level';
import { progressToNext } from '../engine/rewards';
import { currentStreak } from '../engine/streak';
import { dueTopics, WARMUP_BONUS, WARMUP_TOPICS } from '../engine/warmup';
import { todayStr, useApp } from '../store/useApp';

const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};

/** Плитка главного экрана: значок, заголовок, содержимое. */
const Tile = ({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-2 rounded-xl3 bg-card p-5 shadow">
    <h2 className="flex items-center gap-2 text-sm font-bold text-mute"><Icon name={icon} /> {title}</h2>
    {children}
  </section>
);

export function Home({ onSubject, onSubjects, onTopic, onPlan, onReview, onWarmup, reviewCount }: {
  onSubject(id: string): void; onSubjects(): void; onTopic(subjectId: string, topicId: string): void;
  onPlan(): void; onReview(): void; onWarmup(): void; reviewCount: number;
}) {
  const { settings, points, rewards, rewardBase, topicResults, daily, lastTopic, plan, opened, albumCards } = useApp();
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
  let next: { subjectId: string; topicId: string; title: string } | undefined;
  const firstPlanned = planned.find((x) => x && !topicResults[x.topic.id]?.done);
  if (firstPlanned) next = { subjectId: firstPlanned.subject.id, topicId: firstPlanned.topic.id, title: firstPlanned.topic.title };
  const last = lastTopic ? findTopic(lastTopic.subjectId, lastTopic.topicId) : undefined;
  if (!next && last && !topicResults[last.topic.id]?.done) next = { subjectId: last.subject.id, topicId: last.topic.id, title: last.topic.title };
  for (const s of learnSubjects)
    for (const sec of s.sections)
      for (const t of sec.topics)
        if (!next && t.status === 'ready' && !topicResults[t.id]?.done) next = { subjectId: s.id, topicId: t.id, title: t.title };
  const nextSubject = next ? learnSubjects.find((x) => x.id === next!.subjectId) : undefined;
  const nextReady = nextSubject?.sections.flatMap((sec) => sec.topics).filter((t) => t.status === 'ready') ?? [];
  const nextPassed = nextReady.filter((t) => topicResults[t.id]?.done).length;

  const warmupTopics = dueTopics(topicResults, todayStr(), WARMUP_TOPICS).length;
  const warmupDone = today?.warmup === true;

  /** Один пункт плана: номер или галочка, текст и кнопка. Главная кнопка на экране одна — «Продолжить» наверху. */
  const Step = ({ n, done, title, note, action, onClick }: { n: number; done?: boolean; title: string; note?: string; action: string; onClick(): void }) => (
    <li className="flex flex-wrap items-center gap-3 rounded-xl2 bg-bg px-4 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${done ? 'bg-ok text-onok' : 'bg-soft text-mute'}`}>{done ? <Icon name="check" label="Сделано" /> : n}</span>
      <span className="min-w-[200px] flex-1">
        <span className={`block text-lg font-bold ${done ? 'text-mute' : ''}`}>{title}</span>
        {note && <span className="block text-sm text-mute">{note}</span>}
      </span>
      <button onClick={onClick} className="min-h-touch rounded-xl2 bg-soft px-5 font-bold">{action}</button>
    </li>
  );
  const steps: React.ReactNode[] = [];
  if (warmupTopics > 0 || warmupDone) {
    steps.push(<Step key="w" n={steps.length + 1} done={warmupDone} title="Разминка: вспомни пройденное"
      note={warmupDone ? (warmupTopics > 0 ? 'Сделано! Можно повторить ещё.' : 'Сделано!') : `Несколько вопросов из прошлых тем · +${WARMUP_BONUS} баллов`}
      action={warmupDone ? 'Ещё' : 'Начать'} onClick={onWarmup} />);
  }
  planned.forEach((x) => {
    const st = statusOf(x!.topic.id);
    steps.push(<Step key={x!.topic.id} n={steps.length + 1} done={st === 'done'} title={x!.topic.title}
      note={`${x!.subject.title} · из твоего плана`} action={st === 'done' ? 'Повторить' : st === 'new' ? 'Начать' : 'Продолжить'}
      onClick={() => onTopic(x!.subject.id, x!.topic.id)} />);
  });
  if (reviewCount > 0) {
    steps.push(<Step key="r" n={steps.length + 1} title="Работа над ошибками" note={`Вопросов, к которым стоит вернуться: ${reviewCount}`}
      action="Исправить" onClick={onReview} />);
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 p-6">
      {/* Блок «Продолжить»: всегда тёмный, как картинка; свечение — только здесь */}
      <section data-theme="dark" aria-label="Продолжить занятие"
        className="relative flex min-h-[max(260px,36vh)] items-center overflow-hidden rounded-hero text-ink shadow" style={{ background: '#070e1d' }}>
        <img src={heroUrl} alt="" draggable={false} className="absolute inset-y-0 right-0 h-full w-auto max-w-none object-cover" />
        <div aria-hidden className="absolute inset-0" style={{ background: 'var(--aurora)' }} />
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #070e1d 0%, #070e1d 38%, rgba(7,14,29,0.72) 55%, transparent 78%)' }} />
        <div className="relative flex w-full max-w-[36rem] flex-col gap-3 p-8">
          <div className="flex items-center gap-4">
            <Mascot size={104} />
            <div>
              <h1 className="text-4xl font-bold">Привет, {settings.name}!</h1>
              <p className="text-mute">Уровень {lvl.level} · {levelTitle(lvl.level)} · {points} {plural(points, 'балл', 'балла', 'баллов')}</p>
            </div>
          </div>
          {next ? (
            <>
              <div>
                <p className="text-sm font-bold text-mute">{nextSubject?.title} · {statusOf(next.topicId) === 'new' ? 'следующая тема' : 'ты остановился здесь'}</p>
                <p className="text-2xl font-bold leading-snug">{next.title}</p>
              </div>
              <div className="max-w-sm">
                <ProgressBar ratio={nextReady.length ? nextPassed / nextReady.length : 0} label={`Пройдено тем по предмету «${nextSubject?.title}»`} thin />
                <p className="mt-1 text-sm text-mute">Пройдено тем: {nextPassed} из {nextReady.length}</p>
              </div>
              <button onClick={() => onTopic(next!.subjectId, next!.topicId)}
                className="flex min-h-touch items-center gap-2 self-start rounded-xl2 bg-brand px-8 text-lg font-bold text-onbrand">
                Продолжить <Icon name="next" />
              </button>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold leading-snug">Все готовые темы пройдены. Отличная работа!</p>
              <button onClick={onSubjects} className="flex min-h-touch items-center gap-2 self-start rounded-xl2 bg-brand px-8 text-lg font-bold text-onbrand">
                Повторить темы <Icon name="next" />
              </button>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Tile icon="gift" title="До награды">
          <p className="text-2xl font-bold">Осталось {p.left} {plural(p.left, 'балл', 'балла', 'баллов')}</p>
          <ProgressBar ratio={p.ratio} label="До следующей награды" />
          {pending > 0 && <p className="self-start rounded-xl2 bg-sun px-3 py-1 text-sm font-bold text-navy">Награды ждут: {pending} — подойди к родителям</p>}
        </Tile>
        <Tile icon="fire" title="Серия дней">
          <p className="text-2xl font-bold">{streak.days} {plural(streak.days, 'день', 'дня', 'дней')} подряд</p>
          <p className="text-sm text-mute">
            {streak.freezeAvailable && streak.days > 0 ? <><Icon name="snow" /> Один пропуск на этой неделе серию не оборвёт.</> : 'Занимайся каждый день понемногу.'}
          </p>
          <p className="flex flex-wrap gap-2 text-sm font-bold">
            <span className="flex items-center gap-1 rounded-full bg-soft px-3 py-1" title="Звёзды за темы"><Icon name="star" className="text-sun" label="Звёзд" /> {stars}</span>
            <span className="flex items-center gap-1 rounded-full bg-soft px-3 py-1" title="Карточки знаний в альбоме"><Icon name="book" /> Знаний собрано: {albumCards.length}</span>
          </p>
        </Tile>
        <Tile icon="target" title="Цель на сегодня">
          {settings.dailyGoal > 0 ? (
            <>
              <p className="text-2xl font-bold">{Math.min(goalDone, settings.dailyGoal)} из {settings.dailyGoal} {plural(settings.dailyGoal, 'задания', 'заданий', 'заданий')}</p>
              <ProgressBar ratio={Math.min(1, goalDone / settings.dailyGoal)} label="Цель на сегодня" />
              {today?.goalDone && <p className="flex items-center gap-1 text-sm font-bold text-okink"><Icon name="check" /> Цель выполнена!</p>}
            </>
          ) : (
            <p className="text-2xl font-bold">{goalDone} {plural(goalDone, 'задание', 'задания', 'заданий')} сегодня</p>
          )}
        </Tile>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Quests />
        <DailyFact date={todayStr()} onOpen={onTopic} />
      </div>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="flex-1 text-2xl font-bold">Мой план на сегодня</h2>
          <button onClick={onPlan} className="min-h-touch rounded-xl2 bg-soft px-5 font-bold">{planned.length ? 'Изменить план' : 'Выбрать темы'}</button>
        </div>
        {steps.length > 0
          ? <ol className="flex flex-col gap-2">{steps}</ol>
          : <p className="text-mute">В плане пока пусто. Нажми «Выбрать темы» — или просто жми «Продолжить» наверху.</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Предметы</h2>
        <SubjectGrid onSubject={onSubject} />
      </section>
    </main>
  );
}
