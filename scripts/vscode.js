import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVSCodeSettings() {
    try {
        // Path to the configuration file in your package
        const configPath = join(__dirname, "..", "config", "vscode", "settings.json");

        // Target path in the user's project
        const targetDir = join(process.cwd(), ".vscode");
        const targetPath = join(targetDir, "settings.json");

        // Read the settings from your package
        const configContent = await fs.readFile(configPath, "utf-8");
        const config = JSON.parse(configContent);

        // Create .vscode directory if it doesn't exist
        await fs.mkdir(targetDir, { recursive: true });

        let finalConfig = config;

        // If settings.json already exists, merge configs
        try {
            const existingContent = await fs.readFile(targetPath, "utf-8");
            const existingConfig = JSON.parse(existingContent);

            // Merge configurations (your configs take priority)
            finalConfig = {
                ...existingConfig,
                ...config,
            };

            console.log("  Existing settings found, merging...");
        } catch (error) {
            console.log("  Creating new settings file...");
        }

        // Write the final settings
        await fs.writeFile(targetPath, JSON.stringify(finalConfig, null, 2));

        console.log("  VS Code settings applied successfully!");
        console.log(`  Created: ${targetPath}`);
    } catch (error) {
        console.error("  Failed to apply VS Code settings:", error.message);
        process.exit(1);
    }
}
