# Maintenance and validation

## When to update

Update verified record sections only when a real-world fact is verifiable, such as:

- a confirmed grade
- a completed project with a deliverable
- a role that has actually started
- a certification with a real score or ID
- a published result, paper, ranking, or award

Do not add speculative future entries to the verified record. Store aspirations, target roles, growth direction, emerging interests, and claims to avoid in `Goals and targeting` as stated intent.

## Safe integration workflow

1. Identify the target entry using semantic tags and the file's user-defined hierarchy.
2. Draft only the new or revised entry in the required format.
3. Update the `VERIFIED FACTS` comment if the material adds dates, grades, scores, IDs, rankings, or other hard anchors.
4. Check whether the material evidences a new skill that belongs in the Skills index.
5. If the material changes future direction, update `Goals and targeting` and keep evidence boundaries explicit.
6. Apply the smallest edit that preserves the rest of the file untouched.

## Conflict resolution workflow

1. Record the conflicting field, each observed value, and its source group.
2. Check whether one source explicitly supersedes the other, such as a newer official credential, corrected CV, or user-confirmed date.
3. If precedence is clear, apply the corrected value and name the deciding source in the change report.
4. If precedence is unclear, keep the claim out of `VERIFIED FACTS`, label it `Needs evidence`, and ask for the smallest fact required to resolve it.
5. Continue updating unrelated sections whose evidence is not affected by the conflict.

Do not turn a local conflict into a full-workflow stop unless it affects identity, chronology, ownership, or another hard anchor required by the requested output.

## Validation checklist

A valid context file should satisfy all of the following:

- exactly one H1 title with full name and positioning descriptor
- `QUICK REFERENCE` appears immediately after the title
- the QUICK REFERENCE block is YAML and uses only flat values or flat arrays
- direction, priorities, and claim boundaries are present unless intentionally declined
- career-direction fields are stated intent and remain outside the `VERIFIED FACTS` comment
- growth direction, emerging interests, evidence boundaries, positioning constraints, and claims to avoid are present when the user is repositioning across domains
- required semantic components are present: scope declaration, evidence-backed history, and skills index
- conditional sections appear only when the user has relevant content
- semantic tags are used consistently: `[DEGREE]`, `[COURSE]`, `[PROJECT]`, `[THESIS]`, `[ROLE]`, `[PAPER]`, `[PREPRINT]`, `[CERT]`, `[COMPETITION]`, `[AWARD]`, `[ORG]`
- substantial entries have a meaningful `TL;DR` when it improves retrieval
- the Skills index contains only skills supported elsewhere in the file
- the `VERIFIED FACTS` comment exists and covers the hard facts in the body
- dates, titles, metrics, and chronology are internally consistent
- section order and depth reflect the user's priorities
- defining entries explain purpose and personal ownership
- claim states distinguish membership, contribution, proposal, implementation, exposure, and target expertise where ambiguity is likely
- metrics are selective and interpreted rather than required by default

## Token-growth rules

- Keep the QUICK REFERENCE block current and selective.
- Preserve the historical record in the body.
- Compress peripheral detail instead of deleting important evidence.
- Revisit narrative hierarchy when direction changes; a targeted reorder may be more accurate than preserving an obsolete emphasis.
- Remove stale items from `top_skills` or the QUICK REFERENCE `professional` snapshot when they are no longer central to current positioning.
- Keep source ledgers grouped by input type or file. Expand provenance only for conflicts, hard factual anchors, or claims likely to be reused in public copy.

## Editing posture for agents

- Prefer targeted diffs over whole-file rewrites.
- Do not silently normalize conflicting facts; surface the conflict.
- Do not add unsupported skills just because they would sound useful.
- If the stable semantic interface is broken, repair it first, then improve hierarchy and wording.
