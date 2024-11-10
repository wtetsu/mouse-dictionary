import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["**/node_modules/", "**/__test__/", "**/tools/", "**/*.config.js", "**/*.config.*.js"],
  },
  ...compat.extends("eslint:recommended"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        chrome: true,
        BROWSER: true,
        MODE: true,
        DEBUG: true,
        DIALOG_ID: true,
        process: true,
      },

      ecmaVersion: 2022,
      sourceType: "module",
    },

    rules: {
      "linebreak-style": ["error", "unix"],
      semi: ["error", "always"],
      eqeqeq: 2,
    },
  },
  ...compat.extends("plugin:react/recommended", "plugin:@typescript-eslint/recommended").map((config) => ({
    ...config,
    files: ["src/options/**/*.ts", "src/options/**/*.tsx"],
  })),
  {
    files: ["src/options/**/*.ts", "src/options/**/*.tsx"],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": 0,
      "@typescript-eslint/no-explicit-any": 0,
    },
  },
];
