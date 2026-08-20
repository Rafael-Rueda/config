---
name: lint-alignment
description: Audit intentional Biome and ESLint rule parity while preserving formatting preferences and avoiding automatic rewrites.
---

# Lint alignment

Run `node .agents/skills/lint-alignment/scripts/check.mjs` from the repository root. Review `references/rule-map.md` before changing either configuration.

Treat formatter preferences separately from lint semantics. Do not reformat the project or change indentation, quotes, import grouping, or other style preferences without explicit approval.
