import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import cheerUrl from '../assets/brand/mascot-cheer.webp';
import markUrl from '../assets/brand/app-mark.png';
import type { Cert } from '../engine/certificates';
import { Medal, TIERS, tierOf } from './Certificate';
import { details, levelOf } from './CertificatePoster';
import { Spark } from './Spark';

/**
 * Грамота, вариант В — совместный. Из «постера» (Б): крупное имя, воздух, зернистое цветное пятно, «фольга», факты.
 * Из «нарядного листа» (А): медаль с венком и короной, рамка, искры, аист.
 * Чем выше достижение (data-level 1–3), тем богаче материал: матовый цвет → градиент → «голографическая фольга».
 * Условия выдачи — engine/certificates.ts, здесь только рисунок.
 */
const SPARKS: [number, number, number][] = [[57, 19, 0.8], [93, 24, 1], [61, 70, 0.6], [95, 58, 0.7], [70, 13, 0.55], [52, 44, 0.5], [88, 80, 0.6], [83, 15, 0.45]];
const fmt = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

export function CertificateCard({ cert, name, date, number, mini = false }: { cert: Cert; name: string; date: string; number: number; mini?: boolean }) {
  const tier = tierOf(cert);
  const level = levelOf(cert);
  const { facts } = details(cert);
  const reduce = useReducedMotion();
  // пока грамота открыта, печать идёт на альбомный лист A4 (на недельный отчёт это не влияет)
  useEffect(() => {
    if (mini) return;
    const style = document.createElement('style');
    style.textContent = '@page { size: A4 landscape; margin: 8mm; }';
    document.head.appendChild(style);
    return () => style.remove();
  }, [mini]);
  const no = String(number).padStart(2, '0');
  const big = cert.kind === 'streak' ? String(Number(cert.id.slice(2)) || 0) : no;
  const nameSize = Math.min(7.6, 33 / Math.max(4, name.length)); // имя всегда в одну строку
  const uid = `${mini ? 'm' : 'b'}-${cert.id.replace(/[^a-z0-9]/gi, '')}`;
  const medal = <Medal cert={cert} uid={uid} />;
  return (
    <div className={`cc ${mini ? '' : 'print-area cc-open'}`} data-tier={tier} data-level={level} aria-hidden={mini || undefined}>
      <div className="cc-body">
        <div className="cc-blob" aria-hidden />
        <div className="cc-grain" aria-hidden />
        <div className="cc-num" aria-hidden>{big}</div>
        <div className="cc-frame" aria-hidden />
        {SPARKS.slice(0, 4 + level * 2).map(([x, y, s], i) => (
          <svg key={i} aria-hidden className="cc-spark" viewBox="0 0 24 24" style={{ left: `${x}%`, top: `${y}%`, width: `${s * 1.7}em`, height: `${s * 1.7}em`, animationDelay: `${0.5 + i * 0.12}s` }}>
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
          </svg>
        ))}

        <header className="cc-top">
          <span className="cc-brand"><img src={markUrl} alt="" draggable={false} /> Умный Бусел</span>
          <span>Грамота № {no}</span>
        </header>

        <div className="cc-main">
          <p className="cc-tier">{TIERS[tier].name}</p>
          <p className="cc-given">награждается</p>
          <p className="cc-name" style={{ fontSize: `${nameSize}em` }}>{name}</p>
          <p className="cc-title">{cert.title}</p>
          {facts.length > 0 && <ul className="cc-facts">{facts.map((f) => <li key={f}>{f}</li>)}</ul>}
        </div>

        <div className="cc-medal">
          {mini ? medal : (
            <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 180, damping: 13, delay: 0.15 }}>
              <Spark>{medal}</Spark>
            </motion.div>
          )}
        </div>

        <footer className="cc-foot">
          <span><small>Дата</small>{fmt(date)}</span>
          <span className="cc-by"><img src={cheerUrl} alt="" draggable={false} /><span><small>Вручил</small><i>Бусел</i></span></span>
        </footer>
      </div>
    </div>
  );
}
