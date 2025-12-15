import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default tseslint.config(
    // Global ignores
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/*.min.js",
            "**/coverage/**",
            "**/.next/**",
            "**/.nuxt/**",
        ],
    },

    // Base configs
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettier,

    // Global settings for all files
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2024,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
            },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            // Desabilitados (como no Biome)
            "@typescript-eslint/no-unused-vars": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-non-null-assertion": "off",

            // Import sorting (equivalente ao organizeImports do Biome)
            "simple-import-sort/imports": [
                "warn",
                {
                    groups: [
                        // Node.js builtins
                        ["^node:"],
                        // External packages
                        ["^@?\\w"],
                        // Internal aliases (@/components, @/utils)
                        ["^@/components", "^@/utils"],
                        // Relative imports
                        ["^\\."],
                    ],
                },
            ],
            "simple-import-sort/exports": "warn",

            // Regras recomendadas com ajustes
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },

    // TypeScript/JavaScript files
    {
        files: ["**/*.{js,ts,jsx,tsx}"],
    },

    // Test files override (como no Biome)
    {
        files: ["**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },

    // Config files
    {
        files: ["*.config.{js,ts,mjs,cjs}"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
);
