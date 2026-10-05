# zero-slop-design

A plugin marketplace for developers who want coding agents to keep their design selections.

The first plugin contains **14 skills**, a `DESIGN.md` profile, a starter template, and local tools. Skill instructions use **ASD-STE100 Issue 9** vocabulary, grammar practices, and documented technical terms. The project does not impose a visual style.

## Install

### Codex

```sh
codex plugin marketplace add zero-slop-design/zero-slop-design-plugin
codex plugin add zero-slop-design@zero-slop-design
```

Restart the agent session if the harness requires it. Use a skill by name, such as `$create-design-md`, or describe the task so the harness can select a skill.

### Claude Code

```sh
claude plugin marketplace add zero-slop-design/zero-slop-design-plugin
claude plugin install zero-slop-design@zero-slop-design
```

The skill commands use the plugin namespace, for example `/zero-slop-design:create-design-md`. For local development, load the repository with `claude --plugin-dir /absolute/path/to/zero-slop-design-plugin`.

### Other skill-capable harnesses

The plugin uses the [Agent Skills folder format](https://agentskills.io/specification) and the [Agent Plugins manifest](https://agent-plugins.org/). Import the whole plugin when supported. Preserve the shared `references/`, `templates/`, `spec/`, and `tools/` directories beside `skills/`; the skills use these bundled resources. Copying one `SKILL.md` alone is insufficient.

## Skills

| Skill | Task |
|---|---|
| `define-design` | Record audience, tasks, references, selections, and exclusions in a design brief. |
| `create-design-md` | Make a design file from that brief and project sources. |
| `extract-design` | Get design data from code, an interface, or supplied images. |
| `review-design-md` | Find document defects, missing data, and conflicting instructions. |
| `update-design-md` | Change specified selections and their dependencies. |
| `apply-design` | Use the design file for interface implementation. |
| `review-design-drift` | Compare the interface with its recorded design data. |
| `define-typography` | Set text roles, font sources, and text behavior. |
| `define-color-system` | Set semantic colors, contrast pairs, and modes. |
| `define-responsive-layout` | Set layout limits, spacing, breakpoints, and content behavior. |
| `define-interaction-states` | Set component states, keyboard behavior, recovery, and motion. |
| `review-accessibility` | Inspect the stated document or interface area against accessibility criteria. |
| `export-design-tokens` | Export design tokens as CSS, DTCG JSON, or Tailwind theme data. |
| `enforce-design` | Add design code checks to a project and its continuous integration. |

Start with `define-design`, then `create-design-md`. Use `extract-design` when an interface already exists. Review the file before implementation and review drift after authorized interface checks. Use `enforce-design` to keep new source code inside the recorded design values.

The template is an example. The skills keep developer selections, mark proposals and missing data, and reuse project components and assets. Interface copy follows the developer's voice. Skill instructions use STE.

## Local tools

Node.js **22 or later** is required for the tools. No npm installation or service connection is required after plugin installation.

```sh
node tools/zsd.mjs init /path/to/project/DESIGN.md
node tools/zsd.mjs lint /path/to/project/DESIGN.md --strict --json
node tools/zsd.mjs diff /path/to/before.md /path/to/after.md --json
node tools/zsd.mjs drift /path/to/project/DESIGN.md /path/to/observations.json --json
node tools/zsd.mjs export /path/to/project/DESIGN.md --format css --out /path/to/tokens.css
node tools/zsd.mjs export /path/to/project/DESIGN.md --format dtcg --out /path/to/tokens.json
node tools/zsd.mjs export /path/to/project/DESIGN.md --format tailwind --out /path/to/theme.css
node tools/zsd.mjs language skills/define-design/SKILL.md --json
node tools/zsd.mjs check-code /path/to/project/DESIGN.md --config /path/to/project/design-check.config.json
```

`init` and `export` refuse to overwrite files unless `--force` is supplied. Export cannot replace its source design file. Export requires a clean document, resolves references, and reports every unsupported value. Unsupported exports produce no token output. Use `--report PATH` to write the mapping report and `--mode NAME` to select a defined color mode.

The DTCG output targets **2025.10**. Its typography composites require an explicit `letterSpacing`; font fallback lists become arrays. Tailwind output targets **v4**, includes CSS variables, and adds an `@theme inline` mapping. It leaves the project theme defaults in place. Raw CSS shadows have no DTCG mapping; their export fails with the source path instead of inventing a conversion.

`diff` compares YAML data. `drift` compares only supplied measured observations; neither proves interface quality. Read the [observation contract](references/observations.md).

`check-code` compares source code with the resolved values in DESIGN.md. It reports color values, color functions, utility palette classes, dimensions, and font families that the design file does not permit, plus `must-avoid` patterns such as gradients, background blur, emoji, and shadows. Exception comments need a cause. A known defect list lets an existing project block only new findings. The command reads DESIGN.md on each run, so continuous integration follows design changes. It does not examine layout, computed contrast, component states, or visual quality. Read [code checks](references/code-checks.md). Exit codes are `0` for success, `1` for findings or unsupported export, and `2` for invalid input or an operation error.

## Standard and language

- [DESIGN.md profile](spec/zsd-design-md.md)
- [Starter template](templates/DESIGN.md)
- [Template guide](docs/template-guide.md)
- [Format research](docs/design-md-standard.md)
- [Skill authoring instructions](references/authoring.md)
- [Language inspection record](docs/language-review.md)

The profile owns the zero-slop-design requirements. It uses `@google/design.md@0.4.0` as a pinned reference validator. That dependency is not the product brand. The runtime includes its license and required validator data.

The language tool checks selected sentence, paragraph, contraction, and verb conditions. It does not contain the ASD dictionary and does not certify full STE conformance. Word meanings, parts of speech, technical term categories, and grammar remain part of the recorded authoring inspection. A document lint score does not establish accessibility conformance.

ASD-STE100 is the ASD specification for Simplified Technical English. This project is independent and is not endorsed by ASD. Obtain the standard from [ASD](https://www.asd-ste100.org/STE_downloads.html).

## Develop

```sh
npm ci --ignore-scripts
npm run build
npm run validate
npm run package
```

Commit the rebuilt `tools/` files with source changes. The package command validates the repository and makes an archive and SHA-256 file in `dist/`. It excludes Git history and npm dependencies. Package validation checks manifests, paths, catalogue consistency, skill metadata, selected language conditions, and the starter with the bundled linter. It does not execute interface tests.

This repository is the public plugin boundary in a workspace of separate repositories. Future plugins can be separate repositories and can be added to the marketplace catalogue.

## License

Original project files use the [MIT license](LICENSE). Bundled dependencies retain their licenses in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The ASD-STE100 standard and dictionary are not included or relicensed.
