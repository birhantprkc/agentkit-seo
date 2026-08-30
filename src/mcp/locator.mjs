import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { expandUserPath } from "../filesystem.mjs";

function isFile(target) {
  try {
    return fs.statSync(target).isFile();
  } catch {
    return false;
  }
}

function isDirectory(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

export function findDefaultCareerContext(customPath = null, repoRoot = null, homeDirectory = os.homedir()) {
  if (customPath) {
    const resolved = path.resolve(expandUserPath(customPath));
    return {
      path: resolved,
      source: "explicit",
      exists: isFile(resolved)
    };
  }

  if (process.env.VITAECONTEXT_CAREER_CONTEXT) {
    const resolved = path.resolve(expandUserPath(process.env.VITAECONTEXT_CAREER_CONTEXT));
    return {
      path: resolved,
      source: "env",
      exists: isFile(resolved)
    };
  }

  const defaultDir = path.join(homeDirectory, ".vitaecontext");
  if (isDirectory(defaultDir)) {
    const entries = fs.readdirSync(defaultDir, { withFileTypes: true });
    const matches = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter(
      (entry) =>
        entry.endsWith("-career-context.md") ||
        entry === "career-context.md" ||
        entry.endsWith(".context.md")
      )
      .sort((a, b) => a.localeCompare(b));
    const canonical = matches.find((entry) => entry === "career-context.md");
    if (canonical || matches.length === 1) {
      const selected = path.join(defaultDir, canonical ?? matches[0]);
      return {
        path: selected,
        source: "default_directory",
        exists: true
      };
    }
    if (matches.length > 1) {
      return {
        path: null,
        source: "ambiguous_default_directory",
        exists: false,
        candidates: matches.map((entry) => path.join(defaultDir, entry))
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
      exists: isDirectory(resolved)
    };
  }

  if (process.env.VITAEGRAPH_ROOT) {
    const resolved = path.resolve(expandUserPath(process.env.VITAEGRAPH_ROOT));
    return {
      root: resolved,
      source: "env",
      exists: isDirectory(resolved)
    };
  }

  const defaultDir = path.join(os.homedir(), ".vitaecontext", "vitaegraph");
  if (isDirectory(defaultDir)) {
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
