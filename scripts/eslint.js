import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(__dirname, "..", "config", "linting");

const ESLINT_CONFIG_CONTENT = `import eslint from "@eslint/js";
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
            // Disabled (matching Biome preferences)
            "@typescript-eslint/no-unused-vars": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-non-null-assertion": "off",

            // Import sorting (equivalent to Biome's organizeImports)
            "simple-import-sort/imports": [
                "warn",
                {
                    groups: [
                        // Node.js builtins
                        ["^node:"],
                        // External packages
                        ["^@?\\\\w"],
                        // Internal aliases (@/components, @/utils)
                        ["^@/components", "^@/utils"],
                        // Relative imports
                        ["^\\\\."],
                    ],
                },
            ],
            "simple-import-sort/exports": "warn",

            // Recommended rules with adjustments
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },

    // TypeScript/JavaScript files
    {
        files: ["**/*.{js,ts,jsx,tsx}"],
    },

    // Test files override (matching Biome)
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
`;

const PRETTIER_CONFIG = {
    $schema: "https://json.schemastore.org/prettierrc",
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,
    tabWidth: 4,
    useTabs: false,
    printWidth: 120,
    trailingComma: "all",
    arrowParens: "always",
    bracketSpacing: true,
    endOfLine: "lf",
    plugins: ["prettier-plugin-tailwindcss"],
    tailwindFunctions: ["clsx", "cva", "tw"],
};

const PRETTIER_IGNORE = `# Dependencies
node_modules/

# Build outputs
dist/
build/
.next/
.nuxt/
out/

# Coverage
coverage/

# Minified files
*.min.js
*.min.css

# Lock files
package-lock.json
pnpm-lock.yaml
yarn.lock

# Generated
*.generated.*
.vercel/
`;

export async function setupESLintSettings() {
    const projectDir = process.cwd();

    try {
        // Create ESLint config
        const eslintPath = join(projectDir, "eslint.config.js");
        await fs.writeFile(eslintPath, ESLINT_CONFIG_CONTENT);
        console.log(`  Created: ${eslintPath}`);

        // Create Prettier config
        const prettierPath = join(projectDir, ".prettierrc.json");
        await fs.writeFile(prettierPath, JSON.stringify(PRETTIER_CONFIG, null, 4));
        console.log(`  Created: ${prettierPath}`);

        // Create Prettier ignore
        const prettierIgnorePath = join(projectDir, ".prettierignore");
        await fs.writeFile(prettierIgnorePath, PRETTIER_IGNORE);
        console.log(`  Created: ${prettierIgnorePath}`);

        console.log("\nESLint + Prettier configuration applied successfully!");

        console.log("\nRequired dependencies:");
        console.log(
            "  npm i -D eslint prettier typescript-eslint @eslint/js eslint-plugin-prettier eslint-config-prettier eslint-plugin-simple-import-sort prettier-plugin-tailwindcss globals",
        );
    } catch (error) {
        console.error("Failed to apply ESLint settings:", error.message);
        process.exit(1);
    }
}
