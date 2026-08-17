import assert from "node:assert/strict";
import path from "node:path";
import { spawn } from "node:child_process";
import { test } from "node:test";

import { handleMcpRequest } from "../src/mcp/server.mjs";
import { listMcpResources, readMcpResource } from "../src/mcp/resources.mjs";
import { callMcpTool, listMcpTools } from "../src/mcp/tools.mjs";
import { getMcpPrompt, listMcpPrompts } from "../src/mcp/prompts.mjs";
import { findDefaultCareerContext, resolveDefaultVitaeGraph } from "../src/mcp/locator.mjs";
import { loadConfig, repoRootFromScript } from "../src/config.mjs";

const repoRoot = repoRootFromScript(import.meta.url);
const config = loadConfig(repoRoot);
const fictionalContextPath = path.join(
  repoRoot,
  "hub",
  "context-builder",
  "examples",
  "alex-morgan-fictional-career-context.md"
);

test("locator resolves custom explicit path", () => {
  const result = findDefaultCareerContext(fictionalContextPath, repoRoot);
  assert.equal(result.exists, true);
  assert.equal(result.path, fictionalContextPath);
  assert.equal(result.source, "explicit");
});

test("listMcpResources lists standard URIs and wikis", () => {
  const { resources } = listMcpResources(repoRoot, config, { contextPath: fictionalContextPath });
  const uris = resources.map((r) => r.uri);
  assert.ok(uris.includes("career-context://current"));
  assert.ok(uris.includes("vitaegraph://index"));
  assert.ok(uris.includes("vitaecontext://wiki/vitaecontext-cv"));
  assert.ok(uris.includes("vitaecontext://wiki/vitaecontext-linkedin"));
});

test("readMcpResource reads wiki entries and career context", () => {
  const wikiResult = readMcpResource("vitaecontext://wiki/cv", repoRoot, config);
  assert.equal(wikiResult.contents.length, 1);
  assert.ok(wikiResult.contents[0].text.length > 50);

  const contextResult = readMcpResource("career-context://current", repoRoot, config, {
    contextPath: fictionalContextPath
  });
  assert.equal(contextResult.contents.length, 1);
  assert.ok(contextResult.contents[0].text.includes("Alex Morgan"));
});

test("listMcpTools and callMcpTool execute get_career_context", async () => {
  const { tools } = listMcpTools();
  const names = tools.map((t) => t.name);
  assert.ok(names.includes("get_career_context"));
  assert.ok(names.includes("search_vitaegraph"));
  assert.ok(names.includes("validate_career_context"));

  const toolResult = await callMcpTool(
    "get_career_context",
    { for: "cv", path: fictionalContextPath },
    repoRoot,
    config
  );
  assert.equal(toolResult.isError, undefined);
  assert.ok(toolResult.content[0].text.includes("Career Context packet - cv"));
  assert.ok(toolResult.content[0].text.includes("Alex Morgan"));
});

test("callMcpTool validates career context", async () => {
  const valResult = await callMcpTool(
    "validate_career_context",
    { path: fictionalContextPath },
    repoRoot,
    config
  );
  assert.equal(valResult.isError, undefined);
  const data = JSON.parse(valResult.content[0].text);
  assert.equal(data.valid, true);
  assert.ok(data.sections.length > 3);
});

test("listMcpPrompts and getMcpPrompt render valid prompts", () => {
  const { prompts } = listMcpPrompts();
  const names = prompts.map((p) => p.name);
  assert.ok(names.includes("cv_tailoring"));
  assert.ok(names.includes("linkedin_audit"));

  const promptResult = getMcpPrompt(
    "cv_tailoring",
    { targetRole: "Staff Backend Engineer" },
    repoRoot,
    config,
    { contextPath: fictionalContextPath }
  );
  assert.equal(promptResult.messages.length, 1);
  assert.ok(promptResult.messages[0].content.text.includes("Staff Backend Engineer"));
});

test("mcp server binary executes live over stdio json-rpc 2.0 stream", async () => {
  const serverPath = path.join(repoRoot, "bin", "vitaecontext-mcp.mjs");
  const child = spawn(process.execPath, [serverPath], {
    stdio: ["pipe", "pipe", "inherit"]
  });

  let buffer = "";
  const responses = [];

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (data) => {
    buffer += data;
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.trim()) {
        responses.push(JSON.parse(line));
      }
    }
  });

  child.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } }
    }) + "\n"
  );

  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) + "\n");
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 3, method: "resources/list", params: {} }) + "\n");

  await new Promise((resolve) => setTimeout(resolve, 300));
  child.kill();

  assert.equal(responses.length, 3);
  const r1 = responses.find((r) => r.id === 1);
  assert.equal(r1.result.protocolVersion, "2024-11-05");
  assert.equal(r1.result.serverInfo.name, "vitaecontext");

  const r2 = responses.find((r) => r.id === 2);
  assert.ok(r2.result.tools.some((t) => t.name === "get_career_context"));

  const r3 = responses.find((r) => r.id === 3);
  assert.ok(r3.result.resources.length >= 10);
});
