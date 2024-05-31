import camelCase from 'lodash.camelcase';
import { cssPropertyGroups } from './cssPropertyGroups';
import { pascalcase } from './util';
import { Rule } from 'eslint';

// Transform cssPropertyGroups to 2D sortedCodeArray while keeping group info
const cssPropertyOrderInJs = cssPropertyGroups.map((group) =>
  group.properties.map((val) =>
    val.startsWith(":")
      ? val
      : val.startsWith("-webkit-") || val.startsWith("-moz-")
      ? pascalcase(val)
      : camelCase(val)
  )
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

        const sourceCode = context.getSourceCode();

        // Separate spread operator and other properties, and track line breaks
        const properties: string[] = [];
        const spreadProperties: string[] = [];
        const othersProperties: string[] = [];
        const lineBreaks: number[] = [];

        node.properties.forEach((prop: any, index: number) => {
          if (index > 0) {
            const prevToken = node.properties[index - 1];
            const linesBetween = prop.loc.start.line - prevToken.loc.end.line;
            if (linesBetween > 1) {
              for (let i = 0; i < linesBetween - 1; i++) properties.push('');
            }
          }

          if (prop.type === 'SpreadElement') {
            spreadProperties.push(`...${prop.argument?.name}`);
            properties.push(`...${prop.argument?.name}`);
          } else {
            othersProperties.push(prop.key?.name || prop.key?.value);
            properties.push(prop.key?.name || prop.key?.value);
          }
        });

        // Sort properties into groups based on cssPropertyOrderInJs
        const sortedPropertiesGroups: string[][] = cssPropertyOrderInJs.map((group) =>
          group
            .filter((prop) => othersProperties.includes(prop))
            .sort((a, b) => group.indexOf(a) - group.indexOf(b))
        ).filter((group) => group.length > 0);

        const flattenedSortedProperties = sortedPropertiesGroups.reduce((acc, group, index) => {
          if (group.length > 0) {
            if (index > 0) acc.push(''); // Insert a blank line between groups
            acc.push(...group);
          }
          return acc;
        }, [] as string[]);

        if (spreadProperties.length > 0) spreadProperties.push(''); // Insert a blank line after spread properties
        const finalSortedProperties = [...spreadProperties, ...flattenedSortedProperties];

        // console.log('input', properties);
        // console.log('output', finalSortedProperties);

        // Check if sorting is necessary
        if (JSON.stringify(properties) !== JSON.stringify(finalSortedProperties)) {
          context.report({
            node,
            message: 'CSS properties should be sorted in a specific order.',
            fix(fixer) {
              const sortedCodeArray = finalSortedProperties
                .map((prop) => {
                  // spread operator
                  if (prop.startsWith('...')) {
                    return prop;
                  }

                  if (prop === '') {
                    return ''; // Preserve line breaks
                  }

                  const propNode = node.properties.find((p: any) => (p.key?.name || p.key?.value) === prop);
                  return sourceCode.getText(propNode);
                });

              let sortedCode = '';
              sortedCodeArray.forEach((item, index) => {
                if (item === '') {
                    if (index !== sortedCodeArray.length - 1) {
                        sortedCode += '\n';
                    }
                } else {
                    sortedCode += item;
                    if (index !== sortedCodeArray.length - 1) {
                        sortedCode += ',\n';
                    }
                }
              });

              // Adjust the formatting to match the expected output
              const indentedSortedCode = sortedCode.split('\n').map(line => line.trim() ? `  ${line}` : line).join('\n');
              const fixedCode = `{\n${indentedSortedCode}\n}`;

              return fixer.replaceTextRange([node.range[0], node.range[1]], fixedCode);
            },
          });
        }
      },
    };
  },
};
