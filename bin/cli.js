#!/usr/bin/env node

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

function run(script, args = []) {
    const child = spawn(process.execPath, [script, ...args], { stdio: "inherit" });
    child.on("close", (code) => process.exit(code ?? 1));
}

switch (command) {
    case "setup": {
        console.log("Starting @rueda.dev/config setup wizard...\n");
        const setupScript = join(__dirname, "..", "scripts", "setup.js");
        run(setupScript);
        break;
    }
    case "init":
    case "sync":
    case "profile":
    case "doctor":
    case "list": {
        const agentsScript = join(__dirname, "..", "scripts", "agents-cli.js");
        run(agentsScript, process.argv.slice(2));
        break;
    }
    default:
        console.log(`
@rueda.dev/config

Available commands:
  rueda-config setup     - Interactive setup wizard
  rueda-config init      - Materialize a local capability profile
  rueda-config sync      - Safely refresh generated local skills
  rueda-config doctor    - Report profile drift and local tool availability
  rueda-config list      - List providers, capabilities, and detected CLIs

Usage:
  npx @rueda.dev/config setup
    `);
}
