import fs from "node:fs";
import path from "node:path";

import { summarizeContext, writeContextSummary } from "../context/summary.mjs";
import { validateContextFile } from "../context/parse.mjs";
import { findDefaultCareerContext, resolveDefaultVitaeGraph } from "./locator.mjs";

export function listMcpTools() {
  return {
    tools: [
      {
        name: "get_career_context",
        description: "Retrieve verified, evidence-bounded Career Context formatted as a task packet for a specific professional surface (e.g. cv, github, linkedin, portfolio, x, general).",
        inputSchema: {
          type: "object",
          properties: {
            for: {
              type: "string",
              enum: ["cv", "github", "linkedin", "portfolio", "x", "general"],
              description: "Target platform or surface for the career context packet. Defaults to 'general'.",
              default: "general"
            },
            path: {
              type: "string",
              description: "Optional explicit path to a Career Context file. If omitted, the default ~/.vitaecontext/*.md is used."
            }
          },
          required: []
        }
      },
      {
        name: "search_vitaegraph",
        description: "Query and filter the user's private VitaeGraph structured career records (experience, degrees, courses, projects, awards, certs) by keyword, type, or tag.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search keywords to match against title, organization, tags, and summary."
            },
            type: {
              type: "string",
              enum: ["experience", "project", "education", "course", "thesis", "certification", "award", "publication"],
              description: "Filter by record type."
            },
            tag: {
              type: "string",
              description: "Filter by exact tag or skill."
            },
            root: {
              type: "string",
              description: "Optional explicit path to VitaeGraph root directory. Defaults to ~/.vitaecontext/vitaegraph."
            }
          },
          required: []
        }
      },
      {
        name: "validate_career_context",
        description: "Validate a Career Context file for structural integrity, YAML frontmatter, chronology consistency, and unfinished placeholders.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Optional path to the Career Context file. Defaults to ~/.vitaecontext/*.md."
            }
          },
          required: []
        }
      }
    ]
  };
}

export async function callMcpTool(name, args = {}, repoRoot = null, config = null, options = {}) {
  if (name === "get_career_context") {
    const surface = args.for ?? "general";
    const context = findDefaultCareerContext(args.path || options.contextPath, repoRoot);
    if (!context.exists) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Career Context file not found at ${context.path}. Create one using 'vitaecontext context init' or specify --path.`
          }
        ],
        isError: true
      };
    }

    try {
      const summary = summarizeContext(context.path, surface);
      return {
        content: [
          {
            type: "text",
            text: summary.content
          }
        ]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error generating career context summary: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "search_vitaegraph") {
    const graph = resolveDefaultVitaeGraph(args.root || options.vitaegraphRoot, repoRoot);
    const indexPath = path.join(graph.root, ".generated", "graph.json");
    if (!fs.existsSync(indexPath)) {
      return {
        content: [
          {
            type: "text",
            text: `Error: VitaeGraph index not found at ${indexPath}. Run 'vitaecontext graph index' to generate the graph index.`
          }
        ],
        isError: true
      };
    }

    try {
      const graphData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      let nodes = graphData.nodes ?? [];

      if (args.type) {
        nodes = nodes.filter((node) => node.type === args.type);
      }

      if (args.tag) {
        const queryTag = args.tag.toLowerCase();
        nodes = nodes.filter((node) =>
          Array.isArray(node.tags) && node.tags.some((t) => t.toLowerCase() === queryTag)
        );
      }

      if (args.query) {
        const q = args.query.toLowerCase();
        nodes = nodes.filter((node) => {
          const titleMatch = node.title?.toLowerCase().includes(q);
          const orgMatch = node.organization?.toLowerCase().includes(q);
          const summaryMatch = node.summary?.toLowerCase().includes(q);
          const roleMatch = node.role?.toLowerCase().includes(q);
          return Boolean(titleMatch || orgMatch || summaryMatch || roleMatch);
        });
      }

      const results = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        organization: n.organization || n.institution,
        period: n.period,
        tags: n.tags,
        summary: n.summary
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ matchCount: results.length, records: results }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error searching VitaeGraph: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "validate_career_context") {
    const context = findDefaultCareerContext(args.path || options.contextPath, repoRoot);
    if (!context.exists) {
      return {
        content: [{ type: "text", text: `Error: Career Context file not found at ${context.path}` }],
        isError: true
      };
    }

    try {
      const result = validateContextFile(context.path);
      const output = {
        valid: result.valid,
        path: result.path,
        errors: result.errors,
        warnings: result.warnings,
        sections: result.sections.map((s) => s.normalized)
      };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(output, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error validating career context: ${err.message}` }],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
}
