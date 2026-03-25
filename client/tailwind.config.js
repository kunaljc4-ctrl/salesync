/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        slate: {
          dark: '#1e293b',
          gray: '#64748b',
          light: '#f8fafc',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(0, 0, 0, 0.05)',
        }
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'premium': '12px',
      }
    },
  },
  plugins: [],
}
