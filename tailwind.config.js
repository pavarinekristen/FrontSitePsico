/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['ZT Nature', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#12203F',
        brand: {
          bg: '#EDF2FB',
          soft: '#F7FAFF',
          blue: '#1A3E8B',
          navy: '#0F2657',
          yellow: '#FFC20E',
        },
      },
      backgroundImage: {
        hero: 'radial-gradient(120% 130% at 88% 8%, #FFF0C4 0%, #EDF2FB 52%, #DCE8FF 120%)',
        'title-mark': 'linear-gradient(180deg, transparent 56%, #FFC20E 56%)',
        'room-card': 'linear-gradient(180deg, rgba(18,32,63,.3) 0%, rgba(18,32,63,0) 28%, rgba(18,32,63,.92) 100%)',
        contact: 'linear-gradient(140deg, #1A3E8B 0%, #2456C7 55%, #4E86E8 100%)',
        'map-grid': 'linear-gradient(#dfe4ea 1px, transparent 1px), linear-gradient(90deg, #dfe4ea 1px, transparent 1px), linear-gradient(#e7ebf0 1px, transparent 1px), linear-gradient(90deg, #e7ebf0 1px, transparent 1px)',
      },
      backgroundSize: {
        'map-grid': '64px 64px, 64px 64px, 16px 16px, 16px 16px',
      },
      boxShadow: {
        brand: '0 18px 36px -14px rgba(15, 38, 87, .75)',
        yellow: '0 10px 22px -10px rgba(237, 162, 0, .7)',
        whatsapp: '0 18px 36px -14px rgba(18, 140, 126, .6)',
        hero: '0 44px 84px -42px rgba(15, 38, 87, .55)',
        card: '0 20px 44px -28px rgba(15, 38, 87, .4)',
        nav: '0 12px 30px -20px rgba(15, 38, 87, .5)',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 3.4s ease-in-out infinite',
        'spin-slow': 'spinSlow 28s linear infinite',
      },
    },
  },
  plugins: [],
};
