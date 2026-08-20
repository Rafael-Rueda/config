function option(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}
const status = option("--status") ?? "in-progress";
if (!["complete", "in-progress", "blocked"].includes(status)) {
    console.error("Status must be complete, in-progress, or blocked.");
    process.exit(1);
}
console.log(
    JSON.stringify(
        {
            status,
            summary: option("--summary") ?? "",
            next: option("--next") ?? "",
            generatedAt: new Date().toISOString(),
        },
        null,
        4,
    ),
);
