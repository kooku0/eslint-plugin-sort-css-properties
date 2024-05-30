"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cssPropertyGroups_1 = require("./cssPropertyGroups");
var lodash_camelcase_1 = __importDefault(require("lodash.camelcase"));
var util_1 = require("./util");
var cssPropertyOrderInJs = cssPropertyGroups_1.cssPropertyGroups
    .flatMap(function (val) { return val.properties; })
    .map(function (val) {
    return val.startsWith(':')
        ? val
        : val.startsWith('-webkit-') || val.startsWith('-moz-')
            ? (0, util_1.pascalcase)(val)
            : (0, lodash_camelcase_1.default)(val);
});
exports.default = {
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
    create: function (context) {
        return {
            ObjectExpression: function (node) {
                var properties = node.properties.filter(function (prop) { return prop.key && cssPropertyOrderInJs.includes(prop.key.name); });
                var sortedProperties = __spreadArray([], properties, true).sort(function (a, b) {
                    return cssPropertyOrderInJs.indexOf(a.key.name) - cssPropertyOrderInJs.indexOf(b.key.name);
                });
                for (var i = 0; i < properties.length; i++) {
                    if (properties[i] !== sortedProperties[i]) {
                        context.report({
                            node: properties[i],
                            message: "CSS properties should be ordered: ".concat(cssPropertyOrderInJs.join(', ')),
                            fix: function (fixer) {
                                var sourceCode = context.getSourceCode();
                                var sortedSource = sortedProperties.map(function (prop) { return sourceCode.getText(prop); }).join(',\n');
                                return fixer.replaceTextRange([properties[0].range[0], properties[properties.length - 1].range[1]], sortedSource);
                            },
                        });
                    }
                }
            },
        };
    },
};
