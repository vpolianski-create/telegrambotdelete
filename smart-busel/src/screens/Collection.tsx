import { Mascot } from '../components/Mascot';
import { BADGES } from '../engine/badges';
import { ACCESSORIES, STICKERS, unlockedAccessories } from '../engine/chest';
import { levelFor } from '../engine/level';
import { useApp } from '../store/useApp';

export function Collection({ onBack }: { onBack(): void }) {
  const { badges, stickers, chestAccessories, points, settings, updateSettings } = useApp();
  const level = levelFor(points).level;
  const owned = unlockedAccessories(level, chestAccessories);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <button onClick={onBack} className="self-start rounded-xl2 bg-card px-5 shadow">← Назад</button>
      <h1 className="text-3xl font-extrabold">🏅 Моя коллекция</h1>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <h2 className="mb-3 text-xl font-extrabold">Значки: {badges.length} из {BADGES.length}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {BADGES.map((b) => {
            const has = badges.includes(b.id);
            return (
              <div key={b.id} className={`flex items-center gap-3 rounded-xl2 p-3 ${has ? 'bg-ok/15' : 'bg-soft opacity-60'}`}>
                <span className="text-4xl" aria-hidden>{has ? b.icon : '🔒'}</span>
                <span><b>{b.title}</b><br /><span className="text-sm text-mute">{b.desc}</span></span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <h2 className="mb-3 text-xl font-extrabold">Наряды Бусела</h2>
        <div className="flex flex-wrap items-start gap-6">
          <Mascot size={140} />
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {ACCESSORIES.map((a) => {
              const has = owned.includes(a.id);
              const on = settings.accessory === a.id;
              return (
                <button key={a.id} disabled={!has} onClick={() => updateSettings({ accessory: on ? '' : a.id })}
                  className={`flex min-h-touch items-center gap-3 rounded-xl2 p-3 text-left ${on ? 'bg-brand text-white' : has ? 'bg-bg' : 'bg-soft opacity-60'}`}>
                  <span className="text-3xl">{has ? a.emoji : '🔒'}</span>
                  <span><b>{a.name}</b><br /><span className="text-sm">{has ? (on ? 'Надето — нажми, чтобы снять' : 'Надеть') : a.level ? `Откроется на ${a.level} уровне` : 'Можно найти в сундуке'}</span></span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <h2 className="mb-3 text-xl font-extrabold">Стикеры: {stickers.length} из {STICKERS.length}</h2>
        <div className="flex flex-wrap gap-3 text-4xl">
          {STICKERS.map((s) => <span key={s} className={stickers.includes(s) ? '' : 'opacity-30 grayscale'}>{stickers.includes(s) ? s : '❔'}</span>)}
        </div>
        <p className="mt-2 text-sm text-mute">Стикеры, наряды и баллы можно найти в сундуке после каждой пройденной темы.</p>
      </section>
    </main>
  );
}
