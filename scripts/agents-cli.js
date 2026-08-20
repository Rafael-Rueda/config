#!/usr/bin/env node

import {
    detectAgentProviders,
    doctorAgentHarness,
    loadAgentCatalog,
    setupAgentHarness,
    syncAgentHarness,
} from "./agents.js";

function option(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function listOption(name) {
    return option(name)
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

function mapOption(name) {
    return Object.fromEntries(
        (listOption(name) ?? []).map((entry) => {
            const separator = entry.indexOf("=");
            if (separator < 1) throw new Error(`${name} values must use provider=value.`);
            return [entry.slice(0, separator), entry.slice(separator + 1)];
        }),
    );
}

function print(value) {
    console.log(JSON.stringify(value, null, 4));
}

const command = process.argv[2] ?? "help";
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const profile = option("--profile");

try {
    if (command === "init") {
        print(
            await setupAgentHarness({
                profile,
                providers: listOption("--providers"),
                capabilities: listOption("--capabilities"),
                routingProfile: option("--routing"),
                modelOverrides: mapOption("--model"),
                dryRun,
                force,
            }),
        );
    } else if (command === "sync") {
        print(await syncAgentHarness({ profile, dryRun, force }));
    } else if (command === "profile") {
        const name = process.argv[3];
        if (!name) throw new Error("Usage: rueda-config profile <name>");
        print(await syncAgentHarness({ profile: name, dryRun, force }));
    } else if (command === "doctor") {
        print(await doctorAgentHarness());
    } else if (command === "list") {
        print({ catalog: loadAgentCatalog(), detected: await detectAgentProviders() });
    } else {
        console.log(`Agent profile commands:
  rueda-config init [--profile name] [--providers codex,devin] [--capabilities verify-change,...]
                    [--routing routine|complex] [--model claude=sonnet,codex=host] [--dry-run]
  rueda-config sync [--profile name] [--dry-run]
  rueda-config profile <name> [--dry-run]
  rueda-config doctor
  rueda-config list`);
    }
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
