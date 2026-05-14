/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          bg:           '#0F0F0F',
          surface:      '#1A1A1A',
          elevated:     '#262626',
          border:       '#2D2D2D',
          muted:        '#6B6B6B',
          text:         '#E8E8E8',
          accent:       '#F59E0B',
          'accent-dim': '#D97706',
          success:      '#10B981',
          danger:       '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '999px',
      },
      boxShadow: {
        card:        '0 2px 8px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 24px rgba(0,0,0,0.6)',
        poster:      '0 4px 20px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
}
