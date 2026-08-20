# Capability-driven agent harness

## Implemented architecture

`@rueda.dev/config` now treats capabilities as the stable layer and providers as optional discovery adapters.

```text
config/agents/                         public and versioned
  capabilities.json                   providers, capabilities, routing hints
  schema.json                         schema for the private local manifest
  skills/<capability>/                canonical skill templates and scripts

.agents/                              generated locally and gitignored
  rueda.config.local.json             active profile, checksums, personal overrides
  skills/<capability>/                neutral materialized skills
.claude/skills/<capability>/           optional generated adapter copy
.cline/skills/<capability>/            optional generated adapter copy
```

Codex, Devin, and Gemini can discover `.agents/skills` directly. Claude Code and Cline receive portable checksum-tracked copies only when selected. This avoids symlink differences between Windows, cloud hosts, and standard CLI environments.

No provider is mandatory. With no detected/selected provider, `.agents/skills` still supports a neutral VS Code or CLI workflow. Codex and Devin are first-class choices in the catalog, not forced defaults. Claude Code, Gemini, and Cline remain optional. The manager detects installed commands in parallel but never installs or registers an external CLI.

## CLI and profiles

```sh
rueda-config init --providers codex,devin
rueda-config init --profile portable --providers cline,claude
rueda-config sync --dry-run
rueda-config sync
rueda-config profile portable
rueda-config doctor
rueda-config list
```

If `--providers` is omitted, `init` selects only detected CLIs. Every generated target and the local manifest are ignored before files are written. `sync` updates only content whose checksum still matches the last generated version; modified or unknown content is refused unless `--force` is explicit. It never removes stale profile files automatically.

Multiple named profiles can coexist in `.agents/rueda.config.local.json`. `modelOverrides` is available in that private manifest for manual provider choices, but the materializer does not claim to route tasks through APIs or credentials it does not control.

## Model routing policy

The public catalog provides two task hints:

- `routine`: use the provider's balanced/automatic selection.
- `complex`: use the user's higher-reasoning option for difficult coding and analysis.

These are selection hints, not automatic cross-provider routing. The user or active host chooses the provider/model, and a local `modelOverrides` entry may override it. Current portable mappings are:

| Previous fixed value | Current choice | Reason |
| --- | --- | --- |
| `claude-3-7-sonnet-20250219` | `claude-sonnet-5` | Taskmaster requires a concrete Anthropic model ID. |
| `claude-sonnet-4-5-20250929` | Claude Code alias `sonnet` | Claude Code documents `sonnet` as the alias for the latest Sonnet. |
| `gemini-2.5-pro` plus fixed sampling/output values | no project model override (`auto`) | Gemini CLI recommends Auto and defaults to it. |
| “GPT-5.6 Sol” | host preference only | It is a Codex/ChatGPT product choice when available, not a fabricated portable API ID. |

Claude Sonnet 5 has real API ID `claude-sonnet-5`. Because it rejects non-default sampling parameters, provider-neutral profiles do not add `temperature`, `top_p`, or `top_k`.

## Privacy and compatibility

The repository keeps only schemas, catalogs, documentation, and generic skill templates public. The following local layers are ignored: `.agents`, `.codex`, `.devin`, `.claude`, `.cline`, `.clinerules`, `.gemini`, `.taskmaster`, root/local MCP files, and VS Code MCP files. Credentials, personal prompts, state, private skills, and model overrides belong only there.

The former tracked root `.mcp.json` is not required by the capability core. It has been removed from Git's index while its local ignored copy is preserved. Generic legacy templates under `config/code` remain public for compatibility; running the new agent profile commands does not materialize MCP configuration or require API keys.

`rueda-config setup` remains the interactive lint setup and now offers provider profiles. `npm run setup` retains legacy detected Gemini/Claude configuration for compatibility, then materializes shared skills. Existing lint exports are unchanged.

## MCP and ACP boundaries

MCP remains optional provider-local tooling. The profile manager does not start servers, store tokens, or generate a universal MCP file because providers use different formats. ACP means Agent Client Protocol in Devin's documented integration; it is an optional host transport, not the shared skill/configuration layer. No ACP client is installed or registered automatically.

## References

- [OpenAI: Build skills](https://developers.openai.com/codex/skills)
- [OpenAI: Codex models](https://developers.openai.com/codex/models)
- [OpenAI: GPT-5.6 in ChatGPT and Codex](https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt)
- [Anthropic: Claude Sonnet 5](https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-5)
- [Anthropic: Claude Code CLI model aliases](https://docs.anthropic.com/en/docs/claude-code/cli-usage)
- [Gemini CLI: model selection](https://geminicli.com/docs/cli/model/)
- [Devin CLI: skills](https://docs.devin.ai/cli/extensibility/skills/overview)
- [Cline: skills](https://docs.cline.bot/customization/skills)
