---
name: dependency-upgrade
description: Plan safe dependency upgrades, including engines and available-version checks, without installing or modifying packages.
---

# Dependency upgrade

Run `node .agents/skills/dependency-upgrade/scripts/plan.mjs` for a local inventory. Add `--online` only when current registry information is needed and network access is allowed.

Review release notes, peer ranges, engine requirements, and migrations before changing a manifest or lockfile. Preserve public behavior and run the repository's own verification commands afterward. This skill never installs, publishes, or edits dependencies by itself.
