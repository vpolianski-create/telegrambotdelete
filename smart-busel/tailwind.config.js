/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
      colors: {
        bg: 'var(--bg)', card: 'var(--card)', ink: 'var(--ink)', mute: 'var(--mute)',
        brand: 'var(--brand)', accent: 'var(--accent)', ok: 'var(--ok)',
      },
      borderRadius: { xl2: '1.25rem', xl3: '1.75rem' },
      spacing: { touch: '48px' },
    },
  },
  plugins: [],
};
