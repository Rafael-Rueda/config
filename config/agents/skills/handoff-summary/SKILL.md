---
name: handoff-summary
description: Produce a concise provider-neutral completion or blocker payload when handing work to another agent or environment.
---

# Handoff summary

Run `node .agents/skills/handoff-summary/scripts/format.mjs --status complete --summary "..." --next "..."`.

Include verified results, modified files, remaining decisions, and whether work continues. Do not include credentials, prompts, private paths, or provider session state.
