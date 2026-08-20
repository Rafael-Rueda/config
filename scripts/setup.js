import { checkbox, confirm, select } from "@inquirer/prompts";

import { detectAgentProviders, loadAgentCatalog, setupAgentHarness } from "./agents.js";
import { setupBiomeSettings } from "./biome.js";
import { setupESLintSettings } from "./eslint.js";
import { setupVSCodeSettings } from "./vscode.js";

function printHeader() {
    console.log("\n┌────────────────────────────────────────────────────┐");
    console.log("│                                                    │");
    console.log("│           @rueda.dev/config Setup Wizard           │");
    console.log("│                                                    │");
    console.log("└────────────────────────────────────────────────────┘\n");
}

function printSection(title) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`  ${title}`);
    console.log(`${"─".repeat(50)}\n`);
}

async function runSetup() {
    printHeader();

    // Linting tool selection
    const lintingChoice = await select({
        message: "Which linting tool would you like to use?",
        choices: [
            {
                name: "Biome (Recommended)",
                value: "biome",
                description: "Fast, all-in-one linter and formatter",
            },
            {
                name: "ESLint + Prettier",
                value: "eslint",
                description: "Traditional setup with more ecosystem plugins",
            },
        ],
    });

    const generateAIFiles = await confirm({
        message: "Would you like to set up local, gitignored agent capabilities?",
        default: true,
    });

    let selectedProviders = [];
    if (generateAIFiles) {
        const catalog = loadAgentCatalog();
        const detected = await detectAgentProviders();
        selectedProviders = await checkbox({
            message: "Which optional agent profiles should discover the shared skills?",
            choices: Object.entries(catalog.providers).map(([value, provider]) => ({
                name: `${provider.label}${provider.recommended ? " (first-class)" : ""}${detected[value] ? " - detected" : ""}`,
                value,
                checked: detected[value],
            })),
        });
    }

    printSection("Setting Up Your Project");

    // VS Code settings (pass linting choice)
    console.log("Setting up VS Code...");
    await setupVSCodeSettings({ linter: lintingChoice });

    // Linting setup
    if (lintingChoice === "biome") {
        console.log("\nSetting up Biome...");
        await setupBiomeSettings();
    } else {
        console.log("\nSetting up ESLint + Prettier...");
        await setupESLintSettings();
    }

    // AI files setup
    if (generateAIFiles) {
        console.log("\nSetting up local agent capabilities...");
        await setupAgentHarness({ providers: selectedProviders });
    } else {
        console.log("\nSkipping AI configuration files...");
    }

    printSection("Setup Complete!");

    console.log("Your project has been configured with:\n");
    console.log(`  - VS Code settings (configured for ${lintingChoice === "biome" ? "Biome" : "ESLint + Prettier"})`);
    console.log(`  - ${lintingChoice === "biome" ? "Biome" : "ESLint + Prettier"}`);
    if (generateAIFiles) {
        console.log("  - Shared, provider-neutral agent skills");
        console.log(`  - Optional profiles: ${selectedProviders.join(", ") || "none (VS Code/CLI neutral)"}`);
    }

    console.log("\nHappy coding!\n");
}

runSetup().catch((error) => {
    if (error.name === "ExitPromptError") {
        console.log("\nSetup cancelled.\n");
        process.exit(0);
    }
    console.error("Setup failed:", error.message);
    process.exit(1);
});
