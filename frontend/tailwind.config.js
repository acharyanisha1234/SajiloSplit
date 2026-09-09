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
          50: '#E6F7F7',
          100: '#CCEEEE',
          200: '#99DDDD',
          300: '#66CCCC',
          400: '#33BBBB',
          500: '#0EA5A5',    // Main Teal
          600: '#0B8A8A',
          700: '#087070',
          800: '#055555',
          900: '#033A3A',
        },
        gold: {
          50: '#FDF6ED',
          100: '#FBEDDB',
          200: '#F7DBB7',
          300: '#F3C993',
          400: '#EFB76F',
          500: '#D4A373',    // Gold
          600: '#C49263',
          700: '#B48253',
          800: '#A47243',
          900: '#946233',
        },
        navy: {
          500: '#1A2E4A',
          600: '#15253B',
          700: '#101C2C',
        },
        cream: {
          50: '#FDF6F0',
          100: '#F8EFE8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(135deg, #0EA5A5 0%, #0B8A8A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A373 0%, #C49263 100%)',
        'gradient-teal-gold': 'linear-gradient(135deg, #0EA5A5 0%, #D4A373 100%)',
      },
      boxShadow: {
        'teal': '0 20px 60px -15px rgba(14, 165, 165, 0.3)',
        'gold': '0 20px 60px -15px rgba(212, 163, 115, 0.3)',
        'navy': '0 20px 60px -15px rgba(26, 46, 74, 0.3)',
      }
    },
  },
  plugins: [],
} 