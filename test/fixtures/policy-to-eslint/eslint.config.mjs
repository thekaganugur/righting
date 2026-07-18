import { eslintConfig } from "righting/eslint";

const existingLintConfig = {
  rules: {
    "no-undef": "error",
  },
};

export default [existingLintConfig, eslintConfig()];
