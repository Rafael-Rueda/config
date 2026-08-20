import { detectAgentProviders, setupAgentHarness } from "./agents.js";
import { setupBiomeSettings } from "./biome.js";
import { setupCode } from "./code.js";
import { setupVSCodeSettings } from "./vscode.js";

// Legacy script - runs all setup tasks with defaults
// For interactive setup, use: npx @rueda.dev/config setup

console.log("Running full setup with defaults...\n");

await setupVSCodeSettings();
await setupBiomeSettings();
await setupCode();
const detectedProviders = await detectAgentProviders();
await setupAgentHarness({ providers: Object.keys(detectedProviders).filter((name) => detectedProviders[name]) });

console.log("\nSetup complete!");
