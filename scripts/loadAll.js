import { setupBiomeSettings } from "./biome.js";
import { setupVSCodeSettings } from "./vscode.js";
import { setupCode } from "./code.js";

// Legacy script - runs all setup tasks with defaults
// For interactive setup, use: npx @rueda.dev/config setup

console.log("Running full setup with defaults...\n");

await setupVSCodeSettings();
await setupBiomeSettings();
await setupCode();

console.log("\nSetup complete!");
