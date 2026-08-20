import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "package.json");
if (!fs.existsSync(manifestPath)) {
    console.error("No package.json found.");
    process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const order = ["lint", "typecheck", "test", "build"];
const packageManager = fs.existsSync(path.join(root, "pnpm-lock.yaml"))
    ? "pnpm"
    : fs.existsSync(path.join(root, "yarn.lock"))
      ? "yarn"
      : "npm";
const commands = order
    .filter((name) => manifest.scripts?.[name])
    .map((name) => ({ name, command: packageManager === "npm" ? `npm run ${name}` : `${packageManager} ${name}` }));
const result = { packageManager, commands, skipped: order.filter((name) => !manifest.scripts?.[name]), results: [] };
if (process.argv.includes("--run")) {
    for (const check of commands) {
        const executable = packageManager;
        const args = packageManager === "npm" ? ["run", check.name] : [check.name];
        const execution = spawnSync(executable, args, {
            cwd: root,
            env: { ...process.env, CI: "1" },
            stdio: "inherit",
            shell: process.platform === "win32",
        });
        result.results.push({ name: check.name, status: execution.status ?? 1 });
        if (execution.status !== 0) break;
    }
}
console.log(JSON.stringify(result, null, 4));
process.exitCode = result.results.some(({ status }) => status !== 0) ? 1 : 0;
