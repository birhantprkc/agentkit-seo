# Career Context file specification and structure

## Required semantic interface

The Career Context file is one Markdown document with a stable retrieval interface and a personalized narrative hierarchy. Structural validity ensures that an agent can find the core context. It does not require every person to present their history in the same order.

Recommended portable location when the user wants a reusable path:

```text
~/.vitaecontext/<name-surname>-career-context.md
```

This path is a convention, not a requirement. An explicit path supplied by the user always wins. A local workspace draft such as `./<name-surname>-career-context.md` is also valid when the user wants to iterate inside the active project before moving the file to a private reusable location.

Required semantic components:

1. H1 with full name and positioning descriptor
2. `QUICK REFERENCE` section as YAML in a fenced block
3. scope declaration and `VERIFIED FACTS` anchor
4. direction, priorities, evidence boundaries, and claims to avoid, normally in `Goals and targeting`
5. evidence-backed career history, organized into user-relevant modules
6. evidence-backed skills index

Keep `QUICK REFERENCE` as the first H2. After it, the body order is user-defined. A useful default is goals, experience, projects, education, research, skills, achievements, languages, and community or affiliations, but the user may reorder or rename modules. Express importance through position and depth rather than artificial priority labels. Use semantic tags so retrieval does not depend on section order.

Education and languages are recommended modules, not universal validity requirements. Omit inapplicable modules rather than inventing empty sections.

## Title rule

Use one H1 in this form:

```markdown
# Full Name - positioning descriptor
```

The descriptor should express current positioning, not merely the current job title.

## QUICK REFERENCE rules

- place it immediately after the title
- write it as YAML under an H2 heading labeled `QUICK REFERENCE`
- keep values flat or use flat arrays
- omit empty fields instead of using `null`
- include only the fields that improve repeated retrieval
- treat it as the current positioning snapshot, not as full history
- keep it selective: highest-signal current roles, skills, tools, credentials, and links only

Common fields:

- `name`
- `current_location`
- `positioning_summary`
- `target_roles`
- `growth_direction`
- `emerging_interests`
- `evidence_boundaries`
- `positioning_constraints`
- `claims_to_avoid`
- `open_to_relocation`
- `target_locations`
- `work_mode`
- `ideal_role`
- `current_focus`
- `want_to_work_on_next`
- `interests`
- `education`
- `gpa_summary`
- `professional`
- `top_skills`
- `tools`
- `competitions`
- `certifications`
- `languages`
- public profile links such as `github`, `linkedin`, and `portfolio`

`QUICK REFERENCE` is a retrieval index, not a duplicate biography. Keep direction fields compact and move explanation, nuance, and claim boundaries into the body.

## Goals and targeting rules

Use the stable `## Goals and targeting` heading unless the user explicitly declines direction capture. It may appear anywhere after `QUICK REFERENCE`.

This section records stated intent, not verified history:

- ideal role or dream job
- current focus
- what the user wants to work on next
- target roles
- target locations, relocation stance, and work mode
- growth direction
- professional and personal interests
- evidence boundaries
- positioning constraints
- claims to avoid
- content priorities and defining evidence
- paths that should remain open
- supporting capabilities that should not become the person's primary identity

Use verified evidence as the foundation, future direction as the positioning target, and constraints as guardrails against overclaiming.

Keep this section outside the `VERIFIED FACTS` comment. If a direction has partial evidence, state the evidence level explicitly, such as "verified through project X", "current practical exposure", or "target development area".

Write `No restriction` only when a downstream agent could otherwise mistake omission for uncertainty.

Distinguish established capability, completed research or implementation, practical exposure, active learning, community membership, proposed work, and target expertise. Explain means versus objectives when a prominent method, field, or credential could distort positioning.

## Scope declaration rules

The scope declaration is one short third-person paragraph stating:

- what the file is
- what it is not
- what it is for

Close it with a `VERIFIED FACTS` HTML comment for atomic facts that must not be guessed.

## Narrative hierarchy

- Let the user choose the order of experience, research, projects, education, achievements, community work, and affiliations.
- Give defining evidence more depth and compress peripheral history.
- Preserve relevant history without giving every item equal prominence.
- Keep memberships and honorary affiliations out of professional experience unless they included a distinct evidenced operating role.
- A thesis may appear as research or experience and retain a compact academic record under its degree. Cross-reference instead of duplicating the full description.

## Body rules

- use stable section tags like `[DEGREE]`, `[COURSE]`, `[PROJECT]`, `[THESIS]`, `[ROLE]`, `[PAPER]`, `[PREPRINT]`, `[CERT]`, `[COMPETITION]`, `[AWARD]`, and `[ORG]` when relevant
- include a `TL;DR` for substantial entries when it improves retrieval
- lead important projects and roles with purpose rather than a technology inventory
- keep the skills index evidence-backed; each listed skill should be supported somewhere else in the file
- use bullets or compact prose according to what communicates ownership, reasoning, and evidence best
- use a table or concise list for languages
- add a short `Source:` or `Evidence:` line only for entries whose facts may be reused downstream and are not obvious from nearby hard anchors
- distinguish membership, contribution, affiliation, employment, research, implementation, proposal, practical exposure, active learning, and target expertise

## Minimal entry patterns

- Degrees: `## [DEGREE] ...` plus one sentence on focus and relevance
- Courses: `#### [COURSE] ...` plus a flat `Topics:` line
- Projects: `[PROJECT]` heading plus an adaptive selection of `TL;DR`, `Purpose`, `Role` or `Ownership`, `Approach` or `Stack/areas`, `Results` or `Findings`, `Career relevance`, and `Boundaries`
- Thesis: `[THESIS]` heading plus the identifying academic fields and a compact evidence-backed summary; cross-reference a deeper research or experience entry when present
- Roles: `[ROLE]` heading plus purpose, scope, ownership, evidence, and boundaries appropriate to the role
- Papers/preprints: `### [PAPER] ...` or `### [PREPRINT] ...` plus `TL;DR`

## Integrity rule

Keep a `VERIFIED FACTS` comment in the scope declaration for atomic facts that must not be guessed:

- dates
- grades
- scores
- IDs
- rankings
- other hard factual anchors

## Metrics and findings

- Use metrics only when they demonstrate scale, effectiveness, difficulty, improvement, or a meaningful trade-off.
- Normally retain one to three high-signal metrics per entry.
- Interpret each retained metric so the reader knows why it matters.
- Prefer qualitative findings when a number would be less informative.
- Preserve negative, bounded, or inconclusive results when they demonstrate sound research or engineering judgment.
- Do not require a metric merely to make an entry appear stronger.

## Validation mindset

When validating an existing file, check the semantic interface first, then chronology, claim states, evidence backing, hierarchy, and usefulness. A structurally valid file can still require revision when it does not explain who the person is, why the work matters, or where they are going.
