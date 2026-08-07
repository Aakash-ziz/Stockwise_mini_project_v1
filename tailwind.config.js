/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#111111',
          secondary: '#666666',
          tertiary: '#999999',
          border: '#e5e5e5',
          bg: '#ffffff',
          'page-bg': '#f9f9f9',
          'header-bg': '#f5f5f5',
          'surface-dim': '#dadada',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f3f3f3',
          'surface-container': '#eeeeee',
          'surface-container-high': '#e8e8e8',
          'surface-container-highest': '#e2e2e2',
        },
        status: {
          'stock-bg': '#e8f5e9',
          'stock-text': '#2e7d32',
          'low-bg': '#fff8e1',
          'low-text': '#f57f17',
          'out-bg': '#ffebee',
          'out-text': '#c62828',
          'delivered-bg': '#e8f5e9',
          'delivered-text': '#2e7d32',
          'processing-bg': '#e3f2fd',
          'processing-text': '#1565c0',
          'hold-bg': '#fff3e0',
          'hold-text': '#e65100',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',      // 4px
        'DEFAULT': '0.5rem',  // 8px
        'md': '0.75rem',       // 12px
        'lg': '1rem',         // 16px
        'xl': '1.5rem',        // 24px
      },
      boxShadow: {
        'subtle-precision': '0 4px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
      }
    },
  },
  plugins: [],
}
