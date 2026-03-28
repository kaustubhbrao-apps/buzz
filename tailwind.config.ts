import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        buzz: {
          yellow: '#FFD60A',
          dark: '#0F0F0F',
          bg: '#FAFAF8',
          text: '#0F0F0F',
          muted: '#777777',
          border: '#EAEAE8',
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          seedling: '#9CA3AF',
          charged: '#3B82F6',
          buzzing: '#F97316',
          elite: '#8B5CF6',
          legend: '#FFD60A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'yellow': '0 2px 12px rgba(255,214,10,0.25)',
        'yellow-lg': '0 4px 24px rgba(255,214,10,0.35)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-up': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'scale-up': 'scale-up 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
