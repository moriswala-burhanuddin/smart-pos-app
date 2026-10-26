/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#F2F2F7',
          card: '#FFFFFF',
          red: '#DC2626',
          redHover: '#B91C1C',
          redLight: '#FEE2E2',
          redMuted: '#FEF2F2',
          dark: '#1C1C1E',
          gray: '#8E8E93',
          grayLight: '#E5E5EA',
          grayBorder: '#E5E7EB',
          separator: '#D1D1D6',
          green: '#34C759',
          greenLight: '#DCFCE7',
          blue: '#007AFF',
          orange: '#FF9500',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'ios-lg': '0 10px 30px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'ios-sheet': '0 -8px 28px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
