# Windsurf adapter

## Preferred install target

Install the shared skills and rules into:

- `.windsurf/skills/` or `.windsurfrules` for project-local Cascade workflows
- `~/.codeium/windsurf/skills/` for personal global use
- Or configure the stateless MCP server (`npx -y vitaecontext-mcp` or `vitaecontext mcp`) in Windsurf's `mcp_config.json`.

Copy the self-contained shared skill runtime files, including `SKILL.md`, `references/`, and `wiki/`.

## Source-first workflow

The canonical source of truth lives in `skills/`, while Windsurf adapter definitions live in `providers/windsurf/`.

If you want a Windsurf-ready layout installed globally from the published package, use:

```bash
npx vitaecontext install --provider windsurf
```

From a local checkout, use:

```bash
node bin/vitaecontext.mjs install --provider windsurf
```

This installs the shared skills into:

- `~/.codeium/windsurf/skills/`

If you want a Windsurf-ready layout installed directly into a project workspace, pass `--project-root`:

```bash
node bin/vitaecontext.mjs install \
  --provider windsurf \
  --project-root .
```

This installs the skills into `.windsurf/skills/`.

## MCP integration in Windsurf

To enable seamless, workspace-agnostic access to your Career Context and VitaeGraph in Windsurf Cascade:

Add the server to your `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "vitaecontext": {
      "command": "npx",
      "args": ["-y", "vitaecontext-mcp"]
    }
  }
}
```
