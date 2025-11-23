/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'board-light': '#f0d9b5',
        'board-dark': '#b58863',
        'piece-light': '#ffffff',
        'piece-dark': '#000000',
      },
      boxShadow: {
        'piece-3d': '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'board-tile': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'move-confirm': 'moveConfirm 0.2s ease-out',
        'puzzle-success': 'puzzleSuccess 0.5s ease-out',
      },
      keyframes: {
        moveConfirm: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        puzzleSuccess: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

