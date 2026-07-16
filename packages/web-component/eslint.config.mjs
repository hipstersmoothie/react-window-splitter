// eslint.config.js

import base from "@internal/eslint-config";
import * as eslintPluginLit from "eslint-plugin-lit";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  ...base,
  eslintPluginLit.configs["flat/recommended"],
);
