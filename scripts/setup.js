import { select, confirm } from "@inquirer/prompts";
import { setupBiomeSettings } from "./biome.js";
import { setupESLintSettings } from "./eslint.js";
import { setupVSCodeSettings } from "./vscode.js";
import { setupCode } from "./code.js";

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

    // AI files confirmation
    const generateAIFiles = await confirm({
        message: "Would you like to generate AI configuration files? (.claude, .gemini, .mcp.json)",
        default: true,
    });

    printSection("Setting Up Your Project");

    // VS Code settings
    console.log("Setting up VS Code...");
    await setupVSCodeSettings();

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
        console.log("\nSetting up AI tools...");
        await setupCode(process.cwd(), { force: true });
    } else {
        console.log("\nSkipping AI configuration files...");
    }

    printSection("Setup Complete!");

    console.log("Your project has been configured with:\n");
    console.log(`  - VS Code settings`);
    console.log(`  - ${lintingChoice === "biome" ? "Biome" : "ESLint + Prettier"}`);
    if (generateAIFiles) {
        console.log("  - Claude Code configuration");
        console.log("  - Gemini CLI configuration");
        console.log("  - MCP servers configuration");
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
