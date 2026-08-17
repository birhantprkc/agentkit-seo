import process from "node:process";
import readline from "node:readline";

import { listMcpResources, readMcpResource } from "./resources.mjs";
import { callMcpTool, listMcpTools } from "./tools.mjs";
import { getMcpPrompt, listMcpPrompts } from "./prompts.mjs";

const PROTOCOL_VERSION = "2024-11-05";

function sendJsonRpcResponse(id, result) {
  const response = {
    jsonrpc: "2.0",
    id,
    result
  };
  const body = JSON.stringify(response);
  process.stdout.write(`${body}\n`);
}

function sendJsonRpcError(id, code, message, data = null) {
  const response = {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data ? { data } : {})
    }
  };
  const body = JSON.stringify(response);
  process.stdout.write(`${body}\n`);
}

export async function handleMcpRequest(request, repoRoot, config, options = {}) {
  if (!request || typeof request !== "object") {
    sendJsonRpcError(null, -32600, "Invalid Request");
    return;
  }

  const { id, method, params } = request;

  // Handle notifications (no id)
  if (id === undefined || id === null) {
    if (method === "notifications/initialized") {
      // Client confirmed initialization
      return;
    }
    // Unknown notification, ignore
    return;
  }

  try {
    switch (method) {
      case "initialize": {
        sendJsonRpcResponse(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            resources: { listChanged: false },
            tools: { listChanged: false },
            prompts: { listChanged: false }
          },
          serverInfo: {
            name: config.package?.name ?? "vitaecontext",
            version: config.package?.version ?? "2.2.0"
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
        if (!params?.uri) {
          sendJsonRpcError(id, -32602, "Missing uri parameter in resources/read");
          return;
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
        if (!params?.name) {
          sendJsonRpcError(id, -32602, "Missing tool name parameter in tools/call");
          return;
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
        if (!params?.name) {
          sendJsonRpcError(id, -32602, "Missing prompt name parameter in prompts/get");
          return;
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
  } catch (err) {
    sendJsonRpcError(id, -32603, `Internal error: ${err.message}`);
  }
}

export function startMcpStdioServer(repoRoot, config, options = {}) {
  let buffer = "";

  process.stdin.setEncoding("utf8");

  process.stdin.on("data", async (chunk) => {
    buffer += chunk;

    // Handle Content-Length header or newline-delimited framing
    while (buffer.length > 0) {
      // Check for Content-Length framing
      if (buffer.startsWith("Content-Length:")) {
        const headerEndIndex = buffer.indexOf("\r\n\r\n");
        if (headerEndIndex === -1) break; // Incomplete header

        const lengthMatch = buffer.slice(0, headerEndIndex).match(/Content-Length:\s*(\d+)/i);
        if (!lengthMatch) {
          buffer = buffer.slice(headerEndIndex + 4);
          continue;
        }

        const contentLength = parseInt(lengthMatch[1], 10);
        const bodyStartIndex = headerEndIndex + 4;

        if (buffer.length < bodyStartIndex + contentLength) break; // Incomplete body

        const jsonString = buffer.slice(bodyStartIndex, bodyStartIndex + contentLength);
        buffer = buffer.slice(bodyStartIndex + contentLength);

        try {
          const request = JSON.parse(jsonString);
          await handleMcpRequest(request, repoRoot, config, options);
        } catch {
          sendJsonRpcError(null, -32700, "Parse error");
        }
        continue;
      }

      // Check for newline-delimited framing
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex === -1) break; // Incomplete line

      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (!line) continue;

      try {
        const request = JSON.parse(line);
        await handleMcpRequest(request, repoRoot, config, options);
      } catch {
        sendJsonRpcError(null, -32700, "Parse error");
      }
    }
  });

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}
