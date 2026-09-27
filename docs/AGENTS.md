---
title: "Documentation for agents"
type: "guide"
status: "active"
tags: ["docs", "arc42", "prd", "adr"]
created: "2026-09-23"
---

# Documentation for agents

This repo uses **multi-file Docs-as-Code**. Never collapse Arc42 into a single `architecture.md`. Split files keep Git diffs small and let agents load only the section they need.

## Layout

| Path | Role |
| --- | --- |
| `docs/prd/` | Product requirements |
| `docs/arc42/` | Architecture (how the system is built) |
| `docs/adrs/` | Architecture Decision Records |

Arc42 files (create a section when it has content). `docs/arc42/index.md` is the entry point.

| File | Section |
| --- | --- |
| `01_introduction_and_goals.md` | 1. Introduction and goals |
| `02_architecture_constraints.md` | 2. Constraints |
| `03_context_and_scope.md` | 3. Context and scope |
| `04_solution_strategy.md` | 4. Solution strategy |
| `05_building_block_view.md` | 5. Building block view |
| `06_runtime_view.md` | 6. Runtime view |
| `07_deployment_view.md` | 7. Deployment view |
| `08_crosscutting_concepts.md` | 8. Cross-cutting concepts |
| `09_architecture_decisions.md` | 9. Architecture decisions (links to ADRs) |
| `10_quality_requirements.md` | 10. Quality requirements |
| `11_risks_and_technical_debt.md` | 11. Risks and technical debt |
| `12_glossary.md` | 12. Glossary |
| `index.md` | Table of contents |

ADR files: `docs/adrs/NNNN-kebab-topic.md` (monotonic number, never reuse).

## Who answers what

| Artifact | Question | Write | Do not put here |
| --- | --- | --- | --- |
| PRD | What do we build, and why (product)? | Goals, users, scope, UX, KPIs | Stack, module layout, library choice |
| Arc42 | How is the system built? | Context, building blocks, runtime, quality, conventions | Full decision write-ups (link ADRs instead) |
| ADR | Why this option, at that time? | Context, options, consequences; **immutable** after accept | Product scope or a second copy of Arc42 |

## How they connect

1. PRD drives Arc42 **§1 (goals)** and **§10 (quality)**.
2. Arc42 describes the system. **§9 only links** accepted ADRs; it does not re-argue them.
3. A costly or hard-to-reverse technical choice gets a **new ADR**, then a one-line pointer in §9.

## Agent rules

- Load the smallest set of files that answers the task. Prefer `docs/arc42/index.md` plus one section over the whole tree.
- Implement the PRD. Place code where Arc42 says it belongs. Test and conventions live in Arc42 §8, not in the PRD.
- Do not reverse an accepted ADR (library, database, protocol, pattern). Supersede it with a new ADR first, then update the §9 link.
- Do not mix layers: no architecture decisions in the PRD, no feature lists as a substitute for Arc42, no silent stack swaps instead of an ADR.
- New or updated Markdown under `docs/` must include YAML frontmatter (see root `AGENTS.md`).
- New product intent: interview with `.agents/skills/product-capability/SKILL.md` before writing PRD, Arc42, or ADR files. Do not invent answers.
