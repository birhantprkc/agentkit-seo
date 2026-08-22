import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { parseContextDocument, validateContextFile } from "../src/context/parse.mjs";
import { summarizeContext } from "../src/context/summary.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fictionalExample = path.join(
  repoRoot,
  "hub",
  "context-builder",
  "examples",
  "alex-morgan-fictional-career-context.md"
);

test("fictional public example satisfies the Career Context contract", () => {
  const result = validateContextFile(fictionalExample);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.quickReference.name, "Alex Morgan");
});

test("Career Context validation reports structure, placeholder, YAML, and chronology errors", () => {
  const result = parseContextDocument(`# [Your name]

## EDUCATION

## QUICK REFERENCE
\`\`\`yaml
name:
  nested: value
\`\`\`

<!-- VERIFIED FACTS: role=2026 -->

## LANGUAGES

Worked from 2026-2024.
`);
  assert.equal(result.valid, false);
  const codes = new Set(result.errors.map((entry) => entry.code));
  for (const expected of [
    "h1_descriptor",
    "quick_reference_position",
    "quick_reference_yaml",
    "missing_quick_field",
    "missing_section",
    "placeholder",
    "reversed_date_range"
  ]) assert.equal(codes.has(expected), true, `missing ${expected}`);
});

test("bounded summaries select only surface-relevant sections", () => {
  const result = summarizeContext(fictionalExample, "github");
  assert.match(result.content, /## Experience/);
  assert.match(result.content, /## Independent projects/);
  assert.match(result.content, /## Skills index/);
  assert.doesNotMatch(result.content, /## Languages/);
  assert.doesNotMatch(result.content, /## QUICK REFERENCE[\s\S]*## QUICK REFERENCE/);
});

test("validation warns when a personal context sits inside a Git workspace", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "context-git-"));
  fs.mkdirSync(path.join(workspace, ".git"));
  const target = path.join(workspace, "career-context.md");
  const source = fs.readFileSync(fictionalExample, "utf8").replace(/<!-- FICTIONAL EXAMPLE:[\s\S]*?-->/, "");
  fs.writeFileSync(target, source);
  const result = validateContextFile(target);
  assert.equal(result.warnings.some((entry) => entry.code === "tracked_workspace_path"), true);
});

test("personalized hierarchy permits experience and independent projects before education", () => {
  const result = parseContextDocument(`# Casey Lee - Research engineer building toward trustworthy robotics

## QUICK REFERENCE

\`\`\`yaml
name: Casey Lee
positioning_summary: "Research engineer combining control systems and safety evaluation while keeping research and product paths open."
growth_direction: "Trustworthy robotics research or safety-focused product engineering."
claims_to_avoid: [Production robotics safety expert, Formal standards author]
top_skills: [Control systems, Safety evaluation]
\`\`\`

This private file is a grounded source of truth and positioning guide for Casey Lee.

<!-- VERIFIED FACTS: internship=2025-06/2025-09 -->

## Goals and targeting

Research and industry paths remain open. Control theory is a means for building safer autonomous systems, not the only target identity.

## Experience

### [ROLE] Research intern | Example Robotics Lab | June-September 2025

Purpose: Evaluate whether controller failures could be detected before unsafe actuation.
Ownership: Built the test harness and documented bounded findings.
Boundary: Research prototype, not production deployment.

## Independent projects

### [PROJECT] Safety Replay

Purpose: Make safety regressions reproducible across controller versions.
Result: Found two failure classes; no production-effectiveness claim is supported.

## Education

### [DEGREE] MSc Robotics | Example University | 2024-Present

## Skills index

**Supported skills:** Control systems, Safety evaluation
`);
  assert.equal(result.valid, true);
  assert.equal(result.errors.some((entry) => entry.code === "section_order"), false);
  assert.equal(result.warnings.filter((entry) => entry.code === "missing_tldr").length, 2);
});

test("bounded summaries find personalized project and experience modules by semantic tags", () => {
  const result = summarizeContext(fictionalExample, "github");
  assert.match(result.content, /\[PROJECT\] QueueWatch/);
  assert.match(result.content, /\[ROLE\] Backend Developer Intern/);
});

test("organization membership alone does not satisfy evidence-backed career history", () => {
  const result = parseContextDocument(`# Casey Lee - Emerging security practitioner

## QUICK REFERENCE

\`\`\`yaml
name: Casey Lee
positioning_summary: "Emerging security practitioner building an evidence-backed direction."
\`\`\`

This private file is a grounded source of truth and positioning guide for Casey Lee.

<!-- VERIFIED FACTS: membership=2025 -->

## Goals and targeting

Build verified security experience without presenting community membership as professional contribution.

## Community and affiliations

### [ORG] Example Security Community | Member | 2025-Present

Membership only; no practical contribution is claimed.

## Skills index

**Supported skills:** None recorded yet.
`);
  assert.equal(result.valid, false);
  assert.equal(result.errors.some((entry) => entry.code === "missing_evidence_history"), true);
});
