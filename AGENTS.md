# AGENTS.md

Instructions for AI agents working in this repository.

## Git workflow

- Always create a new branch for changes. Never commit directly to `main`.
- After a branch is merged, delete it.
- When a run loops, stalls, or fails repeatedly, follow `.agents/skills/agent-introspection-debugging/SKILL.md` instead of retrying blindly.

## Tooling (mandatory)

- Node: use `pnpm` only. Never use npm, yarn, or bun, and never commit their lockfiles. Commit `pnpm-lock.yaml`.
- JavaScript/TypeScript linting: use `oxlint` only (`pnpm add -D oxlint`, run `pnpm exec oxlint`). Do not add ESLint. Rules live in `.oxlintrc.json`.
- Python: use `uv` only (`uv add`, `uv add --dev`, `uv run`, `uv sync`). Never use pip, poetry, pdm, pipenv, or `requirements.txt`. Commit `uv.lock`.
- Python linting and formatting: use `ruff` only (`uv add --dev ruff`, run `uv run ruff check` and `uv run ruff format`). Do not add black, flake8, isort, or pylint. Rules live in `ruff.toml`.
- Do not disable lint rules, add ignore comments, or loosen configs to make a check pass. Fix the code.
- Source files are capped at 800 counted lines (blank lines and comments excluded). Include `.vue`. Exclude `tests/`. Split the file; never disable `max-lines`.
- The pre-commit hook enforces all of the above. Enable it once per clone with `git config core.hooksPath git-hooks`. Never bypass it with `--no-verify`.

## Security

- Never leave credentials, API keys, or secrets in source files.
- Never commit or push `.env` files.
- Never read `.env` files.
- For auth, input, secrets, APIs, and sensitive features, follow `.agents/skills/security-review/SKILL.md`.

## Comments

- Do not add comments in source code (including JSDoc and inline narration).
- Names, structure, and tests must make intent obvious.
- Allowed: shebang lines and required license or legal headers.
- For naming, readability, immutability, and code-quality review, follow `.agents/skills/coding-standards/SKILL.md`.
- For REST contracts (resources, status codes, pagination, versioning), follow `.agents/skills/api-design/SKILL.md`.

## Documentation Rules (Docs-as-Code)

- For PRD, Arc42, and ADRs, follow `docs/AGENTS.md`.
- To turn a feature or PRD discussion into those files, interview with `.agents/skills/product-capability/SKILL.md`. Do not invent answers.
- ALWAYS add YAML Frontmatter to any Markdown file created or updated in `docs/`.
- Required fields for Frontmatter:

```yaml
---
title: "Clear Title"
type: "architecture-concept | adr | prd | guide"
status: "draft | active | deprecated"
tags: ["tag1", "tag2"]
created: "YYYY-MM-DD"
---
```
