# Cursor adapter

## Preferred install target

Install the shared skills and rules into:

- `.cursor/rules/` for project-local Cursor rules (`.mdc` or Markdown)
- `~/.cursor/rules/` for personal global Cursor rules
- Or configure the stateless MCP server (`npx -y vitaecontext-mcp` or `vitaecontext mcp`) in Cursor's MCP Settings.

Copy the self-contained shared skill runtime files, including `SKILL.md`, `references/`, and `wiki/`.

## Source-first workflow

The canonical source of truth lives in `skills/`, while Cursor adapter definitions live in `providers/cursor/`.

If you want a Cursor-ready layout installed globally from the published package, use:

```bash
npx vitaecontext install --provider cursor
```

From a local checkout, use:

```bash
node bin/vitaecontext.mjs install --provider cursor
```

This installs the shared skills into:

- `~/.cursor/skills/`

If you want a Cursor-ready layout installed directly into a project workspace, pass `--project-root`:

```bash
node bin/vitaecontext.mjs install \
  --provider cursor \
  --project-root .
```

This installs the skills into `.cursor/skills/`.

## MCP integration in Cursor

To enable seamless, workspace-agnostic access to your Career Context and VitaeGraph in Cursor:

1. Open Cursor Settings -> **Features** -> **MCP Servers**.
2. Click **+ Add new MCP server**.
3. Name: `vitaecontext`
4. Type: `command`
5. Command: `npx -y vitaecontext-mcp`
