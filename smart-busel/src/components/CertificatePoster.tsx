import { useEffect } from 'react';
import markUrl from '../assets/brand/app-mark.png';
import waveUrl from '../assets/brand/mascot-wave.webp';
import { learnSubjects } from '../content/loader';
import type { Cert } from '../engine/certificates';
import { Icon } from './Icon';
import { SubjectArt } from './SubjectArt';

/**
 * Грамота-постер (вариант Б): главное на листе — имя, много воздуха, один акцент — цветное зернистое пятно.
 * «Ценность» растёт не от числа украшений, а от материала: 1 — матовый цвет, 2 — зернистый градиент, 3 — «голографическая фольга».
 * За что и когда грамота выдаётся, решает engine/certificates.ts — здесь только рисунок.
 */
export type Tier = 'star' | 'explorer' | 'master' | 'fire';

export const TIERS: Record<Tier, { name: string; how: string }> = {
  star: { name: 'Звёздная грамота', how: 'Пройди тему на 100% — три звезды' },
  explorer: { name: 'Грамота исследователя', how: 'Пройди все темы одного раздела' },
  master: { name: 'Грамота мастера', how: 'Пройди все темы предмета' },
  fire: { name: 'Грамота упорства', how: 'Занимайся 7, 14 или 30 дней подряд' },
};
const KIND_TIER: Record<Cert['kind'], Tier> = { topic: 'star', section: 'explorer', subject: 'master', streak: 'fire' };
export const tierOf = (c: Cert): Tier => KIND_TIER[c.kind];
const streakDays = (c: Cert) => Number(c.id.slice(2)) || 0;
/** Материал листа: 1 — матовый, 2 — зернистый градиент, 3 — «фольга». */
export const levelOf = (c: Cert) => (c.kind === 'subject' ? 3 : c.kind === 'section' ? 2 : c.kind === 'streak' ? (streakDays(c) >= 30 ? 3 : streakDays(c) >= 14 ? 2 : 1) : 1);

const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};

/** Предмет грамоты и короткие факты о достижении — по id грамоты: t:тема, s:раздел, j:предмет, k:дни. */
function details(c: Cert) {
  const key = c.id.slice(2);
  const ready = (ts: { status: string }[]) => ts.filter((t) => t.status === 'ready').length;
  if (c.kind === 'streak') return { subject: undefined, facts: [`${streakDays(c)} ${plural(streakDays(c), 'день', 'дня', 'дней')} подряд`, 'ни одного пропуска'] };
  for (const s of learnSubjects) {
    if (c.kind === 'subject' && s.id === key) {
      const n = ready(s.sections.flatMap((x) => x.topics));
      return { subject: s, facts: [`${n} ${plural(n, 'тема', 'темы', 'тем')}`, `${s.sections.length} ${plural(s.sections.length, 'раздел', 'раздела', 'разделов')}`, 'предмет пройден целиком'] };
    }
    for (const sec of s.sections) {
      if (c.kind === 'section' && sec.id === key) { const n = ready(sec.topics); return { subject: s, facts: [s.title, `${n} ${plural(n, 'тема', 'темы', 'тем')} из ${n}`] }; }
      if (c.kind === 'topic' && sec.topics.some((t) => t.id === key)) return { subject: s, facts: [s.title, '100%', 'три звезды'] };
    }
  }
  return { subject: undefined, facts: [] as string[] };
}

/** Печать-наклейка: кольцо с надписью по кругу и картинка предмета в центре. */
export function Seal({ cert, uid }: { cert: Cert; uid: string }) {
  const { subject } = details(cert);
  const ring = `${TIERS[tierOf(cert)].name} · Умный Бусел · `.toUpperCase();
  return (
    <div className="cb-seal" data-tier={tierOf(cert)} data-level={levelOf(cert)}>
      <svg viewBox="-100 -100 200 200" aria-hidden focusable="false">
        <defs><path id={`ring-${uid}`} d="M0,-79a79,79 0 1,1 -0.01,0" /></defs>
        <circle r="98" className="cb-seal-rim" />
        <circle r="97" fill="var(--c-seal)" />
        <text className="cb-seal-text"><textPath href={`#ring-${uid}`} textLength="490" lengthAdjust="spacing">{ring}</textPath></text>
        <circle r="64" fill="none" stroke="var(--c-ink)" strokeOpacity="0.18" strokeWidth="1" />
      </svg>
      <div className="cb-seal-emblem">
        {cert.kind === 'streak' ? <Icon name="fire" size={24} style={{ width: '4.2em', height: '4.2em', color: 'var(--c-a)' }} />
          : subject ? <SubjectArt subject={subject} size={96} /> : <Icon name="star" size={24} style={{ width: '4em', height: '4em', color: 'var(--c-a)' }} />}
      </div>
    </div>
  );
}

const fmt = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

/** Лист грамоты. mini — уменьшенный лист для «стены грамот» (без анимации и настройки печати). */
export function CertificatePoster({ cert, name, date, number, mini = false }: { cert: Cert; name: string; date: string; number: number; mini?: boolean }) {
  const tier = tierOf(cert);
  const level = levelOf(cert);
  const { facts } = details(cert);
  // пока грамота открыта, печать идёт на альбомный лист A4 (на недельный отчёт это не влияет)
  useEffect(() => {
    if (mini) return;
    const style = document.createElement('style');
    style.textContent = '@page { size: A4 landscape; margin: 8mm; }';
    document.head.appendChild(style);
    return () => style.remove();
  }, [mini]);
  const big = cert.kind === 'streak' ? String(streakDays(cert)) : String(number).padStart(2, '0');
  // имя — главный элемент: чем короче, тем крупнее, но всегда в одну строку
  const nameSize = Math.min(8.2, 36 / Math.max(4, name.length));
  return (
    <div className={`cb ${mini ? '' : 'print-area cb-open'}`} data-tier={tier} data-level={level} aria-hidden={mini || undefined}>
      <div className="cb-body">
        <div className="cb-blob" aria-hidden />
        <div className="cb-grain" aria-hidden />
        <div className="cb-num" aria-hidden>{big}</div>
        <header className="cb-top">
          <span className="cb-brand"><img src={markUrl} alt="" draggable={false} /> Умный Бусел</span>
          <span>Грамота № {String(number).padStart(2, '0')}</span>
        </header>
        <div className="cb-main">
          <p className="cb-tier">{TIERS[tier].name}</p>
          <p className="cb-given">награждается</p>
          <p className="cb-name" style={{ fontSize: `${nameSize}em` }}>{name}</p>
          <p className="cb-title">{cert.title}</p>
          <ul className="cb-facts">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <Seal cert={cert} uid={`${mini ? 'm' : 'b'}-${cert.id.replace(/[^a-z0-9]/gi, '')}`} />
        <footer className="cb-foot">
          <span><small>Дата</small>{fmt(date)}</span>
          <span className="cb-by"><img src={waveUrl} alt="" draggable={false} /><span><small>Вручил</small>Бусел</span></span>
        </footer>
      </div>
    </div>
  );
}
