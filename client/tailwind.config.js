/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        "xs": "375px",
        "max-xs": {"max": "374px"},
        "max-sm": {"max": "639px"}
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
