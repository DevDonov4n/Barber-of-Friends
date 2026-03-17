/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        urban: {
          red: '#E63946',
          blue: '#76C7FF',
          black: '#111111',
          white: '#F5F5F5'
        }
      },
      fontFamily: {
        mural: ['"Permanent Marker"', 'cursive'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 0 2px rgba(118, 199, 255, 0.35), 0 10px 30px rgba(0, 0, 0, 0.4)'
      }
    }
  },
  plugins: []
};
