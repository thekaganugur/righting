import babelParser from "@babel/eslint-parser";
import { eslintConfig } from "righting/eslint";

const existingLintConfig = {
  rules: {
    "no-undef": "error",
  },
};

export default [
  existingLintConfig,
  {
    files: ["**/*.mts"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { plugins: ["@babel/plugin-syntax-typescript"] },
      },
    },
  },
  eslintConfig(),
];
