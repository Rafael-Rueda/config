import { existsSync, promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BIOME_DEPENDENCIES = ["@biomejs/biome"];

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

export async function setupBiomeSettings() {
    const targetPath = join(process.cwd(), "biome.json");

    try {
        const existingConfig = await fs.readFile(targetPath, "utf-8");
        const config = JSON.parse(existingConfig);

        const finalConfig = {
            ...config,
            extends: ["@rueda.dev/config/biome"],
            vcs: {
                enabled: true,
                clientKind: "git",
                useIgnoreFile: true,
            },
        };

        await fs.writeFile(targetPath, JSON.stringify(finalConfig, null, 2));

        console.log("  Biome settings applied successfully!");
        console.log(`  Updated: ${targetPath}`);
    } catch (error) {
        console.log("  Creating new Biome configuration file...");
        try {
            const configContent = {
                $schema: "https://biomejs.dev/schemas/2.3.8/schema.json",
                extends: ["@rueda.dev/config/biome"],
                vcs: {
                    enabled: true,
                    clientKind: "git",
                    useIgnoreFile: true,
                },
            };

            await fs.writeFile(targetPath, JSON.stringify(configContent, null, 2));

            console.log("  Biome settings applied successfully!");
            console.log(`  Created: ${targetPath}`);
        } catch (error) {
            console.error("  Failed to apply Biome settings:", error.message);
            process.exit(1);
        }
    }

    // Install dependencies
    installDependencies(BIOME_DEPENDENCIES);
}
