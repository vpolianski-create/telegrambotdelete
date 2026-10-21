import { useState } from 'react';
import { Logo } from '../components/Logo';
import { learnSubjects } from '../content/loader';
import { earnedCertificates } from '../engine/certificates';
import { todayStr, useApp } from '../store/useApp';

const fmt = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

/** Грамоты: список заслуженных и красивый лист для печати (Ctrl+P или кнопка «Распечатать»). */
export function Certificates({ onBack }: { onBack(): void }) {
  const { certificates, settings, topicResults, daily } = useApp();
  const earned = earnedCertificates({ topicResults, daily }, learnSubjects, todayStr()).filter((c) => certificates[c.id]);
  const [openId, setOpenId] = useState<string>();
  const open = earned.find((c) => c.id === openId);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 p-6">
      <div className="no-print flex items-center gap-3">
        <button onClick={() => (open ? setOpenId(undefined) : onBack())} className="rounded-xl2 bg-card px-5 shadow">← Назад</button>
        <h1 className="flex-1 text-3xl font-extrabold">📜 Мои грамоты</h1>
        {open && <button onClick={() => window.print()} className="rounded-xl2 bg-brand px-6 font-extrabold text-white">🖨️ Распечатать</button>}
      </div>

      {open ? (
        <div className="print-area flex flex-col items-center gap-4 rounded-xl3 border-8 border-double border-sun bg-white p-10 text-center text-navy shadow">
          <Logo height={120} />
          <p className="text-lg font-extrabold uppercase tracking-widest">Грамота</p>
          <p className="text-6xl" aria-hidden>{open.icon}</p>
          <p className="text-xl">награждается</p>
          <p className="text-4xl font-extrabold" style={{ fontFamily: 'Rubik, sans-serif' }}>{settings.name}</p>
          <p className="max-w-xl text-2xl font-extrabold">{open.title}</p>
          <p className="max-w-xl text-lg">{open.text}</p>
          <p className="mt-4 text-lg">Дата: {fmt(certificates[open.id])}</p>
          <p className="text-sm">Умный Бусел — учиться интересно!</p>
        </div>
      ) : (
        <>
          <p className="text-mute">Грамоты выдаются за отличные темы (3 звезды), пройденные разделы и предметы и за долгую серию занятий. Нажми на грамоту, чтобы открыть её и распечатать.</p>
          {earned.length === 0 && <p className="rounded-xl3 bg-card p-6 shadow">Пока грамот нет. Пройди тему на 100% — и первая грамота твоя! 🌟</p>}
          <ul className="grid gap-3 sm:grid-cols-2">
            {earned.map((c) => (
              <li key={c.id}>
                <button onClick={() => setOpenId(c.id)} className="flex min-h-touch w-full items-center gap-3 rounded-xl3 bg-card p-4 text-left shadow active:scale-95">
                  <span className="text-4xl" aria-hidden>{c.icon}</span>
                  <span><b>{c.title}</b><br /><span className="text-sm text-mute">{fmt(certificates[c.id])}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
