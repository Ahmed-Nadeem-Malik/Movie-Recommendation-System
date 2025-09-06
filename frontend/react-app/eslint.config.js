import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["dist", "node_modules", "*.config.js", "*.config.ts"],
    },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            // React Hooks rules
            ...reactHooks.configs.recommended.rules,

            // React Refresh rules
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],

            // TypeScript specific rules
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",

            // General code quality rules
            "no-console": "warn",
            "no-debugger": "error",
            "prefer-const": "error",
            "no-var": "error",

            // Code style rules (optimized for eslint_d and Neovim)
            "comma-dangle": ["error", "always-multiline"],
            "semi": ["error", "always"],
            "quotes": ["error", "double", { avoidEscape: true }],
            "indent": ["error", 4],
            "max-len": ["warn", { code: 100, ignoreUrls: true }],
        },
    },
);
