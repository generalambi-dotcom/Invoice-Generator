/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-dark': 'var(--theme-primary-dark)',
        'theme-primary-light': 'var(--theme-primary-light)',
      },
    },
  },
  plugins: [],
}

