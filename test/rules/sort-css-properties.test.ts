import { RuleTester } from 'eslint';
import { sortCssProperties } from '../../lib/rules/sort-css-properties';

describe('sort-css-properties', () => {
  const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  });

  ruleTester.run('sort-css-properties', sortCssProperties, {
    valid: [
      // 기본적인 CSS 속성 정렬
      {
        code: [
          'const styles = {',
          "  display: 'flex',",
          "  flexDirection: 'column',",
          '',
          "  padding: '10px',",
          "  margin: '20px',",
          '',
          "  color: 'red'",
          '};'
        ].join('\n')
      },
      // 비 CSS 객체는 무시
      {
        code: [
          'const nonCssObject = {',
          '  name: "John",',
          '  age: 30',
          '};'
        ].join('\n')
      },
      // spread 연산자가 있는 경우
      {
        code: [
          'const styles = {',
          '  ...otherStyles,',
          '',
          "  display: 'flex',",
          '',
          "  padding: '10px',",
          '',
          "  color: 'red'",
          '};'
        ].join('\n')
      },
      // 단일 속성
      {
        code: [
          'const styles = {',
          "  display: 'flex'",
          '};'
        ].join('\n')
      }
    ],
    invalid: [
      // 잘못된 순서의 CSS 속성
      {
        code: [
          'const styles = {',
          "  color: 'red',",
          "  display: 'flex',",
          "  padding: '10px'",
          '};'
        ].join('\n'),
        output: [
          'const styles = {',
          "  display: 'flex',",
          '',
          "  padding: '10px',",
          '',
          "  color: 'red'",
          '};'
        ].join('\n'),
        errors: [{ message: 'CSS properties should be sorted in a specific order.' }],
      },
      // 여러 그룹의 속성이 섞여 있는 경우
      {
        code: [
          'const styles = {',
          "  color: 'red',",
          "  margin: '20px',",
          "  display: 'flex',",
          "  padding: '10px',",
          "  flexDirection: 'column'",
          '};'
        ].join('\n'),
        output: [
          'const styles = {',
          "  display: 'flex',",
          "  flexDirection: 'column',",
          '',
          "  padding: '10px',",
          "  margin: '20px',",
          '',
          "  color: 'red'",
          '};'
        ].join('\n'),
        errors: [{ message: 'CSS properties should be sorted in a specific order.' }],
      },
      // spread 연산자와 속성이 섞여 있는 경우
      {
        code: [
          'const styles = {',
          "  color: 'red',",
          '  ...spread1,',
          "  display: 'flex',",
          '  ...spread2,',
          "  padding: '10px'",
          '};'
        ].join('\n'),
        output: [
          'const styles = {',
          '  ...spread1,',
          '  ...spread2,',
          '',
          "  display: 'flex',",
          '',
          "  padding: '10px',",
          '',
          "  color: 'red'",
          '};'
        ].join('\n'),
        errors: [{ message: 'CSS properties should be sorted in a specific order.' }],
      }
    ],
  });
});
