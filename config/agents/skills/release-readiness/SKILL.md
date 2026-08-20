---
name: release-readiness
description: Check repository state and package contents before a release without committing, pushing, or publishing.
---

# Release readiness

Run `node .agents/skills/release-readiness/scripts/check.mjs`. Add `--pack` to run the package manager's dry-run pack command.

Treat a dirty worktree, failed verification, unexpected package contents, secrets, or generated personal agent files as blockers. Never commit, push, tag, or publish without explicit authorization.
