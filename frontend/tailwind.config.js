/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',
        'background': 'var(--color-background)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'border-color': 'var(--color-border)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'unia-purple': '#a855f7',
        'unia-purple-light': '#f3e8ff',
        'unia-pink': '#ec4899',
        'unia-teal': '#2dd4bf',
        'unia-orange': '#f97316',
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'unia-gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'unia-gradient-teal': 'linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%)',
        'unia-gradient-bg': 'linear-gradient(to right, #e0f2fe, #fce7f3)',
      },
      boxShadow: {
        'unia-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.02)',
        'unia-card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0,0,0,0.03)',
      },
      borderRadius: {
        'unia': '1.25rem',
        'unia-lg': '1.5rem',
        'unia-pill': '9999px',
      }
    },
  },
  plugins: [],
}