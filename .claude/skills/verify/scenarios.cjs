/*
 * Сценарии «глазами пользователя» для /verify: запускает НАСТОЯЩЕЕ приложение Electron
 * (preload, хранилище data.json, IPC) с интерфейсом из dev-сервера Vite и проходит ключевые
 * сценарии из feature-map.md. Каждый шаг — PASS/FAIL + снимок экрана.
 *
 * Запуск (из smart-busel, dev-сервер уже работает на :5173):
 *   xvfb-run -a node ../.claude/skills/verify/scenarios.cjs <папка отчёта>
 * Итог: <папка>/report.json и <папка>/NN-*.png; код выхода 0 — все PASS, 1 — есть FAIL.
 */
const { _electron: electron } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const OUT = path.resolve(process.argv[2] || 'verify-report');
const PROJECT = process.cwd(); // smart-busel
const DEV_URL = process.env.VERIFY_DEV_URL || 'http://localhost:5173';
const ELECTRON = require(path.join(PROJECT, 'node_modules/electron')); // путь к бинарнику
fs.mkdirSync(OUT, { recursive: true });

// Чистый «компьютер» на каждый прогон: свой HOME → своя папка данных, настоящие файлы родителя не трогаем.
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'busel-verify-'));
// Начальные данные: уровень уже показан (без окна «новый уровень»), без звука и перерывов; две старые грамоты
// и одна по новым правилам — для сценария «Грамоты».
const SEED = {
  contentRev: 2, levelSeen: 99,
  settings: { name: 'Женя', sound: false, breakEveryMin: 0, theme: 'dark' },
  // порог награды — как у родителя по умолчанию (100): окно награды тоже часть сценария и закрывается кнопкой «Ура!»
  certificates: { 't:math-t01': '2026-01-01', 'k:7': '2026-01-02', 'k:30': '2026-02-01' },
};

const results = [];
let shot = 0;
const launch = () => electron.launch({
  executablePath: ELECTRON, args: [PROJECT, '--no-sandbox'],
  env: { ...process.env, HOME, VITE_DEV_SERVER_URL: DEV_URL, ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }, timeout: 60000,
});

async function main() {
  // 1-й запуск — узнать папку данных и записать в неё начальные данные; 2-й — работать с ними
  let app = await launch();
  const userData = await app.evaluate(({ app: a }) => a.getPath('userData'));
  await app.close();
  fs.mkdirSync(userData, { recursive: true });
  fs.writeFileSync(path.join(userData, 'data.json'), JSON.stringify(SEED));

  app = await launch();
  const w = await app.firstWindow();
  const errors = [];
  w.on('pageerror', (e) => errors.push(e.message));
  w.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|favicon|DevTools/.test(m.text())) errors.push(m.text()); });
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1280, 820));

  const nav = (name) => w.locator('nav[aria-label="Главное меню"]').getByRole('button', { name }).first().click();
  const heading = async () => (await w.locator('h1').allTextContents()).join(' | ');
  const pause = (ms) => w.waitForTimeout(ms);

  // Всплывающие окна закрываем, как это сделал бы ребёнок: награда «Ура!», слово Бусела «Хорошо», новый уровень и т. п.
  async function dismiss() {
    for (let i = 0; i < 6; i++) {
      // сначала окна поверх экрана (награда, новый уровень, перерыв) — пока они открыты, остальное не нажать
      const dlg = w.locator('[role=dialog][aria-modal=true] button').filter({ hasText: /^\s*(Ура!?|Хорошо|Отлично|Понятно|Продолжить)\s*$/ });
      if (await dlg.count()) { await dlg.last().click({ timeout: 2000 }).catch(() => {}); await pause(300); continue; }
      const word = w.getByRole('button', { name: /^Хорошо$/ }); // слово Бусела в уроке
      if (await word.count()) { await word.first().click({ timeout: 2000 }).catch(() => {}); await pause(200); continue; }
      return;
    }
  }

  async function step(name, fn) {
    const t0 = Date.now(); const before = errors.length;
    process.stdout.write(`…  ${name}\n`);
    try {
      await dismiss();
      const note = await fn();
      const errs = errors.slice(before);
      if (errs.length) throw new Error('ошибки на странице: ' + errs.join(' ; '));
      results.push({ name, ok: true, note: note || '', ms: Date.now() - t0 });
    } catch (e) {
      results.push({ name, ok: false, note: String(e.message || e).split('\n')[0], ms: Date.now() - t0 });
    }
    const file = `${String(++shot).padStart(2, '0')}-${name.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40)}.png`;
    await w.screenshot({ path: path.join(OUT, file) }).catch(() => {});
    results[results.length - 1].screenshot = file;
    // после шага — вернуться на главную, чтобы следующий начинался с одного места
    await dismiss();
    if (await w.locator('iframe').count()) await w.getByRole('button', { name: /Закрыть/ }).first().click().catch(() => {});
    await w.keyboard.press('Escape').catch(() => {});
    await nav(/Главная/).catch(() => {});
    await pause(300);
  }

  // ждём, пока ответить «по-человечески» можно: варианты появляются не сразу (пауза против угадывания)
  async function answer(right) {
    await dismiss();
    const task = w.locator('[data-task]').first();
    const ans = await task.getAttribute('data-answer');
    const type = await task.getAttribute('data-task');
    let given = ans;
    if (!right) given = type === 'truefalse' ? String(ans !== 'true') : type === 'input' ? '999999' : null;
    if (given === null) { // выбор: берём любой неверный вариант
      const opts = await w.locator('[data-task] [data-option]').evaluateAll((els) => els.map((e) => e.getAttribute('data-option')));
      given = opts.find((o) => o !== ans);
    }
    const opt = w.locator(`[data-task] [data-option="${given}"]`);
    if (await w.locator('input[aria-label=Ответ]').count()) {
      await w.locator('input[aria-label=Ответ]').fill(given); await w.keyboard.press('Enter');
    } else {
      await opt.first().waitFor({ state: 'visible', timeout: 8000 });
      await w.waitForFunction((g) => { const b = document.querySelector(`[data-task] [data-option="${g}"]`); return b && !b.disabled; }, given, { timeout: 8000 });
      await opt.first().click();
    }
    return { type, ans, given };
  }
  const clickNext = async () => { await dismiss(); await w.getByRole('button', { name: /^(Дальше|Понятно|Следующий шаг|Проверь себя|К заданиям|Начать)/ }).last().click(); };

  await w.waitForSelector('nav[aria-label="Главное меню"]', { timeout: 30000 });
  w.setDefaultTimeout(8000); // одно действие — не дольше 8 с, чтобы зависание было видно сразу

  await step('Запуск и главная', async () => {
    if (!(await w.evaluate(() => !!window.busel))) throw new Error('нет моста Electron (window.busel)');
    const h = await heading();
    if (!/Женя/.test(await w.locator('main').innerText())) throw new Error('на главной нет имени ребёнка');
    return h;
  });

  let mistakeQuestion = '';
  await step('Урок: карточки → задания → итог (с ошибкой и второй попыткой)', async () => {
    await nav(/Предметы/); await pause(300);
    await w.getByRole('button', { name: /Математика/ }).first().click(); await pause(300);
    await w.getByRole('button', { name: /Признаки делимости/ }).first().click(); await pause(500);
    let wrongDone = false, retried = false, answered = 0;
    for (let k = 0; k < 80; k++) {
      await dismiss();
      const h = await heading();
      if (/Итог/.test(h)) break;
      if (await w.getByRole('button', { name: /^Пропустить/ }).count() && /бонус|посложнее/i.test(await w.locator('main').innerText())) {
        await w.getByRole('button', { name: /^Пропустить/ }).last().click(); await pause(300); continue;
      }
      if (await w.locator('[data-task]').count()) {
        const type = await w.locator('[data-task]').first().getAttribute('data-task');
        const canBeWrong = ['single', 'input'].includes(type) && /Практика/.test(h);
        if (!wrongDone && canBeWrong) {
          mistakeQuestion = (await w.locator('[data-task]').first().innerText()).split('\n')[0];
          await answer(false); wrongDone = true; await pause(500);
          // вторая попытка: тот же вопрос снова ждёт ответа
          if (await w.locator('[data-task] [data-option]:not([disabled]), input[aria-label=Ответ]').count()) { await answer(true); retried = true; }
        } else await answer(true);
        answered++;
        await pause(300); await clickNext(); await pause(250);
      } else { await clickNext(); await pause(250); }
    }
    if (!/Итог/.test(await heading())) throw new Error(`не дошли до итога (ответов: ${answered})`);
    if (!wrongDone) throw new Error('не нашлось задания, чтобы проверить ошибку');
    return `ответов ${answered}; вторая попытка: ${retried ? 'была' : 'нет (тип задания без неё)'}`;
  });

  await step('Баллы сохранились после перезапуска', async () => {
    const pts = await w.evaluate(async () => (await window.busel.load()).points);
    if (!(pts > 0)) throw new Error('в файле данных нет баллов после урока: ' + pts);
    await w.reload(); await w.waitForSelector('nav[aria-label="Главное меню"]');
    const again = await w.evaluate(async () => (await window.busel.load()).points);
    if (again !== pts) throw new Error(`после перезагрузки баллов ${again}, было ${pts}`);
    return `баллов: ${pts}`;
  });

  await step('Работа над ошибками: ошибка из урока в списке', async () => {
    if (!mistakeQuestion) throw new Error('в уроке не было ошибки — проверять нечего');
    await nav(/Работа над ошибками/); await pause(400);
    // задание «по образцу» в разборе ошибок даётся новым вариантом — сверяем тему и число ошибок, а не текст
    if (!/Работа над ошибками · 1\/1/.test(await heading())) throw new Error('ожидалась 1 ошибка, заголовок: ' + await heading());
    const q = (await w.locator('[data-task]').first().innerText()).split('\n')[0];
    await answer(true); await pause(400);
    return `ошибка «${mistakeQuestion}» → разбор «${q}»`;
  });

  await step('Мой план: добавить тему', async () => {
    await nav(/Предметы/); await pause(300);
    await w.getByRole('button', { name: /Математика/ }).first().click(); await pause(300);
    await w.getByRole('button', { name: 'Добавить в план на сегодня' }).first().click(); await pause(300);
    if (!(await w.getByRole('button', { name: 'В плане на сегодня' }).count())) throw new Error('кнопка не сменилась на «В плане»');
    const planned = await w.evaluate(async () => (await window.busel.load()).plan.topics);
    if (planned.length !== 1) throw new Error('в файле данных в плане тем: ' + planned.length);
    await nav(/Главная/); await pause(400);
    const home = await w.locator('main').innerText();
    if (!/план/i.test(home)) throw new Error('на главной не видно плана на сегодня');
    return 'в плане: ' + planned[0];
  });

  await step('Мультурок: открывается и играет', async () => {
    await nav(/Предметы/); await pause(300);
    await w.getByRole('button', { name: /Математика/ }).first().click(); await pause(300);
    await w.getByRole('button', { name: /^Мультурок/ }).first().click();
    const frame = w.frameLocator('iframe').first();
    await frame.locator('#bar, body').first().waitFor({ timeout: 10000 });
    const chapter = await w.locator('iframe').first().evaluate((f) => f.contentWindow.eval("typeof CHAPTER === 'undefined' ? '' : CHAPTER.title"));
    if (!chapter) throw new Error('ролик не загрузился (нет CHAPTER)');
    await frame.getByRole('button', { name: /Смотреть/ }).click();
    await pause(2500);
    const t = await w.locator('iframe').first().evaluate((f) => f.contentWindow.eval('P.t'));
    if (!(t > 0.5)) throw new Error('ролик не пошёл: время ' + t);
    await w.getByRole('button', { name: /Закрыть/ }).click(); await pause(300);
    if (await w.locator('iframe').count()) throw new Error('плеер не закрылся');
    return `${chapter}; за 2,5 с прошло ${(+t).toFixed(1)} с`;
  });

  await step('Грамоты: только по новым правилам, лист для печати', async () => {
    await nav(/Коллекция/); await pause(300);
    await w.getByRole('button', { name: /Мои грамоты/ }).click(); await pause(400);
    const text = await w.locator('main').innerText();
    if (/Отличное знание темы|7 дней занятий/.test(text)) throw new Error('видна грамота по старым правилам');
    if (!/30 дней занятий подряд/.test(text)) throw new Error('нет грамоты за 30 дней');
    const saved = await w.evaluate(async () => Object.keys((await window.busel.load()).certificates).sort().join(','));
    if (saved !== 'k:30') throw new Error('в файле данных остались старые грамоты: ' + saved);
    await w.getByRole('button', { name: /30 дней занятий подряд/ }).first().click(); await pause(400);
    if (!(await w.getByRole('button', { name: /Распечатать/ }).count())) throw new Error('нет кнопки «Распечатать»');
    return 'в файле: ' + saved;
  });

  await step('Родителям: PIN 0000 и отчёт', async () => {
    await nav(/Родителям/); await pause(300);
    await w.locator('input[aria-label=PIN]').fill('0000'); await w.keyboard.press('Enter'); await pause(500);
    const text = await w.locator('main').innerText();
    if (/Введите PIN/.test(text)) throw new Error('PIN 0000 не открыл родительский режим');
    await w.getByRole('button', { name: /^Отчёт за неделю/ }).first().click(); await pause(400);
    const report = await w.locator('main').innerText();
    // урок из сценария «Урок» должен попасть в отчёт: тема пройдена, задания посчитаны
    if (!/Признаки делимости/.test(report)) throw new Error('в отчёте за неделю нет пройденной темы «Признаки делимости»');
    return 'отчёт: тема «Признаки делимости» в пройденных';
  });

  await step('Неверный PIN не пускает', async () => {
    await w.reload(); await w.waitForSelector('nav[aria-label="Главное меню"]');
    await nav(/Родителям/); await pause(300);
    await w.locator('input[aria-label=PIN]').fill('1234'); await w.keyboard.press('Enter'); await pause(400);
    if (!/PIN не подошёл/.test(await w.locator('main').innerText())) throw new Error('нет сообщения «PIN не подошёл»');
  });

  await step('Светлая тема из настроек родителя', async () => {
    await nav(/Родителям/); await pause(300);
    await w.locator('input[aria-label=PIN]').fill('0000'); await w.keyboard.press('Enter'); await pause(400);
    await w.getByRole('button', { name: /^Настройки/ }).first().click(); await pause(300);
    const select = w.locator('label', { hasText: 'Тема' }).locator('select');
    await select.selectOption('light'); await pause(400);
    const light = await w.evaluate(() => [document.documentElement.dataset.theme, getComputedStyle(document.body).backgroundColor]);
    await select.selectOption('dark'); await pause(300);
    if (light[0] !== 'light' || !/rgb\((2[0-9]{2}), (2[0-9]{2})/.test(light[1])) throw new Error('светлая тема не включилась: ' + light.join(' '));
    return light[1];
  });

  await step('Узкое окно (как телефон): нет прокрутки вбок', async () => {
    await app.evaluate(({ BrowserWindow }) => { const b = BrowserWindow.getAllWindows()[0]; b.setMinimumSize(300, 400); b.setSize(390, 844); });
    await pause(500);
    const over = await w.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await w.screenshot({ path: path.join(OUT, 'phone-width.png') }); // вид в узком окне — для глаз
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1280, 820));
    if (over > 1) throw new Error(`страница шире окна на ${over} px`);
    return 'снимок: phone-width.png';
  });

  await app.close();
  fs.rmSync(HOME, { recursive: true, force: true });
}

main()
  .catch((e) => results.push({ name: 'Запуск приложения', ok: false, note: String(e.message || e).split('\n')[0] }))
  .finally(() => {
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 1));
    for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.note ? ' — ' + r.note : ''}`);
    process.exit(results.length && results.every((r) => r.ok) ? 0 : 1);
  });
