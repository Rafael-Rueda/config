import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { doctorAgentHarness, setupAgentHarness, syncAgentHarness } from "../scripts/agents.js";

const temporaryDirectories = [];

function temporaryDirectory() {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "rueda-agents-test-"));
    temporaryDirectories.push(directory);
    return directory;
}

afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

describe("agent profile manager", () => {
    it("materializes canonical and copy-adapter skills into ignored local paths", async () => {
        const targetDir = temporaryDirectory();
        const result = await setupAgentHarness({
            targetDir,
            providers: ["codex", "cline"],
            capabilities: ["verify-change"],
        });
        expect(result.conflicts).toEqual([]);
        expect(fs.existsSync(path.join(targetDir, ".agents", "skills", "verify-change", "SKILL.md"))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, ".cline", "skills", "verify-change", "SKILL.md"))).toBe(true);
        const manifest = JSON.parse(
            fs.readFileSync(path.join(targetDir, ".agents", "rueda.config.local.json"), "utf8"),
        );
        expect(manifest.profiles.default.providers).toEqual(["codex", "cline"]);
    });

    it("plans without writing and refuses to overwrite modified local skills", async () => {
        const dryRunDir = temporaryDirectory();
        const plan = await setupAgentHarness({
            targetDir: dryRunDir,
            providers: [],
            capabilities: ["verify-change"],
            dryRun: true,
        });
        expect(plan.actions.some(({ action }) => action === "create")).toBe(true);
        expect(fs.existsSync(path.join(dryRunDir, ".agents"))).toBe(false);

        const targetDir = temporaryDirectory();
        await setupAgentHarness({ targetDir, providers: [], capabilities: ["verify-change"] });
        fs.appendFileSync(path.join(targetDir, ".agents", "skills", "verify-change", "SKILL.md"), "\nlocal change\n");
        await expect(syncAgentHarness({ targetDir })).rejects.toThrow("Refusing to overwrite modified local files");
        const doctor = await doctorAgentHarness({ targetDir });
        expect(doctor.drift).toContainEqual({ path: ".agents/skills/verify-change", state: "modified" });
    });
});
