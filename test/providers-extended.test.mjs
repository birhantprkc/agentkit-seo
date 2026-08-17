import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { loadConfig, repoRootFromScript } from "../src/config.mjs";
import { installProvider } from "../src/install.mjs";
import { uninstallProvider } from "../src/uninstall.mjs";

const repoRoot = repoRootFromScript(import.meta.url);
const config = loadConfig(repoRoot);

test("installs and uninstalls cursor provider", () => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "cursor-install-"));
  installProvider(repoRoot, "cursor", config, { "target-dir": targetDir, force: true });

  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-cv")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-install.json")), true);

  uninstallProvider(repoRoot, "cursor", config, { "target-dir": targetDir, force: true });
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext")), false);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-install.json")), false);
});

test("installs and uninstalls windsurf provider", () => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "windsurf-install-"));
  installProvider(repoRoot, "windsurf", config, { "target-dir": targetDir, force: true });

  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-github")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-install.json")), true);

  uninstallProvider(repoRoot, "windsurf", config, { "target-dir": targetDir, force: true });
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext")), false);
});

test("installs and uninstalls roo-code provider", () => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "roo-install-"));
  installProvider(repoRoot, "roo-code", config, { "target-dir": targetDir, force: true });

  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-linkedin")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-install.json")), true);

  uninstallProvider(repoRoot, "roo-code", config, { "target-dir": targetDir, force: true });
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-linkedin")), false);
});

test("installs and uninstalls ibm-bob provider", () => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "ibm-install-"));
  installProvider(repoRoot, "ibm-bob", config, { "target-dir": targetDir, force: true });

  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-portfolio")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-install.json")), true);

  uninstallProvider(repoRoot, "ibm-bob", config, { "target-dir": targetDir, force: true });
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-portfolio")), false);
});

test("installs and uninstalls grok provider", () => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "grok-install-"));
  installProvider(repoRoot, "grok", config, { "target-dir": targetDir, force: true });

  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-x")), true);
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-install.json")), true);

  uninstallProvider(repoRoot, "grok", config, { "target-dir": targetDir, force: true });
  assert.equal(fs.existsSync(path.join(targetDir, "vitaecontext-x")), false);
});
