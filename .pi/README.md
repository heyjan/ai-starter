# .pi — Pi coding agent

This repo works with the [Pi coding agent](https://github.com/earendil-works/pi-coding-agent). Canonical skills live in `.agents/skills/`. The same tree is also under `.skills/` for harnesses that look there.

Each skill is a directory with `SKILL.md` (name + description frontmatter). In Pi they show up as `/skill:<name>`.

Project skills Pi loads after the project is trusted:

- `.agents/skills/`
- `.pi/skills/` (empty here; do not fork copies into it)
- `.skills/`

See [Pi skills](https://pi.dev/docs/latest/skills).

## Skills in this repo

| Name | Use |
| --- | --- |
| `product-capability` | Interview, then write PRD / Arc42 / ADR |
| `security-review` | Auth, input, secrets, APIs |
| `coding-standards` | Naming, immutability, quality |
| `api-design` | REST contracts |
| `agent-introspection-debugging` | Failed or looping agent runs |

Edit `.agents/skills/` first, then copy to `.skills/` if both must stay in sync.

## Trust and troubleshooting

Pi asks before trusting a project that ships its own `.pi/` or skill directories. Trust this repo, then restart the session if `/skill:` names are missing.

This adapter does not auto-commit, push, merge, or deploy.
