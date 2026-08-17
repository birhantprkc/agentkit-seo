import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { expandUserPath } from "../filesystem.mjs";

export function findDefaultCareerContext(customPath = null, repoRoot = null) {
  if (customPath) {
    const resolved = path.resolve(expandUserPath(customPath));
    return {
      path: resolved,
      source: "explicit",
      exists: fs.existsSync(resolved)
    };
  }

  if (process.env.VITAECONTEXT_CAREER_CONTEXT) {
    const resolved = path.resolve(expandUserPath(process.env.VITAECONTEXT_CAREER_CONTEXT));
    return {
      path: resolved,
      source: "env",
      exists: fs.existsSync(resolved)
    };
  }

  const defaultDir = path.join(os.homedir(), ".vitaecontext");
  if (fs.existsSync(defaultDir)) {
    const entries = fs.readdirSync(defaultDir);
    const matches = entries.filter(
      (entry) =>
        entry.endsWith("-career-context.md") ||
        entry === "career-context.md" ||
        entry.endsWith(".context.md")
    );
    if (matches.length > 0) {
      const selected = path.join(defaultDir, matches[0]);
      return {
        path: selected,
        source: "default_directory",
        exists: true
      };
    }
  }

  // Fallback to fictional public example if inside the repository and no private context is found
  if (repoRoot) {
    const fictionalExample = path.join(
      repoRoot,
      "hub",
      "context-builder",
      "examples",
      "alex-morgan-fictional-career-context.md"
    );
    if (fs.existsSync(fictionalExample)) {
      return {
        path: fictionalExample,
        source: "demo_example",
        exists: true
      };
    }
  }

  return {
    path: path.join(defaultDir, "career-context.md"),
    source: "default_directory",
    exists: false
  };
}

export function resolveDefaultVitaeGraph(customRoot = null, repoRoot = null) {
  if (customRoot) {
    const resolved = path.resolve(expandUserPath(customRoot));
    return {
      root: resolved,
      source: "explicit",
      exists: fs.existsSync(resolved)
    };
  }

  if (process.env.VITAEGRAPH_ROOT) {
    const resolved = path.resolve(expandUserPath(process.env.VITAEGRAPH_ROOT));
    return {
      root: resolved,
      source: "env",
      exists: fs.existsSync(resolved)
    };
  }

  const defaultDir = path.join(os.homedir(), ".vitaecontext", "vitaegraph");
  if (fs.existsSync(defaultDir)) {
    return {
      root: defaultDir,
      source: "default_directory",
      exists: true
    };
  }

  return {
    root: defaultDir,
    source: "default_directory",
    exists: false
  };
}
