/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#05070E',
          800: '#080B14',
          700: '#0C1020',
          600: '#111731',
        },
        glass: {
          line: 'rgba(255,255,255,0.12)',
          fill: 'rgba(255,255,255,0.06)',
        },
        accent: {
          blue: '#3B82F6',
          cyan: '#22D3EE',
          violet: '#8B5CF6',
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        glass: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(255,255,255,0.03)',
        'glass-sm': '0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
        glow: '0 0 40px rgba(59,130,246,0.35)',
      },
      keyframes: {
        'aurora': {
          '0%,100%': { transform: 'translate3d(-6%, -4%, 0) scale(1.1)' },
          '50%': { transform: 'translate3d(6%, 5%, 0) scale(1.25)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        aurora: 'aurora 22s ease-in-out infinite',
        'aurora-slow': 'aurora 34s ease-in-out infinite reverse',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
