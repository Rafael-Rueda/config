---
name: verify-change
description: Discover and run the repository's existing lint, typecheck, test, and build commands after a code or configuration change.
---

# Verify change

Inspect the plan before running checks:

```sh
node .agents/skills/verify-change/scripts/verify.mjs
```

Run only commands already declared by the project:

```sh
node .agents/skills/verify-change/scripts/verify.mjs --run
```

Do not install packages, invent verification commands, publish, or mutate source files. Report skipped checks explicitly.
