/** @type {import('tailwindcss').Config} */
export default {
  content: ['./pb_hooks/pages/**/*.{ejs,md}'],
  theme: {
    extend: {
      fontSize: {
        '2xs': [
          '0.625rem',
          {
            // 10px
            lineHeight: '0.75rem', // 12px
          },
        ],
      },
    },
  },
  daisyui: {
    themes: ['black'],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwindcss-animate'),
  ],
}
