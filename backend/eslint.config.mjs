import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.{js,mjs,cjs, mts,cts}"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  { rules: {
      '@typescript-eslint/no-require-imports': 'off',
    }}
]);
