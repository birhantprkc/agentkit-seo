<!--
metadata:
  title: "Career Context file specification"
  platform: "general"
  objective: "Defines the stable semantic interface and personalized narrative rules for a Career Context file."
  status: "draft"
  last_updated: "2026-08-22"
  tags: ["context-file", "specification", "agent-optimization", "formatting"]
  agent_priority: "high"
-->

# Career Context file specification

> Defines a stable agent-readable interface while allowing hierarchy, emphasis, explanations, and boundaries to represent the actual person.

---

## 1. Overview

The Career Context file is a private source of truth, positioning guide, and interpretation layer for career-oriented agent work. It records what a person has done, why the work mattered, which evidence supports it, where the person wants to go, and what future agents must not infer. Two readers use it simultaneously: a human who maintains it and an agent that extracts facts, priorities, and boundaries.

Structural compliance is necessary but insufficient. A good file must also be personally representative, evidence-bounded, compact enough for repeated use, and explicit about the relationship between past work and future direction.

The file can live wherever the user wants. Prefer an explicit user-chosen path. A useful portable convention is `~/.vitaecontext/<name-surname>-career-context.md`; a local workspace draft is also valid while the file is being created. Agents must confirm the destination before creating or overwriting the file. Because valid context files can become large, agents should prefer file writes or targeted diffs over full in-chat drafts; if file writing is unavailable, return a compact outline first and split the full Markdown draft by section only when requested.

## 2. File structure

The file has a stable semantic core and flexible evidence modules. Keep the first two elements stable, then order the remaining modules by personal importance.

| # | Section | Status |
|---|---|---|
| 1 | Title | Required |
| 2 | QUICK REFERENCE block | Required |
| 3 | Scope declaration and VERIFIED FACTS | Required |
| 4 | Direction, priorities, and boundaries | Required unless declined |
| 5 | Evidence-backed career history | Required |
| 6 | Skills index | Required |
| 7 | Education, research, projects, achievements, languages, community, and affiliations | Conditional |

**Rule:** Keep QUICK REFERENCE first. Experience-first, project-first, research-first, and education-first body structures are all valid. Stable semantic tags provide retrieval without a universal section order.

### 2.1 Title

**Rule:** Use one H1 heading containing the person's full name and a one-phrase professional descriptor.

```markdown
# Firstname Lastname - Professional Descriptor
```

The descriptor reflects the person's positioning, not their current job title. It is the phrase an agent uses as a default tagline in generated outputs.

### 2.2 QUICK REFERENCE block

The **QUICK REFERENCE block** is the most critical section. Place it immediately after the title, before any prose. An agent completing most tasks — cover letters, CV summaries, bios — reads this block first and descends into the body only when it needs specific detail.

**Rule:** Write the block as a YAML fenced code block under an H2 heading labeled `QUICK REFERENCE`.

```yaml
name: Firstname Lastname
current_location: City, Country
target_roles: [Role A, Role B]
open_to_relocation: true/false
target_locations: [City, Country, Remote-Region]   # or [No restriction]
work_mode: remote/hybrid/onsite
positioning_summary: Current verified identity plus the direction the person is building toward
ideal_role: The role the person ultimately wants
current_focus: What the person is working on and improving now
want_to_work_on_next: Problems, domains, or responsibilities the person is aiming for
growth_direction: Future domain, seniority, or role family the person wants to move toward
emerging_interests: [topic1, topic2, topic3]
evidence_boundaries: Which direction claims are verified, emerging, or target development areas
positioning_constraints: How to frame transitions without overstating experience
claims_to_avoid: [claim that is not yet supported, claim that would distort the profile]
interests: [interest1, interest2, interest3]

education:
  - "[DEGREE] Degree Name | Institution | Grade | Month Year"
  - "[DEGREE] Degree Name | Institution | GPA x/y | exp. Month Year"

gpa_summary: "Course A: grade, Course B: grade, Course C: grade, ..."

professional:
  - "[ROLE] Job Title | Company | Period"

top_skills: [skill1, skill2, skill3]
tools: [tool1, tool2, tool3]

competitions:
  - "Result — Competition Name (Year)"

certifications:
  - "Cert Name | Issuer | Date | ID (if applicable)"

languages:
  - "Language: Level (Certificate if applicable)"

github: https://github.com/username
linkedin: https://linkedin.com/in/username
portfolio: https://yoursite.com
```

**Rule:** Use inline values or flat arrays only. Do not nest objects beyond the top level.

**Rule:** Omit any field that has no value. Do not write `null` or `N/A`.

**Recommendation:** List 8–15 entries in `top_skills`, ordered from most to least central to the person's positioning.

The `gpa_summary` field lists all graded courses on a single comma-separated line. This lets an agent retrieve the full academic record without leaving the block.

### 2.3 Goals and targeting

Use **Goals and targeting** as the default interpretive layer after QUICK REFERENCE and the scope declaration. It records where the person wants to go, what matters most, which paths remain open, and how evidence should be interpreted.

**Rule:** This section holds stated intent and preferences, not verified facts. Keep it separate from the verified record and never convert an aspiration into claimed experience. Do not list it inside the `<!-- VERIFIED FACTS -->` comment.

```markdown
## Goals and targeting

**Ideal role:** The role the person ultimately wants.
**Current focus:** What the person is working on and improving now.
**Want to work on next:** Problems, domains, or responsibilities they are aiming for.
**Growth direction:** The future domain, role family, seniority, or positioning shift they are building toward.
**Target locations:** Cities, countries, remote or hybrid preference, relocation stance, or No restriction.
**Interests:** Professional and personal interests that shape direction.
**Evidence boundaries:** Which parts of the direction are already verified, which are emerging, and which are target development areas.
**Positioning constraints:** Rules for framing the transition without overstating experience.
**Claims to avoid:** Claims that should not appear in public copy unless new evidence is supplied.
**Defining evidence:** The experiences, research, or projects that should receive the most attention.
**Supporting foundations:** Capabilities to carry forward and the objectives they serve.
**Paths to keep open:** Research, industry, independent, leadership, or other outcomes that should remain possible.
**Constraints:** Visa, availability, role types to avoid, or No restriction.
```

**Rule:** Write `No restriction` only when omission could cause a downstream agent to mistake openness for uncertainty.

**Rule:** Use verified evidence as the foundation, future direction as the positioning target, and constraints as guardrails. Distinguish established capability, completed research or implementation, practical exposure, active learning, community membership, proposed work, and target expertise. Explain when a prominent method or domain is a supporting means rather than the person's desired identity.

### 2.4 Personalized narrative hierarchy

Before a major creation or restructuring, ask the user to rank experience, research, independent projects, education, achievements, community work, and affiliations. Use order and relative depth to express importance.

Give defining evidence more space and compress peripheral history. Keep memberships and honorary affiliations out of professional experience unless they included a distinct evidenced operating role. A thesis may appear as research or experience while retaining a compact academic record under its degree; cross-reference instead of duplicating the full description.

### 2.5 Scope declaration

The **scope declaration** is a single paragraph written in third person. It states what the file is, what it is not, and what it is for. Write it so an agent can read it as instructions rather than self-description.

**Rule:** Close the scope declaration with a `<!-- VERIFIED FACTS: ... -->` HTML comment listing every atomic fact in the file that must never be hallucinated: grades, scores, dates, IDs, and rankings. Update this comment whenever a new verified fact is added.

```markdown
This file is a personal knowledge base documenting [Name]'s full [field] career.
It is not intended for direct distribution to third parties. Its purpose is to serve
as a structured source of truth from which career outputs can be generated. All
facts, grades, dates, and names are verified.

<!-- VERIFIED FACTS: graduation=YYYY-MM-DD, final grade=x/y, GPA=x.xx/y,
cert score=NNN, cert id=XXXXXXX, competition result=Nth place, score=XXXXXXX -->
```

The HTML comment is invisible in rendered Markdown but visible to any agent reading raw text.

### 2.6 Education

Write each degree as an H2 heading using the `[DEGREE]` tag.

```markdown
## [DEGREE] Degree name (Classification) | Institution, City, Country | Grade | Start – End
```

Follow the heading with one sentence describing the degree's focus and its relevance to the person's current positioning. An agent uses this sentence when it needs to represent the degree in a generated output.

**Courses**

Group courses under an H3 semester heading. Write each course as an H4 entry with the `[COURSE]` tag.

```markdown
### Semester label

#### [COURSE] Course name | Grade: x/y | Code: XXXXXXX
Topics: term one, term two, term three, term four, ...
```

The `Topics:` line is a flat comma-separated enumeration of technical terms. Do not use bullet points. The purpose of this line is keyword coverage for ATS matching and agent skill-mapping.

**Projects**

If a course has a project, nest it under the course as an H5 entry with the `[PROJECT]` tag.

```markdown
##### [PROJECT] Project name | Repo: https://github.com/...
**TL;DR:** One sentence — what was built, core technologies, key result.
```

**Recommendation:** Add a `**TL;DR:**` line immediately after the heading when the project is substantial enough that a retrieval summary helps. Keep it compact and evidence-bounded.

Use an adaptive subset of these fields:

- **Purpose:** why the project existed and what problem mattered.
- **Role or ownership:** what the person personally decided, built, tested, or maintained.
- **Approach or stack/areas:** important methods, technologies, and trade-offs.
- **Results or findings:** interpreted evidence, including qualitative or bounded outcomes.
- **Career relevance:** why the work supports the intended direction when the connection is not obvious.
- **Boundaries:** what the entry does not establish when overclaiming is likely.

Do not force every field into every entry. Lead with purpose before technologies.

Do not explain what a technology does. State what was done with it.

**Thesis**

Write the thesis as an H3 entry under its parent degree, using the `[THESIS]` tag.

```markdown
### [THESIS] Short title
**Full title:** Official title, in the original language if different.
**Supervisors:** Name, Name
**Research area:** Area A, Area B
**TL;DR:** One sentence — contribution and outcome.
```

### 2.7 Professional experience

Write each role as an H3 entry using the `[ROLE]` tag.

```markdown
### [ROLE] Job title | Company | Location | Period
**TL;DR:** One sentence describing the role's scope and primary focus.
```

Follow the TL;DR with the role's purpose, personal ownership, important choices or trade-offs, and evidence. Use bullets or compact prose according to what communicates the work best.

If the role is the industry context for a thesis, add a cross-reference on the line after the TL;DR:

```markdown
*This role is the industry context for the [THESIS] documented under [degree section].*
```

### 2.8 Research and publications

Include this section only if the person has formal research outputs: published papers, preprints, DOI-linked reports, or papers under review.

Write each paper as an H3 entry using the `[PAPER]` or `[PREPRINT]` tag.

```markdown
### [PAPER] Short title | Venue | Year
**Full title:** Full paper title.
**Authors:** Author A, **Firstname Lastname**, Author B
**DOI:** https://doi.org/...
**TL;DR:** One sentence — contribution and main finding.
```

For work not yet published, use `[PREPRINT]` and add the status after the year: `| Under review` or `| In preparation`.

### 2.9 Skills index

**Rule:** Write the Skills index as a flat categorical enumeration. Do not use prose or bullet lists.

Write each category as a bold label followed by a comma-separated list on the same line.

```markdown
**Security:** term, term, term, ...
**Networks:** term, term, term, ...
**Cryptography:** term, term, term, ...
**Machine learning / AI:** term, term, term, ...
**Embedded systems:** term, term, term, ...
**Development:** term, term, term, ...
**Frameworks and tools:** term, term, term, ...
**Standards and frameworks:** term, term, term, ...
**Compliance and regulation:** term, term, term, ...
```

Add or remove categories to match the person's field. **Rule:** Every skill listed must appear in at least one other section of the file. Do not add skills without supporting evidence in the body.

### 2.10 Certifications and achievements

Write each entry as an H3 using the appropriate tag. The three entry types and their formats are shown below.

```markdown
### [CERT] Certificate name | Issuer | Date | ID: XXXXXXX
Score: overall score and per-component breakdown if applicable.

### [COMPETITION] Competition name | Year | Result: Nth place / Score: X
**TL;DR:** One sentence — the challenge and what was built or demonstrated.

### [AWARD] Award name | Issuing body | Date
One sentence describing what was recognized and in what context.
```

### 2.11 Languages

**Recommendation:** Write the Languages section as a compact table or list.

The table below shows the required columns and an example row for each case.

| Language | Level | Certificate | Notes |
|---|---|---|---|
| Italian | Native | — | — |
| English | B2 / C1 speaking | Cambridge FCE, Score 172, ID C7109952 | — |
| French | Basic | — | — |

Use CEFR levels as the standard. Include standardized test scores and IDs in the Certificate column.

### 2.12 Extracurricular, community, and affiliations

Write each entry as an H3 using the `[ORG]` tag.

```markdown
### [ORG] Organization name | Role | Period
- State whether this was membership, affiliation, or an evidenced operating role.
- Describe concrete contributions and interpreted scope only when the evidence supports them.
```

Describe evidenced operating work separately from membership or honorary affiliation. Do not infer contribution, leadership, teaching, or employment from membership alone.

## 3. Formatting rules

These rules apply across the entire file regardless of section.

### 3.1 Semantic section tags

Every heading representing a professional artifact must begin with a semantic tag in square brackets, including degree entries that use H2 headings. The table below lists the full tag vocabulary.

| Tag | Used for |
|---|---|
| `[DEGREE]` | Academic degree |
| `[COURSE]` | Individual course |
| `[PROJECT]` | Practical project under a course or role |
| `[THESIS]` | Bachelor's or Master's thesis |
| `[ROLE]` | Professional position or internship |
| `[PAPER]` | Published or submitted academic paper |
| `[PREPRINT]` | Paper in preparation or under review |
| `[CERT]` | Formal certificate or credential |
| `[COMPETITION]` | Competitive event with a scored result |
| `[AWARD]` | Award or honor |
| `[ORG]` | Organization membership |

Tags enable an agent to identify the content type before reading it. This allows selective loading of specific sections without parsing the full file.

### 3.2 TL;DR convention

**Recommendation:** Add a `**TL;DR:**` line to substantial `[PROJECT]`, `[THESIS]`, `[COMPETITION]`, and `[ROLE]` entries when it improves retrieval. Keep it compact and evidence-bounded.

### 3.3 No unicode bold

**Rule:** Do not use Unicode bold characters (e.g., `𝗡𝗲𝘁𝘄𝗼𝗿𝗸`, `𝗔𝗜`) anywhere in the file. Use standard Markdown bold (`**text**`) or plain text instead.

Unicode bold inflates token count, breaks in some parsers, and carries no semantic meaning for language models.

### 3.4 Date format

**Rule:** Follow this format for all dates throughout the file.

| Context | Format | Example |
|---|---|---|
| Single date | Month Year | June 2024 |
| Range | Month Year – Month Year | September 2021 – June 2024 |
| Future date | Expected Month Year | Expected October 2026 |

Use an en-dash (`–`), not a hyphen (`-`), in date ranges. Do not mix formats within the file.

### 3.5 Select and interpret metrics

**Recommendation:** Normally retain one to three high-signal metrics per entry. Use a metric only when it demonstrates scale, effectiveness, difficulty, improvement, or a meaningful trade-off.

Interpret every retained number so the reader knows why it matters and what it does not prove. Qualitative, negative, bounded, or inconclusive findings are valid evidence when they demonstrate sound judgment. Do not require a metric merely to make an entry appear stronger.

### 3.6 Technology lists

**Rule:** List technologies, tools, libraries, and frameworks as comma-separated values on a single line. Do not use a bullet list for technology enumeration.

Good example:

```markdown
<!-- CORRECT: flat list, token-efficient, agent-parseable -->
Technologies: Python, PyTorch, Scikit-learn, Pandas, QEMU, ARM GCC
```

Bad example:

```markdown
<!-- WRONG: bullet list wastes tokens and fragments what is a single concept group -->
Technologies:
- Python
- PyTorch
- Scikit-learn
```

### 3.7 Header hierarchy

**Rule:** Use consistent Markdown hierarchy within each module. The exact entry level may vary with the user's body structure.

| Level | Used for |
|---|---|
| H1 (`#`) | File title. One per file. |
| H2 (`##`) | Major user-ordered modules: Experience, Projects, Education, Skills index, etc. |
| H3-H5 | Entries and sub-entries at a consistent depth within their parent module. |

## 4. Anti-patterns

### Unicode bold as visual headers

**What it looks like:** `𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗮𝗻𝗱 𝗖𝗹𝗼𝘂𝗱 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆` used as a visual header inside a section body.

**Why it fails:** Unicode bold characters inflate token count, break in some parsers, and are semantically invisible to language models. Content appears unstructured to an agent.

**What to do instead:** Use a proper Markdown heading at the correct level in the hierarchy.

### Skills listed without body evidence

**What it looks like:** A term appears in the Skills index but does not appear in any course, project, or role section.

**Why it fails:** An agent asked to justify a skill claim in a cover letter cannot cite supporting evidence. Recruiters or screening workflows that compare claims across documents may flag unsupported skills as weak or inconsistent.

**What to do instead:** Only list a skill if it is backed by at least one course, project, role, or certification in the file body.

### Explanatory prose inside project sections

**What it looks like:** "PyTorch is a deep learning framework. It was used in this project to train a classifier."

**Why it fails:** The reader is assumed to know what the tool is. Explaining it wastes tokens and buries the actual contribution.

**What to do instead:** State what was done with the tool, not what the tool is.

### Missing retrieval summary on a substantial entry

**What it looks like:** A 30-line project section with no TL;DR line.

**Why it fails:** An agent generating a CV bullet for that project must parse the full section to find the key claim. This increases token usage and raises the risk of misrepresentation.

**What to do instead:** Add a compact TL;DR after a substantial `[PROJECT]`, `[THESIS]`, `[COMPETITION]`, or `[ROLE]` heading when it improves retrieval. Do not require one for a short entry that is already self-explanatory.

### Null and N/A values in the QUICK REFERENCE block

**What it looks like:** `portfolio: N/A` or `portfolio: null` in the YAML block.

**Why it fails:** These values pollute the block with noise. A YAML parser may treat them as strings rather than absent fields, causing unexpected behavior in agent pipelines that consume the block programmatically.

**What to do instead:** Omit the field entirely when it has no value.

## 5. Validation checklist

Before considering a context file complete, verify all of the following items.

- [ ] The file opens with an H1 title in the specified format.
- [ ] The QUICK REFERENCE YAML block is complete and appears before the scope declaration.
- [ ] Direction, priorities, supporting foundations, evidence boundaries, and claims to avoid are present or intentionally declined.
- [ ] The scope declaration includes the `<!-- VERIFIED FACTS: ... -->` comment.
- [ ] Every verified fact in the file appears inside the `<!-- VERIFIED FACTS: ... -->` comment.
- [ ] Every H3 and deeper heading representing a professional artifact has a semantic tag.
- [ ] Defining entries explain purpose and personal ownership; substantial entries use a TL;DR when it improves retrieval.
- [ ] The Skills index is present and written as a flat categorical enumeration.
- [ ] Every skill in the Skills index appears in at least one body section.
- [ ] No Unicode bold characters appear anywhere in the file.
- [ ] All dates follow the specified format with en-dashes for ranges.
- [ ] All technology enumerations use comma-separated format, not bullet lists.
- [ ] Metrics are selective, interpreted, and not required without meaning.
- [ ] The QUICK REFERENCE block contains no `null` or `N/A` values.
- [ ] Body modules are ordered and weighted according to the user's priorities.
- [ ] Claim states prevent membership, affiliation, proposal, exposure, or targets from being inflated.

---

*Next step: Learn how to load the file into a session in the [Agent workflow for context file users](./agent-workflow.md).*
