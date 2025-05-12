// frontend/tailwind.config.js
import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px', // Add extra small breakpoint
      },
      colors: {
        // Custom gym-themed colors
        'energy': {
          '50': '#fff7ed',
          '100': '#ffedd5',
          '200': '#fed7aa',
          '300': '#fdba74',
          '400': '#fb923c',
          '500': '#f97316',
          '600': '#ea580c',
          '700': '#c2410c',
          '800': '#9a3412',
          '900': '#7c2d12',
        },
        'strength': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
        },
        'vitality': {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#14532d',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      boxShadow: {
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        gymlight: {
          "primary": "#0ea5e9",
          "secondary": "#f97316",
          "accent": "#22c55e",
          "neutral": "#191D24",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#f1f5f9",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        gymdark: {
          "primary": "#0ea5e9",
          "secondary": "#f97316",
          "accent": "#22c55e",
          "neutral": "#191D24",
          "base-100": "#1e293b",
          "base-200": "#0f172a",
          "base-300": "#020617",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "light",
      "dark",
    ],
  },
}