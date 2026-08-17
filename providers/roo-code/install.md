# Roo Code / Cline adapter

## Preferred install target

Install the shared skills into:

- `.roo/skills/` or `.clinerules` for project-local use
- `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/skills/` for personal global use
- Or configure the stateless MCP server (`npx -y vitaecontext-mcp` or `vitaecontext mcp`) in `cline_mcp_settings.json`.

Copy the self-contained shared skill runtime files, including `SKILL.md`, `references/`, and `wiki/`.

## Source-first workflow

The canonical source of truth lives in `skills/`, while Roo Code adapter definitions live in `providers/roo-code/`.

If you want a Roo Code-ready layout installed globally from the published package, use:

```bash
npx vitaecontext install --provider roo-code
```

From a local checkout, use:

```bash
node bin/vitaecontext.mjs install --provider roo-code
```

This installs the shared skills into:

- `~/.config/roo-code/skills/` (or platform equivalent)

If you want a layout installed directly into a project workspace, pass `--project-root`:

```bash
node bin/vitaecontext.mjs install \
  --provider roo-code \
  --project-root .
```

This installs the skills into `.roo/skills/`.

## MCP integration in Roo Code / Cline

Add the server to your `cline_mcp_settings.json`:

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
