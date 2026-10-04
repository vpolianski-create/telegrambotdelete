import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { subjects } from '../content/loader';
import { levelFor } from '../engine/level';
import { progressToNext } from '../engine/rewards';
import { useApp } from '../store/useApp';

export function Home({ onSubject, onParent }: { onSubject(id: string): void; onParent(): void }) {
  const { settings, points, rewards } = useApp();
  const p = progressToNext(points, settings.rewardThreshold);
  const lvl = levelFor(points);
  const pending = rewards.filter((r) => r.status === 'pending').length;

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
        {pending > 0 && (
          <span className="rounded-full bg-accent px-4 py-2 font-extrabold text-white" title="Награды ждут">
            🎁 {pending}
          </span>
        )}
        <button onClick={onParent} aria-label="Родителям" className="rounded-xl2 bg-black/5 px-4 text-2xl">🔒</button>
      </header>

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
