// Проверка запуска собранной версии (dist) в настоящем Electron: окно с главным меню открылось, мост window.busel есть, ошибок нет.
// Запуск из smart-busel после `npm run build`: xvfb-run -a node ../.claude/skills/verify/launch-check.cjs
const { _electron: electron } = require('playwright');
(async () => {
  const path = require('path'), os = require('os'), fs = require('fs');
  const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'busel-launch-')); // чистая папка данных, настоящие данные не трогаем
  const app = await electron.launch({ executablePath: require(path.join(process.cwd(), 'node_modules/electron')), args: [process.cwd(), '--no-sandbox'],
    env: { ...process.env, HOME, VITE_DEV_SERVER_URL: '' }, timeout: 60000 });
  const w = await app.firstWindow();
  const errs = []; w.on('pageerror', (e) => errs.push(e.message));
  await w.waitForSelector('nav[aria-label="Главное меню"]', { timeout: 30000 });
  const hasBusel = await w.evaluate(() => !!window.busel);
  const url = w.url();
  console.log(JSON.stringify({ title: await w.title(), url, busel: hasBusel, errors: errs }));
  await app.close();
  fs.rmSync(HOME, { recursive: true, force: true });
  if (!hasBusel || errs.length || !url.startsWith('file://')) process.exit(1);
})().catch((e) => { console.log('FAIL', e.message); process.exit(1); });
