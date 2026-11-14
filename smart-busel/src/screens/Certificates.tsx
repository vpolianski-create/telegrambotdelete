import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Certificate, Medal, TIERS, tierOf, type Tier } from '../components/Certificate';
import { CertificatePoster, Seal } from '../components/CertificatePoster';
import { Mascot } from '../components/Mascot';
import { learnSubjects } from '../content/loader';
import { earnedCertificates, type Cert } from '../engine/certificates';
import { todayStr, useApp } from '../store/useApp';

/** Образцы для витрины видов грамот (только рисунок медали). */
const SAMPLE: Record<Tier, Cert> = {
  star: { id: 't:', kind: 'topic', icon: '⭐', title: '', text: '' },
  explorer: { id: 's:', kind: 'section', icon: '📗', title: '', text: '' },
  master: { id: 'j:', kind: 'subject', icon: '🎓', title: '', text: '' },
  fire: { id: 'k:30', kind: 'streak', icon: '🔥', title: '', text: '' },
};
const fmt = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

/** Грамоты: список заслуженных и красивый лист для печати (Ctrl+P или кнопка «Распечатать»). */
/** ВРЕМЕННО, пока выбираем вид грамот: вариант Б включается записью cert-variant=b в localStorage. */
const VARIANT_B = (() => { try { return localStorage.getItem('cert-variant') === 'b'; } catch { return false; } })();

export function Certificates({ onBack }: { onBack(): void }) {
  const { certificates, settings, topicResults, daily } = useApp();
  const earned = earnedCertificates({ topicResults, daily }, learnSubjects, todayStr()).filter((c) => certificates[c.id]);
  const [openId, setOpenId] = useState<string>();
  const open = earned.find((c) => c.id === openId);
  // номер грамоты — по порядку получения; в списке новые сверху
  const byDate = [...earned].sort((a, b) => certificates[a.id].localeCompare(certificates[b.id]));
  const numberOf = (id: string) => byDate.findIndex((c) => c.id === id) + 1;
  const sorted = [...byDate].reverse();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 p-6">
      <div className="no-print flex items-center gap-3">
        <button onClick={() => (open ? setOpenId(undefined) : onBack())} className="rounded-xl2 bg-card px-5 shadow"><Icon name="back" /> Назад</button>
        <h1 className="flex-1 text-4xl font-extrabold">Мои грамоты</h1>
        {open && <button onClick={() => window.print()} className="rounded-xl2 bg-brand px-6 font-extrabold text-onbrand"><Icon name="print" /> Распечатать</button>}
      </div>

      {open && VARIANT_B ? (
        <CertificatePoster cert={open} name={settings.name} date={certificates[open.id]} number={numberOf(open.id)} />
      ) : VARIANT_B ? (
        <>
          <p className="text-mute">Это твоя стена грамот. Чем больше достижение, тем ярче лист. Нажми на грамоту, чтобы открыть её и распечатать.</p>
          {earned.length === 0 && (
            <div className="flex items-center gap-5 rounded-xl3 bg-card p-6 shadow">
              <Mascot size={110} mood="read" />
              <p className="text-lg">Пока грамот нет. Пройди тему на 100% — и первая грамота твоя!</p>
            </div>
          )}
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((c) => (
              <li key={c.id}>
                <button onClick={() => setOpenId(c.id)} aria-label={`${TIERS[tierOf(c)].name} № ${numberOf(c.id)}: ${c.title}`}
                  className="block w-full rounded-xl3 p-0 text-left hover:-translate-y-0.5 active:scale-[0.99]">
                  <CertificatePoster mini cert={c} name={settings.name} date={certificates[c.id]} number={numberOf(c.id)} />
                </button>
              </li>
            ))}
          </ul>
          <h2 className="text-2xl font-bold">Какие бывают грамоты</h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(TIERS) as Tier[]).map((t) => {
              const n = earned.filter((c) => tierOf(c) === t).length;
              return (
                <li key={t} className={`flex flex-col items-center gap-2 rounded-xl3 p-4 text-center ${n ? 'bg-card shadow' : 'border border-dashed border-line'}`}>
                  <div className={`cb-seal-solo ${n ? '' : 'opacity-40 grayscale'}`}><Seal cert={SAMPLE[t]} uid={`tier-${t}`} /></div>
                  <b>{TIERS[t].name}</b>
                  <span className="text-sm text-mute">{TIERS[t].how}</span>
                  <span className={`mt-auto rounded-full px-3 py-1 text-sm font-bold ${n ? 'bg-sun text-navy' : 'bg-soft text-mute'}`}>{n ? `Получено: ${n}` : 'Ещё впереди'}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : open ? (
        <Certificate cert={open} name={settings.name} date={certificates[open.id]} number={numberOf(open.id)} />
      ) : (
        <>
          <p className="text-mute">Грамот четыре вида, и каждая следующая наряднее. Нажми на грамоту, чтобы открыть её и распечатать.</p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(TIERS) as Tier[]).map((t) => {
              const n = earned.filter((c) => tierOf(c) === t).length;
              return (
                <li key={t} className={`flex flex-col items-center gap-1 rounded-xl3 bg-card p-4 text-center shadow ${n ? '' : 'opacity-70'}`}>
                  <div className={`cert-mini ${n ? '' : 'grayscale'}`} data-tier={t}><Medal cert={SAMPLE[t]} uid={`tier-${t}`} /></div>
                  <b>{TIERS[t].name}</b>
                  <span className="text-sm text-mute">{TIERS[t].how}</span>
                  <span className={`mt-1 rounded-full px-3 py-1 text-sm font-bold ${n ? 'bg-sun text-navy' : 'bg-soft text-mute'}`}>{n ? `Получено: ${n}` : 'Ещё впереди'}</span>
                </li>
              );
            })}
          </ul>
          {earned.length === 0 && (
            <div className="flex items-center gap-5 rounded-xl3 bg-card p-6 shadow">
              <Mascot size={110} mood="read" />
              <p className="text-lg">Пока грамот нет. Пройди тему на 100% — и первая грамота твоя!</p>
            </div>
          )}
          {earned.length > 0 && <h2 className="text-2xl font-bold">Мои грамоты: {earned.length}</h2>}
          <ul className="grid gap-3 sm:grid-cols-2">
            {sorted.map((c) => (
              <li key={c.id}>
                <button onClick={() => setOpenId(c.id)} className="flex min-h-touch w-full items-center gap-4 rounded-xl3 bg-card p-4 text-left shadow active:scale-[0.99]">
                  <span className="cert-mini shrink-0" data-tier={tierOf(c)}><Medal cert={c} uid={`list-${c.id.replace(/[^a-z0-9]/gi, '')}`} /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-mute">{TIERS[tierOf(c)].name} · № {numberOf(c.id)}</span>
                    <b className="block">{c.title}</b>
                    <span className="text-sm text-mute">{fmt(certificates[c.id])}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
