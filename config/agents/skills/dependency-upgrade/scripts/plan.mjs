import { spawnSync } from "node:child_process";
import fs from "node:fs";

if (!fs.existsSync("package.json")) {
    console.error("No package.json found.");
    process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));
const report = {
    engines: manifest.engines ?? {},
    dependencies: manifest.dependencies ?? {},
    devDependencies: manifest.devDependencies ?? {},
};
if (process.argv.includes("--online")) {
    const result = spawnSync("npm", ["outdated", "--json"], { encoding: "utf8", shell: process.platform === "win32" });
    report.outdated = result.stdout.trim() ? JSON.parse(result.stdout) : {};
    report.registryStatus = result.status;
}
console.log(JSON.stringify(report, null, 4));
