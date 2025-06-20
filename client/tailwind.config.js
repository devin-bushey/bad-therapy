/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm Neutrals (Background & Structure)
        warm: {
          50: '#FBF9F7',   // lightest warm white
          100: '#F4F1ED',  // card backgrounds
          200: '#E8E0D6',  // borders, dividers
          300: '#D4C4B0',  // subtle accents
          400: '#B8A082',  // muted text
          500: '#9C8A6B',  // secondary text
          600: '#7D6B4F',  // tertiary text
          700: '#5C4D39',  // strong text
          800: '#3C2E26',  // dark text
          900: '#2A1F19',  // darkest elements
        },
        // Primary Brand (Warm Blue/Teal)
        earth: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',   // light accent
          500: '#14B8A6',   // primary buttons (warm teal)
          600: '#0D9488',   // hover states
          700: '#0F766E',   // pressed states
          800: '#115E59',
          900: '#134E4A',
        },
        // AI Components (Warm Purple)
        ai: {
          50: '#F8F6FB',
          100: '#F0ECF7',
          200: '#E1D8EF',
          300: '#CFC0E3',
          400: '#B19CD9',   // light AI indicators
          500: '#9A7FB8',   // AI messages, typing bubbles
          600: '#8366A0',   // AI button hover
          700: '#6B5085',   // AI active states
          800: '#543D69',
          900: '#3D2C4E',
        },
        // Semantic Colors (Warm Variants)
        success: {
          50: '#F0FDF4',
          500: '#52B788',   // warm success green
          600: '#47A378',
          700: '#3D8F68',
        },
        warning: {
          50: '#FFF7ED',
          500: '#F77F00',   // warm orange
          600: '#E8720A',
          700: '#D96509',
        },
        error: {
          50: '#FEF2F2',
          500: '#E76F51',   // warm coral red
          600: '#D85F41',
          700: '#C94F31',
        },
        // Mood System Colors
        mood: {
          negative: '#E76F51',  // warm red-orange
          neutral: '#F4A261',   // warm amber
          positive: '#2A9D8F',  // warm teal-green
        }
      },
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
