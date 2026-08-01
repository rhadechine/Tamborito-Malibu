/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: ['hidden', 'flex', 'grid'],
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      colors: {
        bg: '#f6f1e8',
        bgSoft: '#fbf8f2',
        textBase: '#1e1f1d',
        muted: '#5d625e',
        dark: '#0d3b36',
        dark2: '#0a2b28',
        accent: '#d57a52',
        accent2: '#cfa969',
        line: '#ded7cb',
        museoDark: '#2f241d',
        museoClay: '#9b5f3d',
        museoSand: '#d8b982',
        museoStone: '#eee3d2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 16px 40px rgba(10, 27, 24, 0.10)',
      },
      borderRadius: {
        card: '22px',
      },
      maxWidth: {
        site: '1180px',
      },
    },
  },
  plugins: [],
};
