import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import cheerUrl from '../assets/brand/mascot-cheer.webp';
import markUrl from '../assets/brand/app-mark.png';
import { learnSubjects } from '../content/loader';
import type { Cert } from '../engine/certificates';
import { Icon } from './Icon';
import { SubjectArt } from './SubjectArt';

/**
 * Внешний вид грамот. За что и когда грамота выдаётся, решает engine/certificates.ts — здесь только рисунок.
 * Четыре вида, каждый следующий наряднее: звёздная (тема на 100%), исследователя (раздел),
 * мастера (весь предмет) и упорства (серия дней: 7, 14, 30).
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

/** Предмет грамоты (для картинки в медали) — по id грамоты: t:тема, s:раздел, j:предмет. */
function subjectOf(c: Cert) {
  const key = c.id.slice(2);
  if (c.kind === 'subject') return learnSubjects.find((s) => s.id === key);
  if (c.kind === 'section') return learnSubjects.find((s) => s.sections.some((x) => x.id === key));
  if (c.kind === 'topic') return learnSubjects.find((s) => s.sections.some((x) => x.topics.some((t) => t.id === key)));
  return undefined;
}
const streakDays = (c: Cert) => Number(c.id.slice(2)) || 0;
/** Насколько нарядна грамота: 1 — звёзды, 2 — лавровый венок, 3 — венок и корона. */
const splendour = (c: Cert) => (c.kind === 'subject' ? 3 : c.kind === 'section' ? 2 : c.kind === 'streak' ? (streakDays(c) >= 30 ? 3 : streakDays(c) >= 14 ? 2 : 1) : 1);

const pt = (r: number, deg: number) => `${(r * Math.cos((deg * Math.PI) / 180)).toFixed(1)},${(r * Math.sin((deg * Math.PI) / 180)).toFixed(1)}`;
const SCALLOP = Array.from({ length: 48 }, (_, i) => pt(i % 2 ? 73 : 80, i * 7.5)).join(' ');
const starPath = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, i) => {
  const a = ((i * 36 - 90) * Math.PI) / 180, rr = i % 2 ? r * 0.45 : r;
  return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
}).join(' ');

/** Медаль: фестончатая печать с лентами; вокруг — звёзды, лавровый венок или корона. */
export function Medal({ cert, uid }: { cert: Cert; uid: string }) {
  const level = splendour(cert);
  const subject = subjectOf(cert);
  const g = `medal-${uid}`;
  // листья венка: по дуге слева и зеркально справа
  const leaves = Array.from({ length: 9 }, (_, i) => {
    const deg = 118 + i * 15; // от низа к верху по левой стороне
    const [x, y] = pt(104, deg).split(',').map(Number);
    return { x, y, rot: deg + 62 };
  });
  return (
    <div className="cert-medal">
      <svg viewBox="-140 -140 280 290" aria-hidden focusable="false">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--c-a)" /><stop offset="1" stopColor="var(--c-b)" /></linearGradient>
        </defs>
        {/* ленты */}
        <path d="M-46 52-70 142-42 124-22 148-4 66z" fill={`url(#${g})`} opacity="0.85" />
        <path d="M46 52 70 142 42 124 22 148 4 66z" fill={`url(#${g})`} opacity="0.7" />
        {level >= 2 && leaves.map((l, i) => (
          <g key={i} fill={`url(#${g})`}>
            <ellipse cx={l.x} cy={l.y} rx="15" ry="6" transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
            <ellipse cx={-l.x} cy={l.y} rx="15" ry="6" transform={`rotate(${180 - l.rot} ${-l.x} ${l.y})`} />
          </g>
        ))}
        <polygon points={SCALLOP} fill={`url(#${g})`} />
        <circle r="64" fill="var(--c-seal)" />
        <circle r="64" fill="none" stroke={`url(#${g})`} strokeWidth="2.5" />
        <circle r="57" fill="none" stroke="var(--c-ink)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 5" />
        {level === 1 && cert.kind === 'topic' && [[-44, -104, 13], [0, -120, 17], [44, -104, 13]].map(([x, y, r]) => <polygon key={x} points={starPath(x, y, r)} fill="#F6C453" />)}
        {level >= 3 && (
          <g>
            <path d="M-30-96-36-128-17-111 0-136 17-111 36-128 30-96z" fill="#F6C453" stroke="#11152A" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="-36" cy="-130" r="4" fill="#F6C453" /><circle cx="0" cy="-138" r="4.5" fill="#F6C453" /><circle cx="36" cy="-130" r="4" fill="#F6C453" />
          </g>
        )}
      </svg>
      <div className="cert-emblem">
        {cert.kind === 'streak' ? (
          <span className="cert-days"><Icon name="fire" size={24} style={{ width: '1.1em', height: '1.1em', color: 'var(--c-a)' }} /><b>{streakDays(cert)}</b><small>дней</small></span>
        ) : subject ? <SubjectArt subject={subject} size={96} /> : <span style={{ fontSize: '3em' }}>{cert.icon}</span>}
      </div>
    </div>
  );
}

const SPARKS = [[6, 14, 1], [13, 30, 0.6], [90, 12, 0.9], [84, 27, 0.6], [94, 46, 0.7], [5, 52, 0.7], [22, 9, 0.5], [76, 8, 0.5], [70, 88, 0.6], [30, 91, 0.5], [96, 78, 0.8]];
const fmt = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

/** Лист грамоты. На экране — тёмный со свечением, при печати — светлый (см. .cert в index.css). */
export function Certificate({ cert, name, date, number }: { cert: Cert; name: string; date: string; number: number }) {
  const tier = tierOf(cert);
  const level = splendour(cert);
  const reduce = useReducedMotion();
  // пока грамота открыта, печать идёт на альбомный лист A4 (на недельный отчёт это не влияет)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = '@page { size: A4 landscape; margin: 8mm; }';
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  return (
    <div className="cert print-area" data-tier={tier} data-level={level}>
      <div className="cert-body">
        <div className="cert-glow" aria-hidden />
        {SPARKS.slice(0, 5 + level * 2).map(([x, y, s], i) => (
          <svg key={i} aria-hidden className="cert-spark" viewBox="0 0 24 24" style={{ left: `${x}%`, top: `${y}%`, width: `${s * 1.6}em`, height: `${s * 1.6}em` }}>
            <path d="M12 0l2.6 9.400L24 12l-9.4 2.600L12 24l-2.6-9.400L0 12l9.4-2.600z" fill="currentColor" />
          </svg>
        ))}
        <div className="cert-frame" aria-hidden />
        {level >= 2 && <div className="cert-frame cert-frame-2" aria-hidden />}
        {['tl', 'tr', 'bl', 'br'].map((k) => (
          <svg key={k} aria-hidden className={`cert-corner cert-corner-${k}`} viewBox="0 0 60 60">
            <path d="M4 56V22A18 18 0 0 1 22 4h34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 56V28a14 14 0 0 1 14-14h28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="9" cy="9" r="3.5" fill="currentColor" />
          </svg>
        ))}

        <div className="cert-content">
          <div className="cert-brand"><img src={markUrl} alt="" draggable={false} /> Умный Бусел</div>
          <p className="cert-word">Грамота</p>
          <p className="cert-tier">{TIERS[tier].name}</p>
          <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.32, ease: 'easeOut' }}>
            <Medal cert={cert} uid={`big-${cert.id.replace(/[^a-z0-9]/gi, '')}`} />
          </motion.div>
          <p className="cert-given">награждается</p>
          <p className="cert-name">{name}</p>
          <p className="cert-title">{cert.title}</p>
          <p className="cert-text">{cert.text}</p>
        </div>

        <img src={cheerUrl} alt="" draggable={false} className="cert-mascot" />
        <div className="cert-foot">
          <span><small>Дата</small>{fmt(date)}</span>
          <span><small>Грамота</small>№ {number}</span>
          <span className="cert-sign"><small>Вручил</small><i>Бусел</i></span>
        </div>
      </div>
    </div>
  );
}
