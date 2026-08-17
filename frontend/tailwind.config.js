const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
      },
      colors: {
        // Walnut — wood, leather, warmth. The brand colour.
        primary: {
          50: '#FAF6F2',
          100: '#F3EAE1',
          200: '#E5D3C2',
          300: '#D3B69C',
          400: '#BC9070',
          500: '#A5734F',
          600: '#8A5A3B',
          700: '#6F4830',
          800: '#5A3B29',
          900: '#4A3224',
          950: '#2A1B13',
        },
        // Sage — muted and unsaturated, so it reads as expensive beside walnut.
        secondary: {
          50: '#F4F7F4',
          100: '#E5EBE4',
          200: '#CAD8C8',
          300: '#A6BCA4',
          400: '#7C9A7A',
          500: '#5C7C5A',
          600: '#476347',
          700: '#3A4F3A',
          800: '#313F31',
          900: '#2A352A',
          950: '#151C15',
        },
        // Warm neutral: a cool grey would fight the wood tones.
        dark: colors.stone,
        success: colors.emerald,
        warning: colors.amber,
        danger: colors.rose,
        // Never pure white — the single biggest lever on looking premium.
        cream: '#FAF7F2',
      },
      aspectRatio: {
        product: '4 / 5',
      },
      // Tailwind's default scale jumps 12 → 14, but the button sizes step
      // 36/44/52px, so the large size needs this rung to exist.
      spacing: {
        13: '3.25rem',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        lift: '0 18px 40px -24px rgba(42, 27, 19, 0.35)',
      },
      fontSize: {
        'display-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-lg': ['4rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-xl': ['5.25rem', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        drawerIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        sheetIn: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'drawer-in': 'drawerIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'sheet-in': 'sheetIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
