import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import { fixupPluginRules } from "@eslint/compat";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["**/dist/**", "**/.next/**"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: "18",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...reactPlugin.configs.flat["jsx-runtime"],
  },
  {
    plugins: {
      "react-hooks": fixupPluginRules(eslintPluginReactHooks),
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
];
