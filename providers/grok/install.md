# xAI Grok adapter

## Preferred install target

Install the shared skills into:

- `.grok/skills/` for project-local use
- `~/.grok/skills/` for personal global use
- Or configure the stateless MCP server (`npx -y vitaecontext mcp` or the installed `vitaecontext mcp`) in your Grok tool or developer environment.

Copy the self-contained shared skill runtime files, including `SKILL.md`, `references/`, and `wiki/`.

## Source-first workflow

The canonical source of truth lives in `skills/`, while xAI Grok adapter definitions live in `providers/grok/`.

If you want a Grok-ready layout installed globally from the published package, use:

```bash
npx vitaecontext install --provider grok
```

From a local checkout, use:

```bash
node bin/vitaecontext.mjs install --provider grok
```

This installs the shared skills into:

- `~/.grok/skills/`

If you want a layout installed directly into a project workspace, pass `--project-root`:

```bash
node bin/vitaecontext.mjs install \
  --provider grok \
  --project-root .
```

This installs the skills into `.grok/skills/`.
