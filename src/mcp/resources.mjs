import fs from "node:fs";
import path from "node:path";

import { findDefaultCareerContext, resolveDefaultVitaeGraph } from "./locator.mjs";

export function listMcpResources(repoRoot, config, options = {}) {
  const context = findDefaultCareerContext(options.contextPath, repoRoot);
  const graph = resolveDefaultVitaeGraph(options.vitaegraphRoot, repoRoot);

  const resources = [
    {
      uri: "career-context://current",
      name: "Current Career Context",
      description: "The user's private, verified Career Context source of truth.",
      mimeType: "text/markdown"
    },
    {
      uri: "vitaegraph://index",
      name: "VitaeGraph Index",
      description: "Structured knowledge graph of experience, projects, education, and credentials.",
      mimeType: "application/json"
    }
  ];

  const modules = [
    "vitaecontext",
    "vitaecontext-build",
    "vitaecontext-cv",
    "vitaecontext-github",
    "vitaecontext-linkedin",
    "vitaecontext-portfolio",
    "vitaecontext-vitaegraph",
    "vitaecontext-x"
  ];

  for (const mod of modules) {
    resources.push({
      uri: `vitaecontext://wiki/${mod}`,
      name: `VitaeContext Wiki: ${mod}`,
      description: `Durable platform knowledge and constraint rules for ${mod}.`,
      mimeType: "text/markdown"
    });
  }

  return {
    resources,
    contextLocated: context.exists,
    graphLocated: graph.exists
  };
}

export function readMcpResource(uri, repoRoot, config, options = {}) {
  if (uri === "career-context://current") {
    const context = findDefaultCareerContext(options.contextPath, repoRoot);
    if (!context.exists) {
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: "# Career Context Not Found\n\nNo private Career Context file was found at `~/.vitaecontext/`. Run `npx vitaecontext context init` to create one."
          }
        ]
      };
    }
    const content = fs.readFileSync(context.path, "utf8");
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content
        }
      ]
    };
  }

  if (uri === "vitaegraph://index") {
    const graph = resolveDefaultVitaeGraph(options.vitaegraphRoot, repoRoot);
    const indexPath = path.join(graph.root, ".generated", "graph.json");
    if (!fs.existsSync(indexPath)) {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({
              error: "VitaeGraph index not found",
              root: graph.root,
              hint: "Run 'vitaecontext graph index' to generate the graph index."
            }, null, 2)
          }
        ]
      };
    }
    const content = fs.readFileSync(indexPath, "utf8");
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: content
        }
      ]
    };
  }

  if (uri.startsWith("vitaegraph://record/")) {
    const recordId = decodeURIComponent(uri.replace("vitaegraph://record/", ""));
    const graph = resolveDefaultVitaeGraph(options.vitaegraphRoot, repoRoot);
    // Find matching markdown file in graph directory
    const candidates = [
      path.join(graph.root, `${recordId}.md`),
      path.join(graph.root, `${recordId}`, "index.md"),
      path.join(graph.root, `${recordId}`)
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const text = fs.readFileSync(candidate, "utf8");
        return {
          contents: [{ uri, mimeType: "text/markdown", text }]
        };
      }
    }
    throw new Error(`VitaeGraph record '${recordId}' not found at ${graph.root}`);
  }

  if (uri.startsWith("vitaecontext://wiki/")) {
    const moduleName = uri.replace("vitaecontext://wiki/", "");
    const normalizedModule = moduleName.startsWith("vitaecontext-")
      ? moduleName
      : moduleName === "vitaecontext"
      ? "vitaecontext"
      : `vitaecontext-${moduleName}`;

    const wikiKnowledge = path.join(repoRoot, "skills", normalizedModule, "wiki", "knowledge.md");
    const wikiIndex = path.join(repoRoot, "skills", normalizedModule, "wiki", "index.md");
    const wikiRoot = path.join(repoRoot, "skills", normalizedModule, "wiki", "vitaecontext.md");

    const target = [wikiKnowledge, wikiIndex, wikiRoot].find((file) => fs.existsSync(file));
    if (!target) {
      throw new Error(`Wiki entry for module '${moduleName}' not found.`);
    }

    const text = fs.readFileSync(target, "utf8");
    return {
      contents: [{ uri, mimeType: "text/markdown", text }]
    };
  }

  throw new Error(`Unsupported resource URI: ${uri}`);
}
