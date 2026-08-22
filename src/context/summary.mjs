import fs from "node:fs";
import path from "node:path";

import { expandUserPath } from "../filesystem.mjs";
import { validateContextFile } from "./parse.mjs";

const SURFACE_SECTIONS = {
  cv: { names: ["goals and targeting", "education", "experience", "professional experience", "research and publications", "skills index", "certifications and achievements", "languages"], tags: ["DEGREE", "ROLE", "PROJECT", "THESIS", "PAPER", "PREPRINT", "CERT", "COMPETITION", "AWARD"] },
  github: { names: ["goals and targeting", "education", "experience", "professional experience", "independent/open-source projects", "projects", "research and publications", "skills index"], tags: ["DEGREE", "ROLE", "PROJECT", "THESIS", "PAPER", "PREPRINT"] },
  linkedin: { names: ["goals and targeting", "education", "experience", "professional experience", "projects", "research and publications", "skills index", "certifications and achievements", "languages", "extracurricular and leadership"], tags: ["DEGREE", "ROLE", "PROJECT", "THESIS", "PAPER", "PREPRINT", "CERT", "COMPETITION", "AWARD", "ORG"] },
  portfolio: { names: ["goals and targeting", "education", "experience", "professional experience", "independent/open-source projects", "projects", "research and publications", "skills index", "certifications and achievements", "extracurricular and leadership", "public profile snapshot"], tags: ["DEGREE", "ROLE", "PROJECT", "THESIS", "PAPER", "PREPRINT", "CERT", "COMPETITION", "AWARD", "ORG"] },
  x: { names: ["goals and targeting", "experience", "professional experience", "independent/open-source projects", "projects", "research and publications", "skills index", "public profile snapshot"], tags: ["ROLE", "PROJECT", "PAPER", "PREPRINT"] },
  general: null
};

function sectionTags(section) {
  return new Set([...section.content.matchAll(/\[([A-Z]+)\]/g)].map((match) => match[1]));
}

function yamlValue(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => JSON.stringify(entry)).join(", ")}]`;
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

export function summarizeContext(filePath, surface = "general") {
  if (!Object.hasOwn(SURFACE_SECTIONS, surface)) {
    throw new Error(`Unknown summary surface '${surface}'. Available: ${Object.keys(SURFACE_SECTIONS).join(", ")}`);
  }
  const validation = validateContextFile(filePath);
  if (!validation.valid) {
    throw new Error(`Career Context validation failed with ${validation.errors.length} error(s); fix it before creating a bounded summary`);
  }
  const selector = SURFACE_SECTIONS[surface];
  const selected = selector
    ? validation.sections.filter((section) => selector.names.includes(section.normalized)
      || [...sectionTags(section)].some((tag) => selector.tags.includes(tag)))
    : validation.sections.filter((section) => section.normalized !== "quick reference");
  const quickYaml = Object.entries(validation.quickReference)
    .map(([key, value]) => `${key}: ${yamlValue(value)}`)
    .join("\n");
  const content = [
    `# Career Context packet - ${surface}`,
    "",
    `> Generated from ${path.basename(validation.path)}. This packet preserves supplied facts; it does not independently verify them.`,
    "",
    "## QUICK REFERENCE",
    "```yaml",
    quickYaml,
    "```",
    "",
    ...selected.flatMap((section) => [section.content, ""])
  ].join("\n").trimEnd() + "\n";

  return {
    schemaVersion: validation.schemaVersion,
    source: validation.path,
    surface,
    title: validation.title,
    selectedSections: selected.map((section) => section.normalized),
    content
  };
}

export function writeContextSummary(filePath, surface, output) {
  const result = summarizeContext(filePath, surface);
  if (output) {
    const destination = path.resolve(expandUserPath(output));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, result.content, "utf8");
    return { ...result, output: destination };
  }
  return result;
}
