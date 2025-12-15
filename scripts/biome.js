import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
}
