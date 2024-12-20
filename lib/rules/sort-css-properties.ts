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

        // Check if this is a CSS-in-JS object
        const hasCssProperties = node.properties.some((prop: any) => {
          const propName = prop.key?.name || prop.key?.value;
          return cssPropertyOrderInJs.some(group => 
            group.some(cssProp => cssProp === propName)
          );
        });

        if (!hasCssProperties) {
          return;
        }

        const sourceCode = context.getSourceCode();
        const properties: string[] = [];
        const spreadProperties: string[] = [];
        const othersProperties: string[] = [];

        node.properties.forEach((prop: any) => {
          if (prop.type === 'SpreadElement') {
            spreadProperties.push(`...${prop.argument?.name}`);
            properties.push(`...${prop.argument?.name}`);
          } else {
            othersProperties.push(prop.key?.name || prop.key?.value);
            properties.push(prop.key?.name || prop.key?.value);
          }
        });

        // Sort properties into groups
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

        if (spreadProperties.length > 0) {
          spreadProperties.push(''); // Insert a blank line after spread properties
        }
        const finalSortedProperties = [...spreadProperties, ...flattenedSortedProperties];

        // Check if sorting is necessary
        if (JSON.stringify(properties) !== JSON.stringify(finalSortedProperties)) {
          context.report({
            node,
            message: 'CSS properties should be sorted in a specific order.',
            fix(fixer) {
              const sortedCodeArray = finalSortedProperties
                .map((prop) => {
                  if (prop.startsWith('...')) {
                    return prop;
                  }

                  if (prop === '') {
                    return '';
                  }

                  const propNode = node.properties.find((p: any) => 
                    (p.key?.name || p.key?.value) === prop
                  );
                  return sourceCode.getText(propNode);
                });

              // 원본 코드의 들여쓰기를 유지하기 위해 첫 번째 속성의 들여쓰기를 가져옴
              const firstProp = node.properties[0];
              const baseIndent = ' '.repeat(firstProp.loc.start.column);
              
              const indent = sourceCode.text.slice(0, node.range[0]).match(/\s*$/)?.[0] || '';
              const propertyIndent = indent + '  ';
              
              let sortedCode = '{\n';
              sortedCodeArray.forEach((item, index) => {
                if (item === '') {
                  if (index !== sortedCodeArray.length - 1) {
                    sortedCode += '\n';
                  }
                } else {
                  sortedCode += `${propertyIndent}${item}`;
                  if (index !== sortedCodeArray.length - 1) {
                    sortedCode += ',\n';
                  }
                }
              });
              sortedCode += `\n${indent}}`;

              return fixer.replaceText(node, sortedCode);
            },
          });
        }
      },
    };
  },
};
