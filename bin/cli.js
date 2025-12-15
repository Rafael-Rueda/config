#!/usr/bin/env node

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

switch (command) {
    case "setup": {
        console.log("Starting @rueda.dev/config setup wizard...\n");
        const setupScript = join(__dirname, "..", "scripts", "setup.js");
        const child = spawn("node", [setupScript], { stdio: "inherit" });

        child.on("close", (code) => {
            process.exit(code);
        });
        break;
    }
    default:
        console.log(`
@rueda.dev/config

Available commands:
  rueda-config setup     - Interactive setup wizard

Usage:
  npx @rueda.dev/config setup
    `);
}
