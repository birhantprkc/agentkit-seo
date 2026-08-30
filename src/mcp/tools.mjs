import fs from "node:fs";
import path from "node:path";

import { summarizeContext } from "../context/summary.mjs";
import { validateContextFile } from "../context/parse.mjs";
import { invalidParams } from "./errors.mjs";
import { findDefaultCareerContext, resolveDefaultVitaeGraph } from "./locator.mjs";

const SURFACES = new Set(["cv", "github", "linkedin", "portfolio", "x", "general"]);
const RECORD_TYPES = new Set([
  "experience",
  "project",
  "education",
  "course",
  "thesis",
  "certification",
  "award",
  "publication"
]);

function missingContextMessage(context) {
  if (context.source === "ambiguous_default_directory") {
    return "Multiple Career Context files were found. Set VITAECONTEXT_CAREER_CONTEXT or start the server with --context <file>.";
  }
  return `Career Context file not found at ${context.path}. Create one using 'vitaecontext context init' or configure --context.`;
}

function validateOptionalString(args, name) {
  if (args[name] !== undefined && (typeof args[name] !== "string" || !args[name].trim())) {
    throw invalidParams(`Tool argument '${name}' must be a non-empty string.`);
  }
}

function excerpt(text, query) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const matchAt = query ? normalized.toLowerCase().indexOf(query.toLowerCase()) : 0;
  const start = Math.max(0, matchAt === -1 ? 0 : matchAt - 80);
  const value = normalized.slice(start, start + 320);
  return `${start > 0 ? "…" : ""}${value}${start + value.length < normalized.length ? "…" : ""}`;
}

export function listMcpTools() {
  return {
    tools: [
      {
        name: "get_career_context",
        description: "Retrieve a user-maintained, evidence-bounded Career Context packet for a specific professional surface (cv, github, linkedin, portfolio, x, or general). The server reads only the context selected at startup or through VITAECONTEXT_CAREER_CONTEXT.",
        inputSchema: {
          type: "object",
          properties: {
            for: {
              type: "string",
              enum: ["cv", "github", "linkedin", "portfolio", "x", "general"],
              description: "Target platform or surface for the career context packet. Defaults to 'general'.",
              default: "general"
            }
          },
          required: [],
          additionalProperties: false
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
              description: "Case-insensitive text to match against record ID, title, tags, and indexed record text."
            },
            type: {
              type: "string",
              enum: ["experience", "project", "education", "course", "thesis", "certification", "award", "publication"],
              description: "Filter by record type."
            },
            tag: {
              type: "string",
              description: "Filter by exact tag or skill."
            }
          },
          required: [],
          additionalProperties: false
        }
      },
      {
        name: "validate_career_context",
        description: "Validate a Career Context file for structural integrity, YAML frontmatter, chronology consistency, and unfinished placeholders.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false
        }
      }
    ]
  };
}

export async function callMcpTool(name, args = {}, repoRoot = null, config = null, options = {}) {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw invalidParams("Tool arguments must be an object.");
  }

  if (name === "get_career_context") {
    const surface = args.for ?? "general";
    if (!SURFACES.has(surface)) {
      throw invalidParams(`Unknown Career Context surface '${surface}'.`);
    }
    if (Object.keys(args).some((key) => key !== "for")) {
      throw invalidParams("get_career_context accepts only the 'for' argument. Configure file access when starting the server.");
    }
    const context = findDefaultCareerContext(options.contextPath, repoRoot);
    if (!context.exists) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${missingContextMessage(context)}`
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
    for (const key of Object.keys(args)) {
      if (!["query", "type", "tag"].includes(key)) {
        throw invalidParams(`Unknown search_vitaegraph argument '${key}'. Configure graph access when starting the server.`);
      }
    }
    for (const key of ["query", "type", "tag"]) validateOptionalString(args, key);
    if (args.type && !RECORD_TYPES.has(args.type.toLowerCase())) {
      throw invalidParams(`Unknown VitaeGraph record type '${args.type}'.`);
    }

    const graph = resolveDefaultVitaeGraph(options.vitaegraphRoot, repoRoot);
    const indexPath = path.join(graph.root, ".generated", "search-index.json");
    if (!fs.existsSync(indexPath)) {
      return {
        content: [
          {
            type: "text",
            text: `Error: VitaeGraph search index not found at ${indexPath}. Run 'vitaecontext graph index' to generate it.`
          }
        ],
        isError: true
      };
    }

    try {
      const searchData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      let documents = searchData.documents ?? [];

      if (args.type) {
        const type = args.type.toLowerCase();
        documents = documents.filter((document) => document.type?.toLowerCase() === type);
      }

      if (args.tag) {
        const queryTag = args.tag.toLowerCase();
        documents = documents.filter((document) =>
          Array.isArray(document.tags) && document.tags.some((tag) => tag.toLowerCase() === queryTag)
        );
      }

      if (args.query) {
        const q = args.query.toLowerCase();
        documents = documents.filter((document) =>
          [document.id, document.title, document.text, ...(document.tags ?? [])]
            .some((value) => String(value ?? "").toLowerCase().includes(q))
        );
      }

      const results = documents.map((document) => ({
        id: document.id,
        type: document.type,
        title: document.title,
        path: document.path,
        tags: document.tags,
        excerpt: excerpt(document.text, args.query)
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
    if (Object.keys(args).length > 0) {
      throw invalidParams("validate_career_context does not accept tool arguments. Configure file access when starting the server.");
    }
    const context = findDefaultCareerContext(options.contextPath, repoRoot);
    if (!context.exists) {
      return {
        content: [{ type: "text", text: `Error: ${missingContextMessage(context)}` }],
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

  throw invalidParams(`Unknown tool: ${name}`);
}
