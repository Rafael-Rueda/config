import fs from "node:fs";

const biomePath = fs.existsSync("biome.json") ? "biome.json" : "config/linting/biome.json";
const eslintPath = fs.existsSync("eslint.config.js") ? "eslint.config.js" : "config/linting/eslint.config.js";
const report = {
    biomePath,
    eslintPath,
    present: { biome: fs.existsSync(biomePath), eslint: fs.existsSync(eslintPath) },
    notes: [],
};
if (report.present.biome) {
    const biome = JSON.parse(fs.readFileSync(biomePath, "utf8"));
    report.format = {
        indentStyle: biome.formatter?.indentStyle,
        indentWidth: biome.formatter?.indentWidth,
        quoteStyle: biome.javascript?.formatter?.quoteStyle,
    };
    report.tailwindClassSorting = biome.linter?.rules?.nursery?.useSortedClasses ?? null;
}
if (report.present.biome !== report.present.eslint)
    report.notes.push("Only one lint engine configuration is present; semantic parity cannot be audited.");
report.notes.push(
    "Recommended presets evolve independently; exact cross-engine parity requires an approved explicit allowlist.",
);
console.log(JSON.stringify(report, null, 4));
