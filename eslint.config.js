// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  // Ignore build folders
  { ignores: ["dist", "build", ".vite"] },

  // Apply to all JS/JSX files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node, // optional: if you use Node.js globals
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: {
      react: {
        version: "detect", // automatically detects React version
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "react/prop-types": "off", // if you're not using PropTypes
      "no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
    },
  },
];