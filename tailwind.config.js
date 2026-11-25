/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBF4EC',
          100: '#F7ECDE',
          200: '#F1E0CE',
          300: '#D2BDA7',
        },
        blush: {
          50: '#FFE9F0',
          100: '#FFD2E0',
          200: '#FFB3CD',
          300: '#FF90B4',
          400: '#F8729F',
          500: '#E85A88',
          600: '#C74770',
        },
        sage: {
          50: '#E8F3E3',
          100: '#D4E8CC',
          200: '#B5D6A9',
          300: '#94C084',
          400: '#74A565',
          500: '#5A8A4E',
          600: '#47703D',
        },
        lavender: {
          50: '#F6F4FB',
          100: '#E9E4F5',
          200: '#D5CCEC',
          300: '#BBAAE0',
          400: '#9D86D0',
          500: '#8267BF',
        },
        gold: {
          100: '#F7EAC8',
          200: '#EFD89E',
          300: '#E2C06A',
          400: '#CDA748',
          500: '#B08C32',
        },
        rose: {
          100: '#FFD4D4',
          200: '#FFB0B0',
          300: '#F09090',
          400: '#DD6E6E',
        },
        ink: {
          700: '#3E362F',
          800: '#2A241F',
          900: '#1C1713',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(154, 120, 90, 0.18)',
        petal: '0 10px 30px -10px rgba(245, 107, 150, 0.25)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        bloom: {
          '0%': { transform: 'scale(0.7)', opacity: '0.4' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        bloom: 'bloom 320ms ease-out',
        fadeIn: 'fadeIn 400ms ease-out both',
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
