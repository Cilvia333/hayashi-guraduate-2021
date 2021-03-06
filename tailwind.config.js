const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'renderer/**/*.css',
      'renderer/**/*.js',
      'renderer/**/*.ts',
      'renderer/**/*.jsx',
      'renderer/**/*.tsx',
    ],
  },
  theme: {
    extend: {
      spacing: {
        pt: {
          3: '24px',
          6: '48px',
          8: '64px',
          10: '80px',
          12: '96px',
          18: '144px',
          24: '196px',
          30: '240px',
          31: '248px',
          36: '288px',
          54: '432px',
        },
      },
      colors: {
        primary: '#FF2CD7',
        success: '#09E85E',
        lightGray: '#757780',
        darkGray: '#45474C',
        gray: '#757780',
        surface: {
          0: '#FCFBFC',
          1: '#ffffff',
          2: '#CDD0DA',
          3: '#000000',
        },
      },
      fontFamily: {
        header: ['Avenir Next', 'Noto Sans JP', defaultTheme.fontFamily.sans],
        text: ['Avenir Next', 'Noto Sans JP', defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        circle: '50%',
      },
      transitionDelay: {
        0: '0ms',
      },
      boxShadow: {
        black: '0px 2px 4px rgba(0, 0, 0, 0.25)',
        pink: '0px 0px 32px rgba(208, 161, 191, 0.25)',
      },
    },
  },
  variants: {
    width: ['responsive', 'hover', 'group-hover'],
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {};

      addUtilities(newUtilities);
    },
  ],
};
