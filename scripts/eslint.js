import { existsSync, promises as fs } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ESLINT_DEPENDENCIES = [
    "eslint",
    "prettier",
    "typescript-eslint",
    "@eslint/js",
    "eslint-plugin-prettier",
    "eslint-config-prettier",
    "eslint-plugin-simple-import-sort",
    "prettier-plugin-tailwindcss",
    "globals",
];

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

/**
 * Detects the package manager used in the project
 */
function detectPackageManager() {
    const cwd = process.cwd();

    if (existsSync(join(cwd, "bun.lockb"))) return "bun";
    if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
    return "npm";
}

/**
 * Installs dependencies using the detected package manager
 */
function installDependencies(dependencies) {
    const pm = detectPackageManager();
    const depsString = dependencies.join(" ");

    const commands = {
        npm: `npm install -D ${depsString}`,
        pnpm: `pnpm add -D ${depsString}`,
        yarn: `yarn add -D ${depsString}`,
        bun: `bun add -D ${depsString}`,
    };

    console.log(`\n  Installing dependencies with ${pm}...`);
    console.log(`  This may take a moment...\n`);

    try {
        execSync(commands[pm], { stdio: "inherit", cwd: process.cwd() });
        console.log("\n  Dependencies installed successfully!");
    } catch (error) {
        console.error("\n  Failed to install dependencies:", error.message);
        console.log(`\n  You can install them manually:\n  ${commands[pm]}`);
    }
}

export async function setupESLintSettings() {
    const projectDir = process.cwd();

    try {
        // Create ESLint config
        const eslintPath = join(projectDir, "eslint.config.js");
        await fs.writeFile(eslintPath, ESLINT_CONFIG_CONTENT);
        console.log(`  Created: eslint.config.js`);

        // Create Prettier config
        const prettierPath = join(projectDir, ".prettierrc.json");
        await fs.writeFile(prettierPath, JSON.stringify(PRETTIER_CONFIG, null, 4));
        console.log(`  Created: .prettierrc.json`);

        // Create Prettier ignore
        const prettierIgnorePath = join(projectDir, ".prettierignore");
        await fs.writeFile(prettierIgnorePath, PRETTIER_IGNORE);
        console.log(`  Created: .prettierignore`);

        console.log("\n  ESLint + Prettier configuration files created!");

        // Install dependencies
        installDependencies(ESLINT_DEPENDENCIES);
    } catch (error) {
        console.error("  Failed to apply ESLint settings:", error.message);
        process.exit(1);
    }
}
