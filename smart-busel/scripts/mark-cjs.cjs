// dist-electron компилируется в CommonJS, а проект — ESM: помечаем папку явно.
const fs = require('node:fs');
fs.mkdirSync('dist-electron', { recursive: true });
fs.writeFileSync('dist-electron/package.json', '{"type":"commonjs"}\n');
