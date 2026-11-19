export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        paper: '#F5F5F5',
        amber: {
          DEFAULT: '#f2a93b',
          hover: '#d9922b'
        },
        surface: '#0A0A0A',
        elevated: '#0D0D0D',
        border: '#1F1F1F',
        muted: '#A1A1AA',
        accent: {
          DEFAULT: '#f2a93b',
          hover: '#d9922b'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Roboto', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
        serif: ['"Roboto Serif"', 'serif']
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 500,
        bold: 700
      }
    }
  },
  plugins: []
};
