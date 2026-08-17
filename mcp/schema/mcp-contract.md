# VitaeContext MCP Protocol Contract

Specification for the VitaeContext Model Context Protocol (MCP) server interface, adhering to version `2024-11-05`.

---

## 1. Lifecycle

### `initialize`
* **Request**:
  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "example-client", "version": "1.0.0" }
    }
  }
  ```
* **Response**:
  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
      "protocolVersion": "2024-11-05",
      "capabilities": {
        "resources": { "listChanged": false },
        "tools": { "listChanged": false },
        "prompts": { "listChanged": false }
      },
      "serverInfo": {
        "name": "vitaecontext",
        "version": "2.2.0"
      }
    }
  }
  ```

---

## 2. Resources

### `career-context://current`
* **MIME type**: `text/markdown`
* **Description**: Returns the active Career Context file located at `~/.vitaecontext/<name>-career-context.md`.

### `vitaegraph://index`
* **MIME type**: `application/json`
* **Description**: Returns the deterministic graph index from `~/.vitaecontext/vitaegraph/.generated/graph.json`.

### `vitaegraph://record/{id}`
* **MIME type**: `text/markdown`
* **Description**: Reads a specific domain record by ID.

### `vitaecontext://wiki/{module}`
* **MIME type**: `text/markdown`
* **Description**: Reads durable platform rules for a given module (`cv`, `github`, `linkedin`, `portfolio`, `x`, `vitaegraph`, `build`).

---

## 3. Tools

### `get_career_context`
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "for": {
        "type": "string",
        "enum": ["cv", "github", "linkedin", "portfolio", "x", "general"],
        "default": "general"
      },
      "path": {
        "type": "string"
      }
    }
  }
  ```

### `search_vitaegraph`
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "type": { "type": "string" },
      "tag": { "type": "string" },
      "root": { "type": "string" }
    }
  }
  ```

### `validate_career_context`
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "path": { "type": "string" }
    }
  }
  ```

---

## 4. Prompts

### `cv_tailoring`
* **Arguments**: `targetRole` (required), `jobDescription` (optional).
* **Returns**: ATS formatting instructions + grounded career context packet.

### `linkedin_audit`
* **Arguments**: `profileSnapshot` (optional).
* **Returns**: LinkedIn discoverability scoring + section-by-section audit instructions.

### `github_showcase`
* **Arguments**: `focus` (optional).
* **Returns**: Profile README and pinned repository showcase review.

### `career_context_intake`
* **Arguments**: `rawNotes` (optional).
* **Returns**: Step-by-step career context intake questionnaire and synthesis instructions.
