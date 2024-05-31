import { RuleTester } from 'eslint';
import { sortCssProperties } from '../lib/rules/sort-css-properties';

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020, sourceType: "module" } });

ruleTester.run('sort-css-properties', sortCssProperties, {
  valid: [
    {
      code: `
const styles = {
  position: 'relative',
  top: '10px',

  display: 'flex'
};
      `,
    },
    {
      code: `
const styles = {
  ...otherStyles,

  position: 'relative',
  top: '10px',

  display: 'flex'
};
      `,
    },
  ],
  invalid: [
    {
      code: `
const styles = {
  display: 'flex',
  top: '10px',
  position: 'relative'
};
      `,
      errors: [{ message: 'CSS properties should be sorted in a specific order.' }],
      output: `
const styles = {
  position: 'relative',
  top: '10px',

  display: 'flex'
};
      `,
    },
    {
      code: `
const styles = {
  display: 'flex',
  
  position: 'relative',
  top: '10px',
  ...otherStyles
};
      `,
      errors: [{ message: 'CSS properties should be sorted in a specific order.' }],
      output: `
const styles = {
  ...otherStyles,

  position: 'relative',
  top: '10px',

  display: 'flex'
};
      `,
    },
  ],
});
