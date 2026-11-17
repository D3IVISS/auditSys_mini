/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#09090B',
        panel: '#111114',
        raised: '#17171B',
        accent: {
          DEFAULT: '#10B981',
          hover: '#34D399',
          muted: 'rgba(16,185,129,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        sheet: '0 1px 0 rgba(255,255,255,0.04), 0 24px 48px -24px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
