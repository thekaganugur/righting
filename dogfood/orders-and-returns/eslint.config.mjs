import babelParser from "@babel/eslint-parser";
import { eslintConfig } from "righting/eslint";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          plugins: ["@babel/plugin-syntax-typescript"],
        },
      },
    },
    rules: {
      "no-constant-binary-expression": "error"
    }
  },
  eslintConfig(),
];
