# IBM Bob / watsonx Code Assistant adapter

## Preferred install target

Install the shared skills into:

- `.ibm/skills/` for project-local use
- `~/.ibm/skills/` for personal global use
- Or configure the stateless MCP server (`npx -y vitaecontext-mcp` or `vitaecontext mcp`) in your IBM assistant / agent configuration.

Copy the self-contained shared skill runtime files, including `SKILL.md`, `references/`, and `wiki/`.

## Source-first workflow

The canonical source of truth lives in `skills/`, while IBM Bob adapter definitions live in `providers/ibm-bob/`.

If you want an IBM Bob-ready layout installed globally from the published package, use:

```bash
npx vitaecontext install --provider ibm-bob
```

From a local checkout, use:

```bash
node bin/vitaecontext.mjs install --provider ibm-bob
```

This installs the shared skills into:

- `~/.ibm/skills/`

If you want a layout installed directly into a project workspace, pass `--project-root`:

```bash
node bin/vitaecontext.mjs install \
  --provider ibm-bob \
  --project-root .
```

This installs the skills into `.ibm/skills/`.
