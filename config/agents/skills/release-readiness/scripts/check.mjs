import { spawnSync } from "node:child_process";
import fs from "node:fs";

const git = spawnSync("git", ["status", "--short"], { encoding: "utf8" });
const report = { gitStatus: git.stdout.trim().split(/\r?\n/).filter(Boolean), package: null };
if (fs.existsSync("package.json")) {
    const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));
    report.package = { name: manifest.name, version: manifest.version, private: manifest.private === true };
}
if (process.argv.includes("--pack")) {
    const pack = spawnSync("npm", ["pack", "--dry-run", "--json"], {
        encoding: "utf8",
        shell: process.platform === "win32",
    });
    report.pack = {
        status: pack.status,
        output: pack.stdout.trim() ? JSON.parse(pack.stdout) : null,
        error: pack.stderr.trim() || null,
    };
}
console.log(JSON.stringify(report, null, 4));
process.exitCode = report.pack && report.pack.status !== 0 ? 1 : 0;
