/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-soft': '#EFF6FF',
          'blue-border': '#BFDBFE',
          red: '#E11D48',
          'red-hover': '#BE123C',
          'red-soft': '#FFE4E6',
          text: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
          code: '#F1F5F9',
          success: '#16A34A',
          warning: '#D97706',
          critical: '#DC2626'
        },
        directus: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          purple: '#6644ff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(37, 99, 235, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
