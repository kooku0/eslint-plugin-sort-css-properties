import { RuleTester } from 'eslint';
import { sortCssProperties } from '../lib/rules/sort-css-properties';

const validCode = `
const styles = {
  ...otherStyles,
  position: 'relative',
  top: '10px',
  display: 'flex'
};
`;

const invalidCode = `
const styles = {
  display: 'flex',
  position: 'relative',
  top: '10px'
  ...otherStyles,
};
`;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
});

ruleTester.run('sort-css-properties', sortCssProperties, {
  valid: [
    {
      code: validCode,
    },
  ],
  invalid: [
    {
      code: invalidCode,
      errors: [{ message: 'CSS properties should be sorted in a specific order.' }],
      output: validCode,
    },
  ],
});
