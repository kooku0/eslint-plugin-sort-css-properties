import sortCssProperties from './rules/sort-css-properties.js';

export default {
  configs: {
    recommended: {
      plugins: ['sort-css-properties'],
      overrides: [
        {
          files: ['*.css', '*.scss'],
          rules: {
            'sort-css-properties/sort-css-properties': 'error',
          },
        }
      ],
    },
  },
  rules: {
    'sort-css-properties': sortCssProperties,
  },
};
