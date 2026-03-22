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
          yellow: '#F5C518',
          dark: '#1A1A2E',
          bg: '#F9F9FB',
          text: '#2C2C2C',
          muted: '#777777',
          border: '#E0E0E0',
          success: '#27AE60',
          error: '#E74C3C',
          warning: '#E67E22',
          seedling: '#9E9E9E',
          charged: '#2471A3',
          buzzing: '#E67E22',
          elite: '#7D3C98',
          legend: '#F5C518',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
