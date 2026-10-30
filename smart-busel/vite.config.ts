import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В собранном приложении разрешаем загрузку только своих файлов (в режиме разработки политика не нужна).
const csp = {
  name: 'csp',
  transformIndexHtml(html: string, ctx: { server?: unknown }) {
    if (ctx.server) return html;
    const policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; media-src 'self' data:";
    return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`);
  },
};

export default defineConfig({
  plugins: [react(), csp],
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
  server: { port: 5173, strictPort: true },
  test: { include: ['tests/**/*.test.ts'] },
});
