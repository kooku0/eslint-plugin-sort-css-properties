"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sort_css_properties_js_1 = __importDefault(require("./rules/sort-css-properties.js"));
exports.default = {
    rules: {
        'sort-css-properties': sort_css_properties_js_1.default,
    },
};
