<p align="center">
  <strong>Stateless Model Context Protocol server for cross-repository career context.</strong>
</p>

<p align="center">Connect your private Career Context and VitaeGraph to AI coding assistants across any project workspace without copying career files or pasting private notes into chats.</p>

<p align="center">
  <a href="#protocol-conformance"><img src="https://img.shields.io/badge/protocol-2024--11--05-0EA5E9?style=flat-square" alt="MCP Version" /></a>
  <a href="#quick-start"><img src="https://img.shields.io/badge/transport-stdio_JSON--RPC_2.0-111827?style=flat-square" alt="Transport" /></a>
  <a href="#privacy-and-workspace-isolation"><img src="https://img.shields.io/badge/privacy-local_first-059669?style=flat-square" alt="Local-first privacy" /></a>
  <a href="#protocol-conformance"><img src="https://img.shields.io/badge/dependencies-0_external-2563EB?style=flat-square" alt="Zero dependencies" /></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/vitaecontext/vitaecontext?style=flat-square&label=license" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#why-mcp-for-career-context">Why</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#quick-start">Quick start</a> •
  <a href="#client-configurations">Client setup</a> •
  <a href="#capabilities">Capabilities</a> •
  <a href="#how-to-test-the-mcp-server">Testing guide</a> •
  <a href="#privacy-and-workspace-isolation">Privacy</a>
</p>

---

# VitaeContext MCP Server

The VitaeContext Model Context Protocol (MCP) server provides a stateless bridge between AI coding assistants and a user's private career source of truth.

By registering the VitaeContext MCP server in your AI coding tool, agents in **any** project workspace can immediately query your private Career Context and VitaeGraph without needing to copy files into the repository or paste career notes into the chat.

---

## Why MCP for Career Context

When working across multiple repositories, developer agents frequently need career facts—such as writing repository profile READMEs, drafting portfolio entries, preparing release bios, or updating professional docs.

<p align="center">
  <img src="../.assets/image/public-visuals/mcp/mcp-workflow.png" alt="VitaeContext MCP Architecture: Stateless bridge between developer coding workspaces and private career context" width="100%" />
</p>

### Key Advantages

1. **Zero Workspace Pollution**: No career files or personal context documents need to be copied into individual git repositories.
2. **Instant Cross-Project Grounding**: Any tool supporting MCP can query your career records on demand.
3. **Always Current**: Edits made to `~/.vitaecontext/career-context.md` or `~/.vitaecontext/vitaegraph/` are immediately reflected across all agent chats.
4. **Evidence-Bounded**: Exposes structured tools that summarize only verified context for the specific platform requested.
5. **Zero Runtime Dependencies**: Built with native Node.js ESM, ensuring lightning-fast startup and execution via `npx -y vitaecontext-mcp`.

---

## Quick Start

### Direct Execution

Run the server over standard input/output (stdio JSON-RPC 2.0):

```bash
# Using npx (standalone runner, zero pre-installation)
npx -y vitaecontext-mcp

# Or via the vitaecontext CLI
npx -y vitaecontext mcp
```

### Protocol Conformance

| Parameter | Specification |
| --- | --- |
| **Protocol Version** | `2024-11-05` |
| **Transport** | `stdio` (JSON-RPC 2.0 with newline-delimited framing and Content-Length header tolerance) |
| **Runtime Requirements** | Node.js `>= 18.0.0` |
| **Dependencies** | `0` external runtime dependencies (pure native ESM) |
| **Discovery Paths** | `~/.vitaecontext/*-career-context.md`, `~/.vitaecontext/career-context.md`, `~/.vitaecontext/vitaegraph/` |

---

## Client Configurations

### Claude Desktop

Add to your `claude_desktop_config.json`:
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux**: `~/.config/Claude/claude_desktop_config.json`

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

### Claude Code

Add the server using the native Claude Code MCP command:

```bash
claude mcp add vitaecontext -- npx -y vitaecontext-mcp
```

### Cursor IDE

1. Open Cursor **Settings** (`Cmd+,` or `Ctrl+,`).
2. Navigate to **Features** -> **MCP Servers**.
3. Click **+ Add new MCP server**.
4. Configure:
   * **Name**: `vitaecontext`
   * **Type**: `command`
   * **Command**: `npx -y vitaecontext-mcp`

### Windsurf (Cascade)

Add to your `~/.codeium/windsurf/mcp_config.json`:

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

### Roo Code / Cline

Add to your `cline_mcp_settings.json` or `roo_code_mcp_settings.json`:

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

### Antigravity CLI

Add to your `~/.gemini/antigravity-cli/mcp_config.json`:

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

### IBM Bob / watsonx Code Assistant

Add to your `.ibm/mcp_config.json`:

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

### xAI Grok

Add to your `.grok/mcp_config.json`:

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

---

## Capabilities

<p align="center">
  <img src="../.assets/image/public-visuals/mcp/mcp-capabilities.png" alt="VitaeContext MCP Capabilities: Structured resources, tools, and prompts for grounded AI work" width="100%" />
</p>

### Resources

| URI | Description | MIME Type |
| --- | --- | --- |
| `career-context://current` | Returns the user's private Career Context markdown from `~/.vitaecontext/`. | `text/markdown` |
| `vitaegraph://index` | Returns the indexed graph nodes JSON from `~/.vitaecontext/vitaegraph/.generated/graph.json`. | `application/json` |
| `vitaegraph://record/{id}` | Reads a specific record markdown by stable ID (e.g. `project:local-search-engine`). | `text/markdown` |
| `vitaecontext://wiki/{module}` | Reads the platform rules and constraint wiki for a module (e.g. `github`, `linkedin`, `cv`, `portfolio`, `x`). | `text/markdown` |

### Tools

#### 1. `get_career_context`
Retrieve verified, evidence-bounded Career Context formatted as a task packet for a specific professional surface.

```json
{
  "for": "github",
  "path": "/optional/custom/path/to/career-context.md"
}
```
* **Parameters**:
  * `for` (*string*, optional): `cv`, `github`, `linkedin`, `portfolio`, `x`, `general` (default: `general`).
  * `path` (*string*, optional): Explicit path to a Career Context file. If omitted, automatically resolves from `~/.vitaecontext/*.md`.

#### 2. `search_vitaegraph`
Query and filter structured career records in the user's private VitaeGraph.

```json
{
  "query": "distributed systems",
  "type": "project",
  "tag": "nodejs"
}
```
* **Parameters**:
  * `query` (*string*, optional): Keyword search matching title, organization, tags, and summary.
  * `type` (*string*, optional): Filter by record type (`experience`, `project`, `education`, `course`, `thesis`, `certification`, `award`, `publication`).
  * `tag` (*string*, optional): Filter by exact skill/topic tag.
  * `root` (*string*, optional): Path to VitaeGraph root directory (defaults to `~/.vitaecontext/vitaegraph`).

#### 3. `validate_career_context`
Validate a Career Context file for structural integrity, frontmatter, and unfinished placeholders.

```json
{
  "path": "/optional/custom/path/to/career-context.md"
}
```

### Prompts

| Prompt | Arguments | Description |
| --- | --- | --- |
| `cv_tailoring` | `targetRole` (required), `jobDescription` (optional) | Tailors a CV to a target role grounded strictly in verified Career Context evidence. |
| `linkedin_audit` | `profileSnapshot` (optional) | Audits a LinkedIn profile against discoverability rules and internal scorecards. |
| `github_showcase` | `focus` (optional) | Audits profile README and repository showcase strategy. |
| `career_context_intake` | `rawNotes` (optional) | Guides synthesizing raw career notes into a structured, verified Career Context file. |

---

## How to Test the MCP Server

### Method 1: Using the Official MCP Inspector (Interactive UI)

The official `@modelcontextprotocol/inspector` runs a visual web dashboard to interactively test tools, resources, and prompts:

```bash
# Launch the MCP inspector
npx @modelcontextprotocol/inspector npx -y vitaecontext-mcp
```

1. Open the URL displayed in the terminal (usually `http://localhost:5173`).
2. Click **Connect** (Transport: `STDIO`).
3. Explore and test:
   * **Tools Tab**: Execute `get_career_context` with `{ "for": "github" }`.
   * **Resources Tab**: Read `career-context://current` or `vitaecontext://wiki/github`.
   * **Prompts Tab**: Render `cv_tailoring` with `{ "targetRole": "Lead Systems Architect" }`.

### Method 2: Command-Line `stdio` Piping

You can send standard JSON-RPC 2.0 payloads directly via stdin:

```bash
# 1. Initialize Handshake
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"tester","version":"1.0.0"}}}\n' | node bin/vitaecontext-mcp.mjs

# 2. List Available Tools
printf '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' | node bin/vitaecontext-mcp.mjs

# 3. Call get_career_context Tool
printf '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_career_context","arguments":{"for":"cv"}}}\n' | node bin/vitaecontext-mcp.mjs
```

### Method 3: Automated Test Suite

Run the built-in unit and integration test suite:

```bash
npm test
```

---

## Privacy and Workspace Isolation

The VitaeContext MCP server is designed around local-first privacy:

1. **Local Operations Only**: Reads files strictly from local paths (`~/.vitaecontext/`). No external servers, telemetry, or network connections are made.
2. **Zero Repository Pollution**: Private career files are never copied or written into individual project workspaces.
3. **Evidence-Bounded**: Platforms receive bounded task packets with explicit evidence labels, preventing agents from hallucinating experience.
4. **Stateless Runtime**: No background daemon, tokens, or persistent database state.

---

## Specification & Contract

For the formal JSON-RPC 2.0 schema contract, error codes, and transport details, see [schema/mcp-contract.md](./schema/mcp-contract.md).
