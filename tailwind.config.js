/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // These map to CSS variables — auto-switch between light and dark
        dark: {
          900: 'var(--surface-base)',
          800: 'var(--surface-card)',
          700: 'var(--surface-input)',
          600: 'var(--surface-hover)',
          500: 'var(--border-color)',
          400: 'var(--text-subtle)',
          primary: 'var(--text-primary)',
          heading: 'var(--text-heading)',
        },
        brand: {
          green: '#00d084',
          teal: '#00b4d8',
          purple: '#7c3aed',
          red: '#ef4444',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
