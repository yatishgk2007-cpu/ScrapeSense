/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Dark-first premium palette
        background: '#09090b',
        surface: '#121214',
        'surface-hover': '#1c1c20',
        'surface-border': '#27272a',
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
          glow: 'rgba(99, 102, 241, 0.15)'
        },
        success: {
          400: '#34d399',
          500: '#10b981',
          glow: 'rgba(16, 185, 129, 0.15)'
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.15)'
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.15)'
        },
        muted: '#a1a1aa'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-border': 'pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' },
          '50%': { opacity: '.7', boxShadow: '0 0 5px rgba(99, 102, 241, 0.1)' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(99, 102, 241, 0.5)' },
          '50%': { borderColor: 'rgba(99, 102, 241, 0.1)' },
        }
      }
    },
  },
  plugins: [],
}
