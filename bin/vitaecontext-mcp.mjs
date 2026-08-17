#!/usr/bin/env node

import { parseFlags } from "../src/args.mjs";
import { loadConfig, repoRootFromScript } from "../src/config.mjs";
import { startMcpStdioServer } from "../src/mcp/server.mjs";

async function run() {
  const flags = parseFlags(process.argv.slice(2));
  const repoRoot = repoRootFromScript(import.meta.url);
  const config = loadConfig(repoRoot);

  startMcpStdioServer(repoRoot, config, {
    contextPath: flags.context || flags["context-path"],
    vitaegraphRoot: flags.root || flags.vitaegraph
  });
}

run().catch((error) => {
  console.error(`MCP server fatal error: ${error.message}`);
  process.exit(1);
});
