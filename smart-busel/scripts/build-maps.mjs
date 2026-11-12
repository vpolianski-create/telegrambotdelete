// Собирает контурные карты для уроков из открытых данных Natural Earth (общественное достояние).
// Запуск: node scripts/build-maps.mjs <папка с geojson Natural Earth>
// Нужны файлы: ne_110m_land, ne_50m_land, ne_50m_admin_0_countries, ne_10m_rivers (это ne_10m_rivers_lake_centerlines).
// Результат — content/maps/<id>.json: размеры, границы (долгота/широта) и готовые SVG-контуры. В приложении исходные данные не нужны.
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) { console.error('Укажи папку с файлами Natural Earth'); process.exit(1); }
const read = (name) => JSON.parse(fs.readFileSync(path.join(src, `${name}.geojson`), 'utf8'));
const outDir = path.resolve('content/maps');
fs.mkdirSync(outDir, { recursive: true });

const W = 640;
/** Карта: границы по долготе и широте. Высота считается так, чтобы очертания не были растянуты на средней широте. */
function frame({ west, east, south, north, flat }) {
  const k = flat ? 1 : Math.cos(((south + north) / 2) * Math.PI / 180);
  const h = Math.round((W * (north - south)) / ((east - west) * k));
  return { w: W, h, west, east, south, north };
}
const proj = (f) => ([lon, lat]) => [((lon - f.west) / (f.east - f.west)) * f.w, ((f.north - lat) / (f.north - f.south)) * f.h];

// обрезка многоугольника прямоугольником (алгоритм Сазерленда — Ходжмана), с запасом за краем рисунка
function clipRing(ring, x0, y0, x1, y1) {
  const edges = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i]; const b = inp[(i + 1) % inp.length];
      if (inside(a)) { out.push(a); if (!inside(b)) out.push(cut(a, b)); } else if (inside(b)) out.push(cut(a, b));
    }
    if (!out.length) return [];
  }
  return out;
}
const thin = (pts, min) => { const out = []; for (const p of pts) { const q = out[out.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) >= min) out.push(p); } return out; };
const d = (pts, close) => pts.length < 2 ? '' : `M${pts.map((p) => `${+p[0].toFixed(1)} ${+p[1].toFixed(1)}`).join('L')}${close ? 'Z' : ''}`;

const polygonsOf = (g) => (!g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const linesOf = (g) => (!g ? [] : g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);

function landPath(features, f, min = 0.7) {
  const p = proj(f); const m = 12; const parts = [];
  for (const ft of features) for (const poly of polygonsOf(ft.geometry)) for (const ring of poly) {
    const pts = thin(clipRing(ring.map(p), -m, -m, f.w + m, f.h + m), min);
    if (pts.length >= 3) parts.push(d(pts, true));
  }
  return parts.join('');
}
function riverPath(features, f) {
  const p = proj(f); const parts = [];
  for (const ft of features) for (const line of linesOf(ft.geometry)) {
    let run = [];
    const flush = () => { const t = thin(run, 0.8); if (t.length >= 2) parts.push(d(t, false)); run = []; };
    for (const c of line) { const q = p(c); if (q[0] >= -8 && q[0] <= f.w + 8 && q[1] >= -8 && q[1] <= f.h + 8) run.push(q); else flush(); }
    flush();
  }
  return parts.join('');
}

const land110 = read('ne_110m_land').features;
const land50 = read('ne_50m_land').features;
const countries = read('ne_50m_admin_0_countries').features;
const rivers10 = read('ne_10m_rivers').features;
const named = (set, names) => set.filter((x) => names.includes(x.properties.name));

// в данных одна река записана частями под разными названиями (Евфрат: Firat, Al Furat, Euphrates, Shatt al Arab)
const NILE = ['Nile', 'Rosetta Branch', 'Damietta Branch'];
const TWO = ['Tigris', 'Dicle', 'Euphrates', 'Al Furat', 'Firat', 'Shatt al Arab'];
const OLD = [...NILE, ...TWO, 'Indus', 'Ganges', 'Huang', 'Chang Jiang', 'Yangtze'];
const maps = [
  { id: 'world', title: 'Карта мира', frame: frame({ west: -180, east: 180, south: -90, north: 84, flat: true }), land: land110, rivers: [] },
  { id: 'ancient', title: 'Древний мир', frame: frame({ west: -12, east: 125, south: 3, north: 58 }), land: land50, rivers: named(rivers10, OLD), min: 0.9 },
  { id: 'mediterranean', title: 'Средиземноморье', frame: frame({ west: -10, east: 45, south: 28, north: 49 }), land: land50, rivers: named(rivers10, [...NILE, ...TWO, 'Danube', 'Po', 'Rhine', 'Tevere']) },
  { id: 'neareast', title: 'Передняя Азия и Египет', frame: frame({ west: 24, east: 62, south: 21, north: 43 }), land: land50, rivers: named(rivers10, [...NILE, ...TWO, 'Jordan']) },
  { id: 'empire', title: 'От Греции до Инда', frame: frame({ west: 15, east: 80, south: 18, north: 46 }), land: land50, rivers: named(rivers10, [...NILE, ...TWO, 'Indus']) },
  { id: 'greece', title: 'Древняя Греция', frame: frame({ west: 18, east: 31, south: 34.3, north: 42 }), land: land50, rivers: [] },
  {
    id: 'belarus', title: 'Беларусь', frame: frame({ west: 22.6, east: 33.4, south: 50.9, north: 56.5 }),
    land: countries.filter((c) => c.properties.NAME !== 'Belarus'), focus: countries.filter((c) => c.properties.NAME === 'Belarus'),
    rivers: named(rivers10, ['Dnipro', 'Dnepre', 'Daugava', 'Pripyat', 'Neman', 'Bug']), min: 0.5,
  },
];

for (const m of maps) {
  const out = { id: m.id, title: m.title, ...m.frame, land: landPath(m.land, m.frame, m.min), ...(m.focus ? { focus: landPath(m.focus, m.frame, m.min) } : {}), rivers: riverPath(m.rivers, m.frame) };
  const file = path.join(outDir, `${m.id}.json`);
  fs.writeFileSync(file, JSON.stringify(out));
  console.log(m.id, `${m.frame.w}×${m.frame.h}`, `${Math.round(fs.statSync(file).size / 1024)} КБ`);
}
