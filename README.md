# leprac

This project is for **defining AI best practices**. It is also a **starter template** you can copy to kickstart a new project with those practices in place.

Use it as the baseline for documentation, conventions, and tooling so new work starts from a shared standard instead of a blank slate.

## Tooling

- Node: `pnpm` + `oxlint` (`.oxlintrc.json`)
- Python: `uv` + `ruff` (`ruff.toml`)

Enable the pre-commit hook that enforces them:

```bash
git config core.hooksPath git-hooks
```
