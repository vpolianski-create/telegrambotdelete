import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
/** Связь наружу — только Google Firebase (синхронизация; данные зашифрованы на устройстве) и GitHub (есть ли новая версия). */
const CONNECT = ['https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://firestore.googleapis.com', 'https://api.github.com'];

// В собранном приложении разрешаем загрузку только своих файлов и связь только с Firebase (в режиме разработки политика не нужна).
const csp = {
  name: 'csp',
  transformIndexHtml(html: string, ctx: { server?: unknown }) {
    if (ctx.server) return html;
    const policy = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; media-src 'self' data:; connect-src 'self' ${CONNECT.join(' ')}; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'`;
    return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`);
  },
};

export default defineConfig({
  plugins: [react(), csp],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
  server: { port: 5173, strictPort: true },
  test: { include: ['tests/**/*.test.ts'] },
});
