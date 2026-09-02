import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { repoRootFromScript } from "../src/config.mjs";

const repoRoot = repoRootFromScript(import.meta.url);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const fixture = path.join(
  repoRoot,
  "hub",
  "context-builder",
  "examples",
  "alex-morgan-fictional-career-context.md"
);

function requestFromInstalledBinary(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32"
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Timed out waiting for installed MCP binary. stderr: ${stderr}`));
    }, 10_000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      const newline = stdout.indexOf("\n");
      if (newline === -1) return;
      clearTimeout(timeout);
      child.kill();
      try {
        resolve(JSON.parse(stdout.slice(0, newline)));
      } catch (error) {
        reject(new Error(`Installed MCP binary returned invalid JSON: ${error.message}`));
      }
    });

    child.stdin.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "packed-package-test", version: "1.0.0" }
        }
      }) + "\n"
    );
  });
}

test("packed npm artifact installs both MCP entry points and starts over stdio", async (t) => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "vitaecontext-packed-mcp-"));
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));

  const packReport = JSON.parse(
    execFileSync(npmCommand, ["pack", "--json", "--pack-destination", workspace], {
      cwd: repoRoot,
      encoding: "utf8",
      shell: process.platform === "win32"
    })
  )[0];
  const tarball = path.join(workspace, packReport.filename);
  const installRoot = path.join(workspace, "installed");
  execFileSync(npmCommand, ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", installRoot, tarball], {
    cwd: workspace,
    stdio: "pipe",
    shell: process.platform === "win32"
  });

  const binDirectory = path.join(installRoot, "node_modules", ".bin");
  const installedPackage = JSON.parse(
    fs.readFileSync(path.join(installRoot, "node_modules", "vitaecontext", "package.json"), "utf8")
  );
  assert.equal(installedPackage.engines.node, ">=18.0.0");
  const suffix = process.platform === "win32" ? ".cmd" : "";
  const cli = path.join(binDirectory, `vitaecontext${suffix}`);
  const standalone = path.join(binDirectory, `vitaecontext-mcp${suffix}`);
  assert.equal(fs.existsSync(cli), true);
  assert.equal(fs.existsSync(standalone), true);

  const cliResponse = await requestFromInstalledBinary(cli, ["mcp", "--context", fixture]);
  assert.equal(cliResponse.result.serverInfo.name, "vitaecontext");
  assert.equal(cliResponse.result.serverInfo.version, packReport.version);

  const standaloneResponse = await requestFromInstalledBinary(standalone, ["--context", fixture]);
  assert.equal(standaloneResponse.result.protocolVersion, "2024-11-05");
});
