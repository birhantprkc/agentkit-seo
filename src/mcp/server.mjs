import process from "node:process";

import { listMcpResources, readMcpResource } from "./resources.mjs";
import { callMcpTool, listMcpTools } from "./tools.mjs";
import { getMcpPrompt, listMcpPrompts } from "./prompts.mjs";
import { McpProtocolError } from "./errors.mjs";

const PROTOCOL_VERSION = "2024-11-05";
const MAX_MESSAGE_BYTES = 10_000_000;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function mcpServerOptions(flags = {}) {
  const allowed = new Set(["context", "context-path", "root", "vitaegraph"]);
  const unknown = Object.keys(flags).find((flag) => !allowed.has(flag));
  if (unknown) throw new Error(`Unknown MCP flag: --${unknown}`);
  if (flags.context && flags["context-path"]) {
    throw new Error("Use only one of --context or --context-path");
  }
  if (flags.root && flags.vitaegraph) {
    throw new Error("Use only one of --root or --vitaegraph");
  }
  return {
    contextPath: flags.context || flags["context-path"],
    vitaegraphRoot: flags.root || flags.vitaegraph
  };
}

function sendJsonRpcResponse(id, result) {
  const response = {
    jsonrpc: "2.0",
    id,
    result
  };
  const body = JSON.stringify(response);
  process.stdout.write(`${body}\n`);
}

function sendJsonRpcError(id, code, message, data = undefined) {
  const response = {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {})
    }
  };
  const body = JSON.stringify(response);
  process.stdout.write(`${body}\n`);
}

export async function handleMcpRequest(request, repoRoot, config, options = {}) {
  if (
    !request ||
    !isObject(request) ||
    request.jsonrpc !== "2.0" ||
    typeof request.method !== "string"
  ) {
    sendJsonRpcError(null, -32600, "Invalid Request");
    return;
  }

  const { id, method, params } = request;

  // JSON-RPC notifications omit id. A present null id still receives a response.
  if (!Object.hasOwn(request, "id")) {
    if (method === "notifications/initialized") {
      return;
    }
    return;
  }

  if (id !== null && typeof id !== "string" && typeof id !== "number") {
    sendJsonRpcError(null, -32600, "Invalid Request");
    return;
  }

  if (params !== undefined && !isObject(params)) {
    sendJsonRpcError(id, -32602, "Invalid params: expected an object");
    return;
  }

  try {
    switch (method) {
      case "initialize": {
        if (
          typeof params?.protocolVersion !== "string" ||
          !isObject(params.capabilities) ||
          !isObject(params.clientInfo) ||
          typeof params.clientInfo.name !== "string" ||
          typeof params.clientInfo.version !== "string"
        ) {
          throw new McpProtocolError(-32602, "initialize requires protocolVersion, capabilities, and clientInfo");
        }
        sendJsonRpcResponse(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            resources: { listChanged: false },
            tools: { listChanged: false },
            prompts: { listChanged: false }
          },
          serverInfo: {
            name: config.package?.name ?? "vitaecontext",
            version: config.package?.version ?? "unknown"
          }
        });
        break;
      }

      case "ping": {
        sendJsonRpcResponse(id, {});
        break;
      }

      case "resources/list": {
        const result = listMcpResources(repoRoot, config, options);
        sendJsonRpcResponse(id, { resources: result.resources });
        break;
      }

      case "resources/read": {
        if (typeof params?.uri !== "string" || !params.uri) {
          throw new McpProtocolError(-32602, "resources/read requires a non-empty uri string");
        }
        const result = readMcpResource(params.uri, repoRoot, config, options);
        sendJsonRpcResponse(id, result);
        break;
      }

      case "resources/templates/list": {
        sendJsonRpcResponse(id, {
          resourceTemplates: [
            {
              uriTemplate: "vitaegraph://record/{id}",
              name: "VitaeGraph Record",
              description: "Read a specific VitaeGraph record Markdown by ID.",
              mimeType: "text/markdown"
            },
            {
              uriTemplate: "vitaecontext://wiki/{module}",
              name: "VitaeContext Module Wiki",
              description: "Read platform rules and wiki knowledge by module.",
              mimeType: "text/markdown"
            }
          ]
        });
        break;
      }

      case "tools/list": {
        const result = listMcpTools();
        sendJsonRpcResponse(id, result);
        break;
      }

      case "tools/call": {
        if (typeof params?.name !== "string" || !params.name) {
          throw new McpProtocolError(-32602, "tools/call requires a non-empty tool name");
        }
        const result = await callMcpTool(params.name, params.arguments ?? {}, repoRoot, config, options);
        sendJsonRpcResponse(id, result);
        break;
      }

      case "prompts/list": {
        const result = listMcpPrompts();
        sendJsonRpcResponse(id, result);
        break;
      }

      case "prompts/get": {
        if (typeof params?.name !== "string" || !params.name) {
          throw new McpProtocolError(-32602, "prompts/get requires a non-empty prompt name");
        }
        const result = getMcpPrompt(params.name, params.arguments ?? {}, repoRoot, config, options);
        sendJsonRpcResponse(id, result);
        break;
      }

      default: {
        sendJsonRpcError(id, -32601, `Method not found: ${method}`);
        break;
      }
    }
  } catch (error) {
    if (error instanceof McpProtocolError) {
      sendJsonRpcError(id, error.code, error.message, error.data);
      return;
    }
    process.stderr.write(`MCP server error: ${error.message}\n`);
    sendJsonRpcError(id, -32603, "Internal error");
  }
}

export function startMcpStdioServer(repoRoot, config, options = {}) {
  let buffer = "";
  let processing = Promise.resolve();

  process.stdin.setEncoding("utf8");

  const enqueue = (request) => {
    processing = processing
      .then(() => handleMcpRequest(request, repoRoot, config, options))
      .catch((error) => {
        process.stderr.write(`MCP server fatal request error: ${error.message}\n`);
      });
  };

  process.stdin.on("data", (chunk) => {
    buffer += chunk;

    while (buffer.length > 0) {
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex === -1) {
        if (Buffer.byteLength(buffer, "utf8") > MAX_MESSAGE_BYTES) {
          buffer = "";
          sendJsonRpcError(null, -32700, "Parse error: message exceeds 10 MB limit");
        }
        break;
      }

      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (!line) continue;
      if (Buffer.byteLength(line, "utf8") > MAX_MESSAGE_BYTES) {
        sendJsonRpcError(null, -32700, "Parse error: message exceeds 10 MB limit");
        continue;
      }

      try {
        enqueue(JSON.parse(line));
      } catch {
        sendJsonRpcError(null, -32700, "Parse error");
      }
    }
  });

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}
