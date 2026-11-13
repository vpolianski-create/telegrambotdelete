/** @type {import('tailwindcss').Config} */
const SEGOE = ['"Segoe UI Variable Text"', '"Segoe UI Variable"', '"Segoe UI"', 'system-ui', 'sans-serif'];
const rgb = (name) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: SEGOE, display: ['"Segoe UI Variable Display"', ...SEGOE] },
      // вес 600 вместо жирного 800
      fontWeight: { bold: '600', extrabold: '600' },
      colors: {
        bg: 'var(--bg)', side: 'var(--side)', surface: 'var(--surface)', card: 'var(--card)', hover: 'var(--hover)', line: 'var(--line)',
        ink: 'var(--ink)', mute: 'var(--mute)', soft: 'var(--soft)',
        brand: rgb('brand'), ok: rgb('ok'), warn: rgb('warn'), accent: rgb('accent'), sun: rgb('sun'),
        brandink: 'var(--brand-ink)', accentink: 'var(--accent-ink)', okink: 'var(--ok-ink)',
        onbrand: 'var(--on-brand)', onok: 'var(--on-ok)', onaccent: 'var(--on-accent)',
        navy: 'var(--navy)',
      },
      // кнопки и поля 8 px, карточки 12 px, крупные панели 16 px, блок «Продолжить» 20 px
      borderRadius: { xl2: '0.5rem', xl3: '0.75rem', panel: '1rem', hero: '1.25rem' },
      boxShadow: { DEFAULT: 'var(--shadow)', xl: 'var(--shadow-pop)' },
      spacing: { touch: '48px' },
    },
  },
  plugins: [],
};
