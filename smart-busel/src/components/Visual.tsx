import type { Visual as V } from '../content/schema';
import { mapData } from '../content/loader';
import { projectMap, scale, timelineRange, yearLabel, yearPos } from '../engine/visual';

// Рисунки к урокам и заданиям. Всё рисуется кодом (SVG) в цветах приложения, поэтому работает офлайн и в тёмной теме.
const INK = 'var(--ink)';
const MUTE = 'var(--mute)';
const BRAND = 'var(--brand-ink)';
const ACCENT = 'var(--accent)';
const LINE = 'var(--line)';
const font = { fontFamily: 'inherit', fontWeight: 600 } as const;

type Of<K extends V['kind']> = Extract<V, { kind: K }>;

/** Координатный луч: деления, подписи и отмеченные точки. */
function Ray({ v }: { v: Of<'ray'> }) {
  const from = v.from ?? 0;
  const x = (n: number) => scale(n, from, v.to, 44, 580);
  const ticks: number[] = [];
  for (let t = from; t <= v.to + 1e-9; t += v.step) ticks.push(Math.round(t * 1000) / 1000);
  return (
    <svg viewBox="0 0 640 112" className="h-auto w-full" role="img" aria-label="Координатный луч">
      <line x1={x(from)} y1={60} x2={616} y2={60} stroke={INK} strokeWidth={3} />
      <polygon points="630,60 614,53 614,67" fill={INK} />
      {ticks.map((t) => {
        const big = v.labels.includes(t);
        return <line key={t} x1={x(t)} y1={big ? 48 : 52} x2={x(t)} y2={big ? 72 : 68} stroke={INK} strokeWidth={big ? 3 : 2} />;
      })}
      {v.labels.map((t) => <text key={t} x={x(t)} y={96} textAnchor="middle" fontSize={20} fill={INK} style={font}>{String(t).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</text>)}
      {from === 0 && !v.points.some((p) => p.at === 0) && <text x={x(0)} y={34} textAnchor="middle" fontSize={18} fill={MUTE} style={font}>O</text>}
      {v.points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.at)} cy={60} r={8} fill={ACCENT} />
          {p.name && <text x={x(p.at)} y={34} textAnchor="middle" fontSize={22} fill={ACCENT} style={font}>{p.name}</text>}
        </g>
      ))}
    </svg>
  );
}

/** Отрезок AB над линейкой с сантиметровыми делениями. */
function Ruler({ v }: { v: Of<'ruler'> }) {
  const x = (cm: number) => scale(cm, 0, v.length, 56, 584);
  const cms = Array.from({ length: v.length + 1 }, (_, i) => i);
  return (
    <svg viewBox="0 0 640 150" className="h-auto w-full" role="img" aria-label="Отрезок AB и линейка">
      <line x1={x(v.a)} y1={46} x2={x(v.b)} y2={46} stroke={BRAND} strokeWidth={5} strokeLinecap="round" />
      {[[v.a, 'A'], [v.b, 'B']].map(([at, name]) => (
        <g key={name as string}>
          <line x1={x(at as number)} y1={46} x2={x(at as number)} y2={78} stroke={MUTE} strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={x(at as number)} cy={46} r={7} fill={ACCENT} />
          <text x={x(at as number)} y={28} textAnchor="middle" fontSize={22} fill={ACCENT} style={font}>{name}</text>
        </g>
      ))}
      <rect x={36} y={78} width={568} height={56} rx={8} fill="var(--sun)" fillOpacity={0.3} stroke={INK} strokeWidth={2} />
      {cms.map((c) => (
        <g key={c}>
          <line x1={x(c)} y1={78} x2={x(c)} y2={98} stroke={INK} strokeWidth={2} />
          {c < v.length && <line x1={x(c + 0.5)} y1={78} x2={x(c + 0.5)} y2={90} stroke={INK} strokeWidth={1.2} />}
          <text x={x(c)} y={122} textAnchor="middle" fontSize={17} fill={INK} style={font}>{c}</text>
        </g>
      ))}
      <text x={596} y={96} textAnchor="end" fontSize={13} fill={MUTE} style={font}>см</text>
    </svg>
  );
}

/** Один или несколько углов; прямой угол помечается квадратиком. */
function Angles({ v }: { v: Of<'angles'> }) {
  const cell = 200;
  const R = 84;
  return (
    <svg viewBox={`0 0 ${cell * v.items.length} 176`} className="mx-auto h-auto w-full" style={{ maxWidth: cell * v.items.length * 1.25 }} role="img" aria-label="Угол">
      {v.items.map((it, i) => {
        const vx = i * cell + (it.deg > 90 ? 104 : 52);
        const vy = 128;
        const rad = (it.deg * Math.PI) / 180;
        const ex = vx + R * Math.cos(rad);
        const ey = vy - R * Math.sin(rad);
        const ax = vx + 28 * Math.cos(rad);
        const ay = vy - 28 * Math.sin(rad);
        return (
          <g key={i}>
            {it.deg === 90
              ? <path d={`M ${vx + 18} ${vy} L ${vx + 18} ${vy - 18} L ${vx} ${vy - 18}`} fill="none" stroke={ACCENT} strokeWidth={2.5} />
              : <path d={`M ${vx + 28} ${vy} A 28 28 0 0 0 ${ax} ${ay}`} fill="none" stroke={ACCENT} strokeWidth={2.5} />}
            <line x1={vx} y1={vy} x2={vx + R} y2={vy} stroke={INK} strokeWidth={3} strokeLinecap="round" />
            <line x1={vx} y1={vy} x2={ex} y2={ey} stroke={INK} strokeWidth={3} strokeLinecap="round" />
            <circle cx={vx} cy={vy} r={5} fill={INK} />
            {it.label && <text x={i * cell + cell / 2} y={166} textAnchor="middle" fontSize={17} fill={INK} style={font}>{it.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Точки рядами: полные ряды — одним цветом, остаток — другим (деление с остатком, умножение). */
function Dots({ v }: { v: Of<'dots'> }) {
  const step = 36;
  const rows = Math.ceil(v.total / v.perRow);
  const full = Math.floor(v.total / v.perRow);
  const w = v.perRow * step + 24;
  return (
    <svg viewBox={`0 0 ${w} ${rows * step + 16}`} className="mx-auto h-auto w-full" style={{ maxWidth: Math.min(560, w * 1.3) }} role="img" aria-label="Точки рядами">
      {Array.from({ length: full }, (_, r) => (
        <rect key={r} x={6} y={r * step + 6} width={v.perRow * step + 12} height={step - 4} rx={14} fill="none" stroke={LINE} strokeWidth={2} />
      ))}
      {Array.from({ length: v.total }, (_, i) => {
        const r = Math.floor(i / v.perRow);
        return <circle key={i} cx={(i % v.perRow) * step + 12 + step / 2} cy={r * step + 4 + step / 2} r={11} fill={r < full ? BRAND : ACCENT} />;
      })}
    </svg>
  );
}

/** Прямая, луч и отрезок — чем они отличаются. */
function Lines() {
  const dot = (x: number, y: number, name: string) => (
    <g key={name}><circle cx={x} cy={y} r={6} fill={ACCENT} /><text x={x} y={y - 14} textAnchor="middle" fontSize={19} fill={ACCENT} style={font}>{name}</text></g>
  );
  const cap = (y: number, text: string) => <text x={20} y={y + 6} fontSize={18} fill={INK} style={font}>{text}</text>;
  return (
    <svg viewBox="0 0 640 210" className="h-auto w-full" role="img" aria-label="Прямая, луч и отрезок">
      {cap(48, 'прямая')}
      <line x1={150} y1={48} x2={620} y2={48} stroke={INK} strokeWidth={3} strokeDasharray="1 0" />
      <line x1={130} y1={48} x2={150} y2={48} stroke={INK} strokeWidth={3} strokeDasharray="4 5" />
      <line x1={620} y1={48} x2={638} y2={48} stroke={INK} strokeWidth={3} strokeDasharray="4 5" />
      {dot(270, 48, 'A')}{dot(470, 48, 'B')}
      {cap(118, 'луч')}
      <line x1={190} y1={118} x2={620} y2={118} stroke={INK} strokeWidth={3} />
      <line x1={620} y1={118} x2={638} y2={118} stroke={INK} strokeWidth={3} strokeDasharray="4 5" />
      {dot(190, 118, 'O')}{dot(430, 118, 'C')}
      {cap(188, 'отрезок')}
      <line x1={230} y1={188} x2={510} y2={188} stroke={INK} strokeWidth={3} />
      {dot(230, 188, 'M')}{dot(510, 188, 'K')}
    </svg>
  );
}

/** Лента времени: слева — до нашей эры, справа — наша эра; года 0 нет. Близкие события поднимаются «этажом» выше. */
function Timeline({ v }: { v: Of<'timeline'> }) {
  const events = [...v.events].sort((a, b) => a.year - b.year);
  const r = timelineRange(events.map((e) => e.year));
  const x = (year: number) => scale(yearPos(year), yearPos(r.from), yearPos(r.to), 48, 580);
  const labelled = events.some((e) => e.label);
  const crosses = r.from < 0 && r.to > 0;
  // этаж каждого события: если кружок налезает на соседний, ставим его выше
  const last: number[] = [];
  const level = events.map((e) => {
    if (!labelled) return 0;
    let l = 0;
    while (last[l] !== undefined && x(e.year) - last[l] < 30) l++;
    last[l] = x(e.year);
    return l;
  });
  const up = Math.max(...level) * 30;
  const ay = 74 + up; // высота оси
  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 640 ${128 + up}`} className="h-auto w-full" role="img" aria-label="Лента времени">
        <line x1={24} y1={ay} x2={612} y2={ay} stroke={INK} strokeWidth={3} />
        <polygon points={`628,${ay} 612,${ay - 7} 612,${ay + 7}`} fill={INK} />
        {crosses && <line x1={x(1)} y1={22} x2={x(1)} y2={ay + 18} stroke={ACCENT} strokeWidth={2} strokeDasharray="5 5" />}
        {r.from < 0 && <text x={crosses ? x(1) - 10 : 30} y={18} textAnchor={crosses ? 'end' : 'start'} fontSize={15} fill={MUTE} style={font}>← до нашей эры</text>}
        {r.to > 0 && <text x={crosses ? x(1) + 10 : 610} y={18} textAnchor={crosses ? 'start' : 'end'} fontSize={15} fill={MUTE} style={font}>наша эра →</text>}
        {r.ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={ay - 8} x2={x(t)} y2={ay + 8} stroke={INK} strokeWidth={2} />
            <text x={x(t)} y={ay + 32} textAnchor="middle" fontSize={15} fill={MUTE} style={font}>{Math.abs(t)}</text>
          </g>
        ))}
        {events.map((e, i) => {
          const cy = ay - level[i] * 30;
          return (
            <g key={i}>
              {level[i] > 0 && <line x1={x(e.year)} y1={cy} x2={x(e.year)} y2={ay} stroke={ACCENT} strokeWidth={2} />}
              <circle cx={x(e.year)} cy={cy} r={labelled ? 13 : 9} fill={ACCENT} />
              {labelled
                ? <text x={x(e.year)} y={cy + 6} textAnchor="middle" fontSize={16} fill="var(--on-accent)" style={font}>{i + 1}</text>
                : <text x={x(e.year)} y={i % 2 ? ay - 38 : ay - 20} textAnchor="middle" fontSize={16} fill={ACCENT} style={font}>{yearLabel(e.year)}</text>}
            </g>
          );
        })}
      </svg>
      {labelled && (
        <ol className="flex flex-col gap-1 px-2 text-base">
          {events.map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-onaccent">{i + 1}</span>
              <span><b>{yearLabel(e.year)}</b>{e.label ? ` — ${e.label}` : ''}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Для задания «покажи на карте»: что выбрано, какой ответ верный и что делать при нажатии на точку. */
export type MapPick = { done: boolean; picked?: string; answer: string; onPick: (name: string) => void };

/** Контурная карта с городами, областями, морями и реками. В задании точки без подписей — по ним нажимают. */
function MapView({ v, pick }: { v: Of<'map'>; pick?: MapPick }) {
  const m = mapData(v.map);
  if (!m) return null;
  const asking = !!v.pick && !pick?.done; // пока не ответили, подписи точек скрыты
  const halo = { paintOrder: 'stroke', stroke: 'var(--map-land)', strokeWidth: 3.5, strokeLinejoin: 'round' } as const;
  const side = (p: Of<'map'>['points'][number], x: number) => p.label ?? (x > m.w - 110 ? 'l' : 'r');
  const labelAt = (p: Of<'map'>['points'][number], x: number, y: number, gap: number) => {
    const s = side(p, x);
    return s === 'r' ? { x: x + gap, y: y + 5, anchor: 'start' as const } : s === 'l' ? { x: x - gap, y: y + 5, anchor: 'end' as const }
      : s === 't' ? { x, y: y - gap - 2, anchor: 'middle' as const } : { x, y: y + gap + 14, anchor: 'middle' as const };
  };
  return (
    <svg viewBox={`0 0 ${m.w} ${m.h}`} className="h-auto w-full rounded-xl2" style={{ background: 'var(--map-sea)' }} role="img" aria-label={`Карта: ${m.title}`}>
      <path d={m.land} fill="var(--map-land)" stroke="var(--map-edge)" strokeWidth={0.8} />
      {m.focus && <path d={m.focus} fill="var(--map-focus)" stroke={INK} strokeWidth={1.6} />}
      <path d={m.rivers} fill="none" stroke="var(--map-river)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      {v.points.filter((p) => p.type === 'water').map((p) => {
        const { x, y } = projectMap(m, p.lon, p.lat);
        return <text key={p.name} x={x} y={y} textAnchor="middle" fontSize={13} fontStyle="italic" fill="var(--map-water-ink)" style={{ ...font, fontWeight: 700 }}>{p.name}</text>;
      })}
      {v.points.filter((p) => p.type === 'area').map((p) => {
        const { x, y } = projectMap(m, p.lon, p.lat);
        return <text key={p.name} x={x} y={y} textAnchor="middle" fontSize={13} letterSpacing={2} fill={MUTE} style={{ ...font, ...halo }}>{p.name.toUpperCase()}</text>;
      })}
      {v.points.filter((p) => p.type === 'city' || p.type === 'spot').map((p) => {
        const { x, y } = projectMap(m, p.lon, p.lat);
        if (v.pick) {
          const right = pick?.done && p.name === pick.answer;
          const wrong = pick?.done && p.name === pick.picked && !right;
          const fill = right ? 'var(--ok)' : wrong ? 'var(--accent)' : pick?.done ? MUTE : 'var(--brand)';
          const l = labelAt(p, x, y, 16);
          return (
            <g key={p.name} data-option={p.name} role="button" tabIndex={asking ? 0 : -1} aria-label={asking ? 'Точка на карте' : p.name}
              style={{ cursor: asking ? 'pointer' : 'default' }}
              onClick={() => asking && pick?.onPick(p.name)}
              onKeyDown={(e) => { if (asking && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick?.onPick(p.name); } }}>
              <circle cx={x} cy={y} r={20} fill="transparent" />
              <circle cx={x} cy={y} r={11} fill={fill} stroke="#fff" strokeWidth={2.5} />
              {(right || wrong) && <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fill="var(--on-brand)" style={font}>{right ? '✓' : '✗'}</text>}
              {!asking && <text x={l.x} y={l.y} textAnchor={l.anchor} fontSize={15} fill={INK} style={{ ...font, ...halo }}>{p.name}</text>}
            </g>
          );
        }
        // город — точка с подписью сбоку; место без города — надпись по центру (или колечко с подписью, если задана сторона)
        const dot = p.type === 'city' || !!p.label;
        const l = labelAt(p, x, y, dot ? 9 : 0);
        return (
          <g key={p.name}>
            {p.type === 'city' && <circle cx={x} cy={y} r={5} fill={ACCENT} stroke="#fff" strokeWidth={1.5} />}
            {p.type === 'spot' && dot && <circle cx={x} cy={y} r={4.5} fill="#fff" stroke={ACCENT} strokeWidth={2.5} />}
            <text x={dot ? l.x : x} y={dot ? l.y : y + 5} textAnchor={dot ? l.anchor : 'middle'} fontSize={dot ? 15 : 16} fill={INK} style={{ ...font, ...halo }}>{p.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Visual({ v, pick }: { v: V; pick?: MapPick }) {
  return (
    <figure data-visual={v.kind} className="mx-auto w-full rounded-xl2 bg-bg p-3">
      {v.kind === 'map' && <MapView v={v} pick={pick} />}
      {v.kind === 'ray' && <Ray v={v} />}
      {v.kind === 'ruler' && <Ruler v={v} />}
      {v.kind === 'angles' && <Angles v={v} />}
      {v.kind === 'dots' && <Dots v={v} />}
      {v.kind === 'lines' && <Lines />}
      {v.kind === 'timeline' && <Timeline v={v} />}
    </figure>
  );
}
