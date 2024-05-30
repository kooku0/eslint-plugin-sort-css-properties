import { cssPropertyGroups } from './cssPropertyGroups';
import camelCase from 'lodash.camelcase';
import { pascalcase } from './util';

const cssPropertyOrderInJs = cssPropertyGroups
  .flatMap((val) => val.properties)
  .map((val) =>
    val.startsWith(':')
      ? val
      : val.startsWith('-webkit-') || val.startsWith('-moz-')
      ? pascalcase(val)
      : camelCase(val)
  );

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort CSS properties in a specific order',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
  },
  create(context: any) {
    return {
      ObjectExpression(node: any) {
        const properties = node.properties.filter(
          (prop: any) => prop.key && cssPropertyOrderInJs.includes(prop.key.name)
        );

        const sortedProperties = [...properties].sort((a, b) => {
          return cssPropertyOrderInJs.indexOf(a.key.name) - cssPropertyOrderInJs.indexOf(b.key.name);
        });

        for (let i = 0; i < properties.length; i++) {
          if (properties[i] !== sortedProperties[i]) {
            context.report({
              node: properties[i],
              message: `CSS properties should be ordered: ${cssPropertyOrderInJs.join(', ')}`,
              fix(fixer: any) {
                const sourceCode = context.getSourceCode();
                const sortedSource = sortedProperties.map((prop) => sourceCode.getText(prop)).join(',\n');
                return fixer.replaceTextRange(
                  [properties[0].range[0], properties[properties.length - 1].range[1]],
                  sortedSource
                );
              },
            });
          }
        }
      },
    };
  },
};
