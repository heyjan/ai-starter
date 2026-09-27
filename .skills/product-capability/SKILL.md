---
name: product-capability
description: Interview the user to turn product intent into PRD, Arc42, and ADR updates. Use when a feature, roadmap item, or PRD is discussed but constraints are still implicit, before multi-file Docs-as-Code work or implementation starts.
license: MIT
---

# Product Capability

This skill interviews the team, then writes **only** into `docs/prd/`, `docs/arc42/`, and `docs/adrs/`. It does not create `PRODUCT.md`, capability manifests, or a fourth planning stack.

Use it when the gap is not "what should we build?" but "what must be true, and where does it live in our docs?"

Follow `docs/AGENTS.md` for layout, layers, and frontmatter. Follow root `AGENTS.md` for YAML fields on every `docs/` Markdown file.

## When to Use

- A PRD, roadmap item, or discussion exists, but implementation constraints are still implicit
- A feature would change goals, quality bars, context, building blocks, or an irreversible technical choice
- Product intent is clear, but architecture, data, lifecycle, or policy implications are fuzzy
- Review keeps restating hidden assumptions

## Non-Negotiable Rules

- Interview. Do not invent product truth, KPIs, actors, or stack choices.
- Ask; wait for answers; then write. One interview pass at a time.
- Skip a question only if an existing file already answers it. Cite that file.
- If the ask conflicts with an accepted ADR, stop and say so. Do not smooth it over.
- Separate user-visible promises (PRD) from system structure (Arc42) from option history (ADR).
- Mark anything unanswered as an open question. Do not fill gaps with guesses.
- Prefer updating existing files in `docs/prd/`, `docs/arc42/`, and `docs/adrs/` over new parallel docs.

## Interview

Do not write documentation until Pass 1 has a restatement the user accepts.

If the repo already answers a question, state the answer and the path, then ask only what is still missing.

### Pass 1 — Product (`docs/prd/`)

Ask:

1. Who is this for?
2. What can they do after this ships that they cannot do now?
3. Why does this matter, and how do we know it worked (acceptance / KPI)?
4. What is explicitly out of scope?
5. Any legal, market, or deadline driver?

Then restate in one paragraph. Wait for confirmation or correction.

### Pass 2 — System (`docs/arc42/`)

Only after Pass 1 is confirmed. Ask:

6. Which actors and external systems sit at the boundary?
7. Who owns the data, and where is the trust boundary?
8. What states and failure/recovery paths must hold?
9. Which quality bars are real requirements (latency, volume, availability, security)?
10. Where in the existing building blocks does this live? If unknown, leave it unknown.

Map answers to sections (create a file only when that section has content):

| Answer | File |
| --- | --- |
| Goals, why | `docs/arc42/01_introduction_and_goals.md` (driven by the PRD) |
| Imposed limits | `docs/arc42/02_architecture_constraints.md` |
| Actors, neighbors | `docs/arc42/03_context_and_scope.md` |
| Approach at system level | `docs/arc42/04_solution_strategy.md` |
| Modules, ownership | `docs/arc42/05_building_block_view.md` |
| States, runtime, recovery | `docs/arc42/06_runtime_view.md` |
| Where it runs | `docs/arc42/07_deployment_view.md` |
| Cross-cutting policy, testing | `docs/arc42/08_crosscutting_concepts.md` |
| Quality bars | `docs/arc42/10_quality_requirements.md` |
| Risks if stated | `docs/arc42/11_risks_and_technical_debt.md` |
| Terms if stated | `docs/arc42/12_glossary.md` |

Update `docs/arc42/index.md` when adding a section file.

### Pass 3 — Decisions (`docs/adrs/`)

Ask:

11. Is there a choice that is expensive to reverse (store, protocol, vendor, auth model)?
12. Which options were considered, and what is the consequence of the one you want?
13. Does an accepted ADR already fix this? If yes, do not reopen it.

If they pick an option: new `docs/adrs/NNNN-kebab-topic.md`, then a one-line pointer in `docs/arc42/09_architecture_decisions.md`. Do not copy the ADR body into Arc42.

If they have not chosen: record the open question in the PRD. Do not write an ADR.

## Write

After the user accepts the restatement and the file list:

1. Show which paths will change and which interview answers are still open.
2. Write only answered content into those paths.
3. Use YAML frontmatter (`title`, `type`, `status`, `tags`, `created`). `type` is `prd`, `architecture-concept`, or `adr`.
4. New work starts as `status: draft` unless the user says otherwise.

Do not implement code in this skill unless the user explicitly asks after the docs handoff.

## Handoff

End with exactly one of:

- **Needs product answers** — Pass 1 is incomplete; do not write Arc42 or ADRs yet
- **PRD only** — product is enough to record; architecture still open
- **PRD + Arc42** — system implications are answered; no new irreversible option
- **PRD + Arc42 + ADR** — a new accepted option exists; §9 links it
- **Blocked on ADR** — the ask conflicts with an accepted ADR until a superseding ADR exists
