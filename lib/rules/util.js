"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pascalcase = void 0;
// @ts-nocheck
var lodash_camelcase_1 = __importDefault(require("lodash.camelcase"));
var PUNCTUATION = /[^\p{L}\p{N}]+/ug;
var toString = function (input) {
    if (input == null)
        return '';
    if (Array.isArray(input)) {
        return input.map(function (s) { return s.toString().trim(); }).filter(function (s) { return s.length > 0; }).join(' ');
    }
    if (typeof input === 'function') {
        return input.name ? input.name : '';
    }
    if (typeof input.toString !== 'function') {
        return '';
    }
    return input.toString().trim();
};
var pascalcase = function (value, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var input = toString(value);
    var regex = (_a = options.punctuationRegex) !== null && _a !== void 0 ? _a : PUNCTUATION;
    var output = input ? (0, lodash_camelcase_1.default)(regex ? input.replace(regex, ' ') : input, options) : '';
    return output ? output[0].toLocaleUpperCase(options.locale) + output.slice(1) : '';
};
exports.pascalcase = pascalcase;
