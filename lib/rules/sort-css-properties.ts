import camelCase from 'lodash.camelcase';
import { cssPropertyGroups } from './cssPropertyGroups';
import { pascalcase } from './util';
import { Rule } from 'eslint';

const cssPropertyOrderInJs = cssPropertyGroups
  .flatMap((val) => val.properties)
  .map((val) =>
    val.startsWith(":")
      ? val
      : val.startsWith("-webkit-") || val.startsWith("-moz-")
      ? pascalcase(val)
      : camelCase(val),
  );

export const sortCssProperties: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Sort CSS properties in a specific order",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [], // no options
  },
  create(context) {
    return {
      ObjectExpression(node: any) {
        if (!node.properties || !Array.isArray(node.properties)) {
          return;
        }

        const properties = node.properties.map((prop: any) => prop.key?.name || prop.key?.value);

        // Separate spread operator and other properties
        const spreadIndices: number[] = [];
        const spreadProperties: string[] = [];
        properties.forEach((prop: any, index: number) => {
          if (prop && prop.startsWith && prop.startsWith('...')) {
            spreadIndices.push(index);
            spreadProperties.push(prop);
          }
        });
        spreadIndices.reverse().forEach((index) => properties.splice(index, 1));

        // Sort the remaining properties
        const sortedProperties = [...properties].sort((a, b) => {
          return cssPropertyOrderInJs.indexOf(a) - cssPropertyOrderInJs.indexOf(b);
        });

        if (JSON.stringify(properties) !== JSON.stringify([...spreadProperties, ...sortedProperties])) {
          context.report({
            node,
            message: 'CSS properties should be sorted in a specific order.',
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const sortedCode = [...spreadProperties, ...sortedProperties]
                .map((prop) => {
                  const propNode = node.properties.find((p: any) => (p.key?.name || p.key?.value) === prop);
                  return sourceCode.getText(propNode);
                })
                .join(',\n');

              // Adjust the formatting to match the expected output
              const indentedSortedCode = sortedCode.split('\n').map(line => `  ${line}`).join('\n');
              const fixedCode = `{\n${indentedSortedCode}\n}`;

              return fixer.replaceTextRange([node.range[0], node.range[1]], fixedCode);
            },
          });
        }
      },
    };
  },
};
