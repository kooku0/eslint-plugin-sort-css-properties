import { RuleTester } from 'eslint';
import { rule } from '../lib/rules/sort-css-properties';

const validCode = `
const styles = {
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
};
`;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
});

ruleTester.run('sort-css-properties', rule, {
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
