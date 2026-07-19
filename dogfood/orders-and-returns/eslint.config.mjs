import { eslintConfig } from "righting/eslint";

export default [
  {
    files: ["**/*.ts"],
    rules: {
      "no-constant-binary-expression": "error"
    }
  },
  eslintConfig(),
];
