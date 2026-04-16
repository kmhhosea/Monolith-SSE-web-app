import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f8fafc',
        campus: '#0b4f6c',
        sunrise: '#f59e0b',
        sage: '#0f766e',
        clay: '#9a3412'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at top left, rgba(245,158,11,0.18), transparent 28%), radial-gradient(circle at top right, rgba(15,118,110,0.14), transparent 32%), linear-gradient(135deg, rgba(11,79,108,0.08), rgba(255,255,255,0))'
      }
    }
  },
  plugins: []
};

export default config;
