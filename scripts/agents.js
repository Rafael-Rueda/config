import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AI_TOOL_ENTRIES, setupGitignore } from "./gitignore.js";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = path.join(PACKAGE_ROOT, "config", "agents", "capabilities.json");
const SKILLS_ROOT = path.join(PACKAGE_ROOT, "config", "agents", "skills");
export const LOCAL_MANIFEST_PATH = path.join(".agents", "rueda.config.local.json");

export function loadAgentCatalog() {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
}

function commandExists(command) {
    return new Promise((resolve) => {
        const probe = process.platform === "win32" ? "where" : "which";
        const child = spawn(probe, [command], { stdio: "ignore", windowsHide: true });
        const timer = setTimeout(() => {
            child.kill();
            resolve(false);
        }, 2_000);
        child.once("error", () => {
            clearTimeout(timer);
            resolve(false);
        });
        child.once("close", (code) => {
            clearTimeout(timer);
            resolve(code === 0);
        });
    });
}

export async function detectAgentProviders() {
    const catalog = loadAgentCatalog();
    const entries = await Promise.all(
        Object.entries(catalog.providers).map(async ([name, provider]) => [
            name,
            await commandExists(provider.command),
        ]),
    );
    return Object.fromEntries(entries);
}

function walkFiles(directory) {
    if (!fs.existsSync(directory)) return [];
    return fs
        .readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((entry) => {
            const absolute = path.join(directory, entry.name);
            return entry.isDirectory() ? walkFiles(absolute) : [absolute];
        });
}

function hashDirectory(directory) {
    const hash = createHash("sha256");
    for (const filename of walkFiles(directory)) {
        hash.update(path.relative(directory, filename).replaceAll("\\", "/"));
        hash.update("\0");
        hash.update(fs.readFileSync(filename));
        hash.update("\0");
    }
    return hash.digest("hex");
}

function copyDirectory(source, destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true, force: true });
}

function readManifest(targetDir) {
    const filename = path.join(targetDir, LOCAL_MANIFEST_PATH);
    return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, "utf8")) : null;
}

function validateSelection(catalog, providers, capabilities) {
    const unknownProviders = providers.filter((name) => !catalog.providers[name]);
    const unknownCapabilities = capabilities.filter((name) => !catalog.capabilities[name]);
    if (unknownProviders.length > 0) throw new Error(`Unknown providers: ${unknownProviders.join(", ")}`);
    if (unknownCapabilities.length > 0) throw new Error(`Unknown capabilities: ${unknownCapabilities.join(", ")}`);
    if (capabilities.length === 0) throw new Error("Select at least one capability.");
}

function destinationsFor(catalog, providers, capability, targetDir) {
    const destinations = [path.join(targetDir, ".agents", "skills", capability)];
    for (const name of providers) {
        const provider = catalog.providers[name];
        if (provider.skillMode === "copy") destinations.push(path.join(targetDir, provider.skillPath, capability));
    }
    return [...new Set(destinations)];
}

function relativeKey(targetDir, filename) {
    return path.relative(targetDir, filename).replaceAll("\\", "/");
}

function planMaterialization({ targetDir, providers, capabilities, previousGenerated, force }) {
    const catalog = loadAgentCatalog();
    const actions = [];
    const conflicts = [];
    const generated = { ...previousGenerated };
    for (const capability of capabilities) {
        const source = path.join(SKILLS_ROOT, capability);
        const sourceHash = hashDirectory(source);
        for (const destination of destinationsFor(catalog, providers, capability, targetDir)) {
            const key = relativeKey(targetDir, destination);
            const currentHash = fs.existsSync(destination) ? hashDirectory(destination) : null;
            if (currentHash === sourceHash) {
                actions.push({ action: "unchanged", path: key });
                generated[key] = sourceHash;
            } else if (currentHash && previousGenerated[key] !== currentHash && !force) {
                conflicts.push({ path: key, reason: "user-owned or modified content" });
            } else {
                actions.push({ action: currentHash ? "update" : "create", path: key, source, destination });
                generated[key] = sourceHash;
            }
        }
    }
    return { actions, conflicts, generated };
}

function manifestSchemaPath(targetDir) {
    const installed = path.join(targetDir, "node_modules", "@rueda.dev", "config", "config", "agents", "schema.json");
    return fs.existsSync(installed)
        ? "../node_modules/@rueda.dev/config/config/agents/schema.json"
        : path.join(PACKAGE_ROOT, "config", "agents", "schema.json").replaceAll("\\", "/");
}

export async function setupAgentHarness({
    targetDir = process.cwd(),
    profile = "default",
    providers,
    capabilities,
    routingProfile,
    modelOverrides,
    dryRun = false,
    force = false,
} = {}) {
    const catalog = loadAgentCatalog();
    const existing = readManifest(targetDir);
    const detected = providers ? null : await detectAgentProviders();
    const selectedProviders = providers ?? Object.keys(detected).filter((name) => detected[name]);
    const selectedCapabilities = capabilities ?? catalog.defaultCapabilities;
    validateSelection(catalog, selectedProviders, selectedCapabilities);
    const plan = planMaterialization({
        targetDir,
        providers: selectedProviders,
        capabilities: selectedCapabilities,
        previousGenerated: existing?.generated ?? {},
        force,
    });
    const ignoreMissing = AI_TOOL_ENTRIES.filter((entry) => {
        const gitignore = path.join(targetDir, ".gitignore");
        return !fs.existsSync(gitignore) || !fs.readFileSync(gitignore, "utf8").split(/\r?\n/).includes(entry);
    });
    if (routingProfile && !catalog.routingProfiles[routingProfile])
        throw new Error(`Unknown routing profile: ${routingProfile}`);
    if (dryRun)
        return {
            ...plan,
            profile,
            providers: selectedProviders,
            capabilities: selectedCapabilities,
            routingProfile,
            modelOverrides,
            ignoreMissing,
        };
    if (plan.conflicts.length > 0) {
        throw new Error(
            `Refusing to overwrite modified local files: ${plan.conflicts.map(({ path: name }) => name).join(", ")}`,
        );
    }
    setupGitignore(targetDir);
    for (const action of plan.actions) {
        if (action.action === "create" || action.action === "update") copyDirectory(action.source, action.destination);
    }
    const manifest = {
        $schema: manifestSchemaPath(targetDir),
        version: 1,
        activeProfile: profile,
        profiles: {
            ...(existing?.profiles ?? {}),
            [profile]: {
                providers: selectedProviders,
                capabilities: selectedCapabilities,
                ...(routingProfile ? { routingProfile } : {}),
                ...(modelOverrides && Object.keys(modelOverrides).length > 0 ? { modelOverrides } : {}),
            },
        },
        generated: plan.generated,
        updatedAt: new Date().toISOString(),
    };
    const filename = path.join(targetDir, LOCAL_MANIFEST_PATH);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, `${JSON.stringify(manifest, null, 4)}\n`, "utf8");
    return {
        ...plan,
        profile,
        providers: selectedProviders,
        capabilities: selectedCapabilities,
        routingProfile,
        modelOverrides,
        ignoreMissing: [],
    };
}

export async function syncAgentHarness({ targetDir = process.cwd(), profile, dryRun = false, force = false } = {}) {
    const manifest = readManifest(targetDir);
    if (!manifest) throw new Error(`No local agent manifest at ${LOCAL_MANIFEST_PATH}. Run init first.`);
    const selectedProfile = profile ?? manifest.activeProfile;
    const selection = manifest.profiles[selectedProfile];
    if (!selection) throw new Error(`Unknown local profile: ${selectedProfile}`);
    return setupAgentHarness({ targetDir, profile: selectedProfile, ...selection, dryRun, force });
}

export async function doctorAgentHarness({ targetDir = process.cwd() } = {}) {
    const manifest = readManifest(targetDir);
    const detected = await detectAgentProviders();
    const drift = [];
    for (const [relative, expected] of Object.entries(manifest?.generated ?? {})) {
        const absolute = path.join(targetDir, relative);
        if (!fs.existsSync(absolute)) drift.push({ path: relative, state: "missing" });
        else if (hashDirectory(absolute) !== expected) drift.push({ path: relative, state: "modified" });
    }
    const gitignore = path.join(targetDir, ".gitignore");
    const lines = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, "utf8").split(/\r?\n/) : [];
    return {
        manifest: manifest ? LOCAL_MANIFEST_PATH : null,
        activeProfile: manifest?.activeProfile ?? null,
        detected,
        drift,
        ignoreMissing: AI_TOOL_ENTRIES.filter((entry) => !lines.includes(entry)),
    };
}
