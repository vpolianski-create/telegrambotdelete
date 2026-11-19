/*
 * Сценарии «глазами пользователя» для /verify (см. feature-map.md): запускает НАСТОЯЩЕЕ приложение Electron
 * (preload, хранилище data.json, IPC) с интерфейсом из dev-сервера Vite и проходит ключевые сценарии.
 *
 * Правила (по статье команды Claude Code о верификации):
 *  — никаких фиксированных пауз и повторов «до зелёного»: каждое действие ждёт конкретного признака на экране;
 *  — у каждого сценария журнал действий; при сбое — какое действие не удалось и почему, словами, + снимок экрана;
 *  — доказательство успеха — то, что видно человеку или лежит в data.json, а не «не упало».
 *
 * Запуск (из smart-busel, dev-сервер уже работает на :5173):
 *   xvfb-run -a node ../.claude/skills/verify/scenarios.cjs <папка отчёта>
 * Итог: <папка>/report.json (сценарии, журналы, снимки) и <папка>/NN-*.png; код выхода 0 — все PASS, 1 — есть FAIL.
 */
const { _electron: electron } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const OUT = path.resolve(process.argv[2] || 'verify-report');
const PROJECT = process.cwd(); // smart-busel
const DEV_URL = process.env.VERIFY_DEV_URL || 'http://localhost:5173';
const ELECTRON = require(path.join(PROJECT, 'node_modules/electron')); // путь к бинарнику
const WAIT = 8000; // одно действие — не дольше 8 с: зависание видно сразу, а не через 30 с
fs.mkdirSync(OUT, { recursive: true });

// Чистый «компьютер» на каждый прогон: свой HOME → своя папка данных, настоящие данные не трогаем.
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'busel-verify-'));
// Начальные данные: уровень уже показан, без звука и перерывов; две грамоты по старым правилам и одна по новым.
// Порог награды — как у родителя по умолчанию (100): окно «Ура!» — тоже часть сценария.
const SEED = {
  contentRev: 2, levelSeen: 99,
  settings: { name: 'Женя', sound: false, breakEveryMin: 0, theme: 'dark' },
  certificates: { 't:math-t01': '2026-01-01', 'k:7': '2026-01-02', 'k:30': '2026-02-01' },
};

const results = [];
let shot = 0;
const launch = () => electron.launch({
  executablePath: ELECTRON, args: [PROJECT, '--no-sandbox'],
  env: { ...process.env, HOME, VITE_DEV_SERVER_URL: DEV_URL, ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }, timeout: 60000,
});

// Сообщение об ошибке — человеческими словами
const human = (e) => {
  const m = String((e && e.message) || e).split('\n')[0];
  const t = m.match(/Timeout (\d+)ms exceeded/);
  return t ? `не дождались за ${Number(t[1]) / 1000} с` : m;
};

// «Подпись» экрана: заголовки, текущее задание и его состояние, объём и конец текста на экране
// (в «Разберём пример» «Следующий шаг» дописывает шаг ниже, заголовок не меняется). Меняется — значит, экран перешёл дальше.
const SIG = `(() => { const h = [...document.querySelectorAll('h1')].map((e) => e.textContent).join('|');
  const t = document.querySelector('[data-task]'); const m = (document.querySelector('main') || document.body).innerText;
  return h + '#' + (t ? t.textContent.slice(0, 80) + '@' + t.getAttribute('data-status') : '') + '#' + m.length + m.slice(-60); })()`;

async function main() {
  // 1-й запуск — узнать папку данных и положить туда начальные данные; 2-й — работать с ними
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
  await w.waitForSelector('nav[aria-label="Главное меню"]', { timeout: 30000 });
  w.setDefaultTimeout(WAIT);

  // ---------- журнал действий и ожидания ----------
  let trace = [];
  async function act(desc, fn) {
    trace.push(desc);
    try { return await fn(); } catch (e) { throw new Error(`на действии «${desc}»: ${human(e)}`); }
  }
  const sig = () => w.evaluate(SIG);
  const changed = (desc, before) => act(desc, () => w.waitForFunction(`${SIG} !== ${JSON.stringify(before)}`));
  const see = (desc, loc) => act(desc, () => loc.first().waitFor({ state: 'visible' }));
  const main = () => w.locator('main');
  const heading = async () => (await w.locator('h1').allTextContents()).join(' | ');
  const data = () => w.evaluate(async () => window.busel.load());

  async function nav(re) {
    await act(`меню: «${re.source}»`, async () => {
      await w.locator('nav[aria-label="Главное меню"]').getByRole('button', { name: re }).first().click();
      await w.waitForFunction((src) => [...document.querySelectorAll('nav[aria-label="Главное меню"] button[aria-current="page"]')]
        .some((b) => new RegExp(src).test(b.getAttribute('aria-label') || b.textContent)), re.source);
    });
  }
  async function openMath() {
    await nav(/Предметы/);
    await act('открыть «Математика»', () => w.getByRole('button', { name: /Математика/ }).first().click());
    await see('список тем математики', w.getByRole('button', { name: /Признаки делимости/ }));
  }

  // Всплывающие окна закрываем, как ребёнок: сначала окна поверх экрана (награда «Ура!», новый уровень), потом слово Бусела «Хорошо».
  async function dismiss() {
    for (let i = 0; i < 6; i++) {
      const dlg = w.locator('[role=dialog][aria-modal=true]').filter({ has: w.locator('button') });
      const btn = dlg.locator('button').filter({ hasText: /^\s*(Ура!?|Хорошо|Отлично|Понятно|Продолжить)\s*$/ });
      if (await btn.count()) {
        const label = (await btn.last().innerText()).trim();
        await act(`закрыть окно «${label}»`, async () => { await btn.last().click(); await dlg.last().waitFor({ state: 'detached' }); });
        continue;
      }
      const word = w.getByRole('button', { name: /^Хорошо$/ });
      if (await word.count()) {
        await act('закрыть слово Бусела «Хорошо»', async () => { await word.first().click(); await word.first().waitFor({ state: 'detached' }); });
        continue;
      }
      return;
    }
  }

  async function step(name, fn) {
    const t0 = Date.now(); const before = errors.length; trace = [];
    process.stdout.write(`…  ${name}\n`);
    let ok = true, note = '';
    try {
      await dismiss();
      note = (await fn()) || '';
      const errs = errors.slice(before);
      if (errs.length) throw new Error('ошибки на странице: ' + errs.join(' ; '));
    } catch (e) { ok = false; note = String(e.message || e).split('\n')[0]; }
    const file = `${String(++shot).padStart(2, '0')}-${name.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40)}.png`;
    await w.screenshot({ path: path.join(OUT, file) }).catch(() => {});
    results.push({ name, ok, note, ms: Date.now() - t0, screenshot: file, trace: [...trace] });
    // вернуться на главную, чтобы следующий сценарий начинался с одного места
    await dismiss().catch(() => {});
    if (await w.locator('iframe').count()) await w.getByRole('button', { name: /Закрыть/ }).first().click().catch(() => {});
    await nav(/Главная/).catch(() => {});
  }

  // Ответ на задание: правильный — из data-answer (есть только в dev-режиме), неправильный — любой другой.
  async function answer(right) {
    const task = w.locator('[data-task]').first();
    const [ans, type, status] = await Promise.all(['data-answer', 'data-task', 'data-status'].map((a) => task.getAttribute(a)));
    let given = ans;
    if (!right) given = type === 'truefalse' ? String(ans !== 'true') : type === 'input' ? '999999' : null;
    if (given === null) given = (await w.locator('[data-task] [data-option]').evaluateAll((els) => els.map((e) => e.getAttribute('data-option')))).find((o) => o !== ans);
    const input = w.locator('[data-task] input[aria-label=Ответ]');
    await act(`${right ? 'верный' : 'неверный'} ответ «${given}» (${type})`, async () => {
      if (await input.count()) { await input.fill(given); await input.press('Enter'); }
      else await w.locator(`[data-task] [data-option="${given}"]:not([disabled])`).first().click(); // варианты включаются после паузы «дочитай»
      await w.waitForFunction((s) => { const t = document.querySelector('[data-task]'); return !t || t.getAttribute('data-status') !== s; }, status);
    });
    return task.getAttribute('data-status');
  }
  const NEXT = /^(Дальше|Понятно|Следующий шаг|Проверь себя|К заданиям|Начать)/;
  async function next() {
    await dismiss();
    const before = await sig();
    await act('нажать «Дальше»', () => w.getByRole('button', { name: NEXT }).last().click());
    await changed('следующий экран урока', before);
  }

  // ---------- сценарии ----------
  await step('Запуск и главная', async () => {
    if (!(await w.evaluate(() => !!window.busel))) throw new Error('нет моста Electron (window.busel)');
    await see('приветствие с именем', main().getByText(/Привет, Женя/));
    return await heading();
  });

  let mistake = '';
  await step('Урок: карточки → задания → итог (с ошибкой и второй попыткой)', async () => {
    await openMath();
    await act('открыть тему «Признаки делимости»', () => w.getByRole('button', { name: /Признаки делимости/ }).first().click());
    let retried = false, answered = 0;
    for (let k = 0; k < 120; k++) {
      await dismiss();
      const h = await heading();
      if (/Итог/.test(h)) break;
      const skip = w.getByRole('button', { name: /^Пропустить/ });
      if (await skip.count() && /бонус|посложнее/i.test(await main().innerText())) {
        const before = await sig(); await act('пропустить бонус', () => skip.last().click()); await changed('после «Пропустить»', before); continue;
      }
      const task = w.locator('[data-task]').first();
      if (!(await task.count())) { await next(); continue; }
      const status = await task.getAttribute('data-status');
      if (status === 'right' || status === 'wrong') { answered++; await next(); continue; }
      const type = await task.getAttribute('data-task');
      if (!mistake && status === 'idle' && /Практика/.test(h) && ['single', 'input'].includes(type)) {
        mistake = (await task.innerText()).split('\n')[0];
        if ((await answer(false)) === 'retry') retried = true; // дальше цикл сам ответит верно со второй попытки
      } else await answer(true);
    }
    if (!/Итог/.test(await heading())) throw new Error(`не дошли до «Итога» (ответов: ${answered}); последние действия: ${trace.slice(-3).join(' → ')}`);
    if (!mistake) throw new Error('не нашлось задания, чтобы проверить ошибку');
    await see('итог урока: «тема пройдена»', main().getByText(/тема пройдена/i));
    return `заданий ${answered}; ошибка «${mistake}», вторая попытка: ${retried ? 'была' : 'нет (тип без неё)'}`;
  });

  await step('Баллы сохранились после перезапуска', async () => {
    const pts = (await data()).points;
    if (!(pts > 0)) throw new Error('в data.json нет баллов после урока: ' + pts);
    await act('перезагрузить окно', async () => { await w.reload(); await w.waitForSelector('nav[aria-label="Главное меню"]'); });
    await see(`на главной ${pts} баллов`, main().getByText(new RegExp(`${pts} балл`)));
    return `баллов: ${pts} (в data.json и на экране)`;
  });

  await step('Работа над ошибками: ошибка урока ждёт разбора', async () => {
    if (!mistake) throw new Error('в уроке не было ошибки — проверять нечего');
    await nav(/Работа над ошибками/);
    // задание «по образцу» в разборе даётся новым вариантом — сверяем число ошибок и тему, а не текст
    await see('заголовок «Работа над ошибками · 1/1»', w.locator('h1').filter({ hasText: /Работа над ошибками · 1\/1/ }));
    const q = (await w.locator('[data-task]').first().innerText()).split('\n')[0];
    await answer(true);
    return `ошибка «${mistake}» → разбор «${q}»`;
  });

  await step('Мой план: добавить тему', async () => {
    await openMath();
    await act('нажать «В план» у первой темы', () => w.getByRole('button', { name: 'Добавить в план на сегодня' }).first().click());
    await see('кнопка сменилась на «В плане»', w.getByRole('button', { name: 'В плане на сегодня' }));
    const planned = (await data()).plan.topics;
    if (planned.length !== 1) throw new Error('в data.json в плане тем: ' + planned.length);
    await nav(/Главная/);
    await see('план виден на главной', main().getByText(/план/i));
    return 'в плане: ' + planned[0];
  });

  await step('Мультурок: открывается и играет', async () => {
    await openMath();
    await act('нажать ▶ «Мультурок»', () => w.getByRole('button', { name: /^Мультурок/ }).first().click());
    const frame = w.frameLocator('iframe').first();
    await see('заставка ролика с кнопкой «Смотреть»', frame.getByRole('button', { name: /Смотреть/ }));
    const chapter = await w.locator('iframe').first().evaluate((f) => f.contentWindow.eval("typeof CHAPTER === 'undefined' ? '' : CHAPTER.title"));
    await act('нажать «Смотреть»', () => frame.getByRole('button', { name: /Смотреть/ }).click());
    await act('ролик идёт (прошло больше 1 с)', () => w.waitForFunction(() => {
      try { return document.querySelector('iframe').contentWindow.eval('P.t') > 1; } catch { return false; }
    }));
    await act('нажать «Закрыть»', async () => { await w.getByRole('button', { name: /Закрыть/ }).click(); await w.locator('iframe').waitFor({ state: 'detached' }); });
    return chapter;
  });

  await step('Грамоты: только по новым правилам, лист для печати', async () => {
    await nav(/Коллекция/);
    await act('открыть «Мои грамоты»', () => w.getByRole('button', { name: /Мои грамоты/ }).click());
    await see('грамота «30 дней занятий подряд»', w.getByRole('button', { name: /30 дней занятий подряд/ }));
    const text = await main().innerText();
    if (/Отличное знание темы|7 дней занятий/.test(text)) throw new Error('на экране грамота по старым правилам');
    const saved = Object.keys((await data()).certificates).sort().join(',');
    if (saved !== 'k:30') throw new Error('в data.json остались старые грамоты: ' + saved);
    await act('открыть лист грамоты', () => w.getByRole('button', { name: /30 дней занятий подряд/ }).first().click());
    await see('кнопка «Распечатать»', w.getByRole('button', { name: /Распечатать/ }));
    return 'в data.json: ' + saved;
  });

  async function parentLogin(pin) {
    await nav(/Родителям/);
    await act(`ввести PIN ${pin}`, async () => { const f = w.locator('input[aria-label=PIN]'); await f.fill(pin); await f.press('Enter'); });
  }

  await step('Родителям: PIN 0000 и отчёт за неделю', async () => {
    await parentLogin('0000');
    await see('родительский режим открыт', w.getByRole('button', { name: /^Отчёт за неделю/ }));
    await act('открыть «Отчёт за неделю»', () => w.getByRole('button', { name: /^Отчёт за неделю/ }).first().click());
    await see('урок из сценария есть в отчёте', main().getByText(/Признаки делимости/));
    return 'тема «Признаки делимости» в отчёте';
  });

  await step('Неверный PIN не пускает', async () => {
    await act('перезагрузить окно (выйти из родительского режима)', async () => { await w.reload(); await w.waitForSelector('nav[aria-label="Главное меню"]'); });
    await parentLogin('1234');
    await see('сообщение «PIN не подошёл»', main().getByText('PIN не подошёл'));
  });

  await step('Светлая тема из настроек родителя', async () => {
    await parentLogin('0000');
    await act('открыть «Настройки»', () => w.getByRole('button', { name: /^Настройки/ }).first().click());
    const select = w.locator('label', { hasText: 'Тема' }).locator('select');
    await act('выбрать тему «Светлая»', async () => { await select.selectOption('light'); await w.waitForFunction(() => document.documentElement.dataset.theme === 'light'); });
    const bg = await w.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await act('вернуть «Тёмная»', async () => { await select.selectOption('dark'); await w.waitForFunction(() => document.documentElement.dataset.theme === 'dark'); });
    if (!/rgb\((2\d\d), (2\d\d)/.test(bg)) throw new Error('в светлой теме фон не светлый: ' + bg);
    return bg;
  });

  await step('Узкое окно (как телефон): нет прокрутки вбок', async () => {
    await act('сузить окно до 390 px', async () => {
      await app.evaluate(({ BrowserWindow }) => { const b = BrowserWindow.getAllWindows()[0]; b.setMinimumSize(300, 400); b.setSize(390, 844); });
      await w.waitForFunction(() => innerWidth <= 400);
    });
    const over = await w.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await w.screenshot({ path: path.join(OUT, 'phone-width.png') }); // вид в узком окне — для глаз
    await act('вернуть ширину 1280 px', async () => {
      await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1280, 820));
      await w.waitForFunction(() => innerWidth > 1000);
    });
    if (over > 1) throw new Error(`страница шире окна на ${over} px`);
    return 'снимок: phone-width.png';
  });

  await app.close();
}

main()
  .catch((e) => results.push({ name: 'Запуск приложения', ok: false, note: human(e), trace: [] }))
  .finally(() => {
    fs.rmSync(HOME, { recursive: true, force: true });
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 1));
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.note ? ' — ' + r.note : ''}`);
      if (!r.ok) console.log(`      журнал: ${r.trace.slice(-4).join(' → ') || '—'}; снимок: ${r.screenshot || '—'}`);
    }
    process.exit(results.length && results.every((r) => r.ok) ? 0 : 1);
  });
