/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        "xs": "375px",
        "max-xs": {"max": "374px"},
        "max-sm": {"max": "639px"}
      },
      height: {
        'dvh': '100dvh', // Dynamic viewport height for mobile
        'safe': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top, 1rem)',
        'safe-bottom': 'env(safe-area-inset-bottom, 1rem)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)'
      }
    }
  },
  plugins: [
    // Add scrollbar hide utility
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
            width: '0px',
            background: 'transparent'
          }
        }
      })
    }
  ]
}
