import { useState } from 'react';
import { Mascot } from '../components/Mascot';
import { SubjectArt } from '../components/SubjectArt';
import { subjectTone } from '../content/subjectArt';
import { allTopics, learnSubjects } from '../content/loader';
import { BADGES } from '../engine/badges';
import { ACCESSORIES, STICKERS, unlockedAccessories } from '../engine/chest';
import { levelFor } from '../engine/level';
import { useApp } from '../store/useApp';

export function Collection({ onCerts }: { onCerts(): void }) {
  const { badges, stickers, chestAccessories, points, settings, updateSettings, albumCards } = useApp();
  const [open, setOpen] = useState<string>();
  const cards = allTopics.filter((x) => x.topic.card);
  const openCard = cards.find((x) => x.topic.id === open);
  const level = levelFor(points).level;
  const owned = unlockedAccessories(level, chestAccessories);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <h1 className="text-4xl font-extrabold">🏅 Моя коллекция</h1>

      <button onClick={onCerts} className="flex min-h-[72px] items-center gap-4 rounded-xl3 bg-sun px-5 text-left text-xl font-extrabold text-navy shadow">
        <span className="text-4xl">📜</span> Мои грамоты — посмотреть и распечатать
      </button>

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
        <h2 className="mb-1 text-xl font-extrabold">Альбом знаний: {albumCards.length} из {cards.length}</h2>
        <p className="mb-3 text-sm text-mute">Карточка открывается, когда тема пройдена на 80% и выше. Нажми на карточку, чтобы прочитать интересный факт.</p>
        {learnSubjects.map((sub) => {
          const list = cards.filter((x) => x.subject.id === sub.id);
          if (!list.length) return null;
          const got = list.filter((x) => albumCards.includes(x.topic.id));
          const locked = list.filter((x) => !albumCards.includes(x.topic.id));
          return (
            <div key={sub.id} className="mb-5">
              <h3 className="mb-1 flex items-center gap-2 font-extrabold"><SubjectArt subject={sub} size={28} /> {sub.title} · {got.length} из {list.length}</h3>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-soft">
                <div className="h-full rounded-full" style={{ background: subjectTone(sub.id, sub.color).mark, width: `${(got.length / list.length) * 100}%` }} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {got.map((x) => (
                  <button key={x.topic.id} onClick={() => setOpen(x.topic.id)} aria-label={x.topic.card!.title}
                    className={`h-14 w-14 rounded-xl2 bg-sun/25 text-3xl shadow ${open === x.topic.id ? 'ring-2 ring-brand' : ''}`}>
                    {x.topic.card!.emoji}
                  </button>
                ))}
                {locked.slice(0, 3).map((x) => (
                  <span key={x.topic.id} title={`Откроется за тему «${x.topic.title}»`} aria-label="Закрытая карточка"
                    className="flex h-14 w-14 items-center justify-center rounded-xl2 bg-soft text-3xl opacity-50">❔</span>
                ))}
                {locked.length > 3 && <span className="text-sm font-bold text-mute">и ещё {locked.length - 3}</span>}
              </div>
              {locked.length > 0 && <p className="mt-1 text-sm text-mute">Следующая карточка — за тему «{locked[0].topic.title}».</p>}
            </div>
          );
        })}
        {openCard && (
          <div className="mt-2 rounded-xl3 border border-sun bg-sun/15 p-4">
            <p className="text-2xl font-extrabold">{openCard.topic.card!.emoji} {openCard.topic.card!.title}</p>
            <p className="mt-1 text-lg">{openCard.topic.card!.fact}</p>
            <p className="mt-1 text-sm text-mute">Тема: {openCard.topic.title}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl3 bg-card p-5 shadow">
        <h2 className="mb-3 text-xl font-extrabold">Украшения Бусела</h2>
        <div className="flex flex-wrap items-start gap-6">
          <Mascot size={140} />
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {ACCESSORIES.map((a) => {
              const has = owned.includes(a.id);
              const on = settings.accessory === a.id;
              return (
                <button key={a.id} disabled={!has} onClick={() => updateSettings({ accessory: on ? '' : a.id })}
                  className={`flex min-h-touch items-center gap-3 rounded-xl2 p-3 text-left ${on ? 'bg-brand text-onbrand' : has ? 'bg-bg' : 'bg-soft opacity-60'}`}>
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
        <p className="mt-2 text-sm text-mute">Стикеры, украшения и баллы можно найти в сундуке после каждой пройденной темы.</p>
      </section>
    </main>
  );
}
