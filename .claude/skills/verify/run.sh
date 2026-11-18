#!/usr/bin/env bash
# /verify — все автоматические проверки «Умного Бусела» подряд, по порядку из SKILL.md.
# Запуск из корня репозитория:  bash .claude/skills/verify/run.sh [папка-отчёта]
# Каждый шаг пишет свой журнал в папку отчёта; в конце — таблица ШАГ / ИТОГ / ВРЕМЯ.
# Код выхода: 0 — все шаги прошли, 1 — хотя бы один упал (что делать дальше — решает агент по SKILL.md).
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
APP="$ROOT/smart-busel"
SKILL="$ROOT/.claude/skills/verify"
OUT="${1:-$(mktemp -d -t busel-verify-XXXX)}"
mkdir -p "$OUT"
cd "$APP" || exit 1
SUMMARY=()
FAILED=0

run() { # run <номер> <название> <команда…>
  local id="$1" name="$2"; shift 2
  local log="$OUT/$id.log" t0=$SECONDS
  echo "▶ $id $name"
  if "$@" >"$log" 2>&1; then st=OK; else st=FAIL; FAILED=1; fi
  SUMMARY+=("$id | $name | $st | $((SECONDS - t0)) с | $log")
  [ "$st" = OK ] || tail -n 25 "$log" | sed 's/^/    │ /'
}

# 0. Окружение: зависимости и бинарник Electron (ставятся из package-lock, новых библиотек нет)
[ -d node_modules ] || run 0a "npm ci (зависимости из package-lock)" npm ci
[ -x node_modules/electron/dist/electron ] || run 0b "бинарник Electron" node node_modules/electron/install.js

# 1. «Линтер»: в проекте нет ESLint — роль линтера играют строгий TypeScript и проверка учебного контента
run 1a "TypeScript: интерфейс (tsc --noEmit)" npx tsc --noEmit
run 1b "TypeScript: Electron (tsc -p electron --noEmit)" npx tsc -p electron --noEmit
run 1c "Контент (npm run validate-content)" npm run validate-content
# 2. Тесты
run 2 "Тесты (npm test)" npm test
# 3. Сборка
run 3 "Сборка (npm run build)" npm run build
# 4. Запуск собранного приложения в настоящем Electron
run 4 "Запуск собранной версии (Electron)" xvfb-run -a node "$SKILL/launch-check.cjs"
# 5. Сценарии глазами пользователя (feature-map.md): Electron + интерфейс из dev-сервера Vite
PORT=5173
if (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; then
  echo "    порт $PORT занят: сценарии пойдут на уже запущенный сервер"; VITE_PID=""
else
  npx vite --port $PORT --strictPort >"$OUT/vite.log" 2>&1 & VITE_PID=$!
  npx wait-on -t 60000 tcp:$PORT >/dev/null 2>&1 || echo "    dev-сервер не поднялся за 60 с, см. $OUT/vite.log"
fi
run 5 "Сценарии пользователя (feature-map.md)" xvfb-run -a node "$SKILL/scenarios.cjs" "$OUT/scenarios"
[ -n "$VITE_PID" ] && kill "$VITE_PID" 2>/dev/null; wait 2>/dev/null

echo
echo "ШАГ | ПРОВЕРКА | ИТОГ | ВРЕМЯ | ЖУРНАЛ"
printf '%s\n' "${SUMMARY[@]}"
[ -f "$OUT/scenarios/report.json" ] && { echo; echo "Сценарии:"; grep -h -E '^(PASS|FAIL)' "$OUT/5.log"; }
echo; echo "Отчёт и снимки экрана: $OUT"
exit $FAILED
