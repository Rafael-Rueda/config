import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { setupAgentHarness } from "../scripts/agents.js";
import { setupCode } from "../scripts/code.js";

describe("Integration: local AI setup", () => {
    let tempDir = "";

    beforeAll(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rueda-config-test-"));
    });

    afterAll(() => {
        if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("creates ignored legacy configs and neutral capabilities", async () => {
        await setupCode(tempDir, { force: true });
        await setupAgentHarness({
            targetDir: tempDir,
            providers: ["codex", "claude"],
            capabilities: ["verify-change"],
        });

        const gitignore = fs.readFileSync(path.join(tempDir, ".gitignore"), "utf8");
        for (const entry of ["/.agents/", "/.codex/", "/.devin/", "/.claude/", "/.cline/", "/.gemini/", "/.mcp.json"]) {
            expect(gitignore).toContain(entry);
        }

        const gemini = JSON.parse(fs.readFileSync(path.join(tempDir, ".gemini", "settings.json"), "utf8"));
        expect(gemini.model).toBeUndefined();
        const claude = JSON.parse(fs.readFileSync(path.join(tempDir, ".claude", "settings.json"), "utf8"));
        expect(claude.model).toBe("sonnet");
        const mcp = JSON.parse(fs.readFileSync(path.join(tempDir, ".mcp.json"), "utf8"));
        expect(mcp.mcpServers["taskmaster-ai"].env.MODEL).toBe("claude-sonnet-5");

        expect(fs.existsSync(path.join(tempDir, ".agents", "skills", "verify-change", "SKILL.md"))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, ".claude", "skills", "verify-change", "SKILL.md"))).toBe(true);
    }, 30_000);
});
