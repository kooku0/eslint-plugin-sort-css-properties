import sortCssProperties from './rules/sort-css-properties.js';

export default {
  configs: {
    recommended: {
      plugins: ['sort-css-properties'],
      overrides: [
        {
          files: ['*.css', '*.scss'],
          rules: {
            'vanilla-extract/sort-css-properties': 'error',
          },
        }
      ],
    },
  },
  rules: {
    'sort-css-properties': sortCssProperties,
  },
};
