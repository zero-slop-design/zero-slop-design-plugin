# Use the zero-slop-design DESIGN.md template

The [starter](../templates/DESIGN.md) is a complete example with valid token values and draft preferences. Its blue palette, system font, comfortable spacing, and form layout are sample choices. Customize them for the project before treating them as its design contract.

## Customize the file

1. Place a copy at the project's chosen design path. Merge into an existing file when one already defines the design.
2. Set `name`, its matching title, and `description` for the product.
3. Replace `x-zsd.intent` with the audience, main task, desired visual character, density, and supported themes.
4. Set `x-zsd.preferences` to the developer's required, excluded, and preserved choices. Add reference links with a note about which qualities they demonstrate.
5. Inspect existing components, styles, and assets. Put their actual paths in `x-zsd.implementation`; leave absent resources as empty lists.
6. Replace tokens and component guidance together. Keep values in front matter and explain their purpose in the body.
7. Replace domain components, responsive rules, feedback states, icon choices, and imagery guidance with project-specific decisions.
8. Keep undecided choices in `x-zsd.unresolved`. Set `kind: project` when the file describes the project. Record a review only when it happened.

The profile's `px`, uppercase hex, and exact heading requirements are zero-slop-design choices. Google's alpha format accepts other units and color formats. Preserve source values in an import report when normalization is necessary; do not silently change the intended design.

The starter is authored, so it has no fabricated source URL or capture date. A generated or hybrid reference records its real `x-zsd.source.url` or a nonempty `x-zsd.source.paths` list. Record the capture date when applicable. Local source code and screenshots do not need an invented website.

## Connect a coding harness

Use one canonical design file. Merge the appropriate adapter into the project's existing instructions. Adjust paths for monorepos and nested instruction files. These examples are guidance for consuming projects; they are not installed in this workspace.

### Codex: AGENTS.md

Add a scoped instruction to the applicable `AGENTS.md`:

```markdown
Before UI work, read the project's DESIGN.md and the component or style files it references.
Apply its tokens and confirmed design choices within the requested scope.
Report conflicts and keep unresolved choices explicit.
```

Codex discovers its instruction files by name and directory scope. A reference asks the agent to read the design file; it does not automatically import that file's text. [Official discovery guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

### Claude Code: CLAUDE.md

Add an import to the applicable `CLAUDE.md`:

```markdown
For UI work, apply the design file and inspect the project files it references.

@DESIGN.md
```

The import path resolves relative to the `CLAUDE.md` that contains it. [Official memory guide](https://code.claude.com/docs/en/memory).

### Cursor: project rule

For a project that uses scoped rules, add `.cursor/rules/design.mdc`. Adapt the glob patterns to its actual UI paths:

```markdown
---
description: Project visual design and component guidance
globs: "src/**/*.tsx,src/**/*.jsx,src/**/*.vue,src/**/*.svelte,src/**/*.astro,src/**/*.css"
alwaysApply: false
---
Read the canonical DESIGN.md before UI changes.
Apply its tokens and confirmed design choices within the requested scope.
Inspect the component and style sources it references.

@DESIGN.md
```

Cursor also supports an applicable `AGENTS.md`. Choose a mechanism that fits the project and avoids repeated copies of the design rules. [Official rules guide](https://cursor.com/docs/rules).

## Check the customized file

Run the bundled profile validator from the installed plugin:

```sh
node /absolute/plugin/path/tools/zsd.mjs lint /absolute/project/path/DESIGN.md --strict --json
```

The CLI includes the pinned reference validator and the zero-slop-design rules. Node.js 22 or later is required; an installed plugin does not need npm. For source development, run `npm ci --ignore-scripts` and use `lintZsd(content)` from [the linter](../packages/zsd-lint/src/index.mjs).

Interpret results against [the profile](../spec/zsd-design-md.md). The upstream warning about `x-zsd` is an expected extension notice. The zero-slop-design wrapper suppresses that notice. Other findings still need attention.

Check that the developer's preferences are actually represented. Review applicable component states, responsive layouts, source paths, themes, and accessibility behavior. Record whether these checks covered only the document or also an implemented interface. A lint score does not establish those results.

## Extension and export behavior

`x-zsd` is a zero-slop-design namespace. The template uses it for intent, provenance, review, motion, borders, breakpoints, and accessibility values. Upstream tooling does not implement those choices or export them as core tokens.

The bundled resolver resolves extension references such as `{colors.primary}`. Core component references use the reference format's token groups. The CLI exports CSS, DTCG 2025.10 JSON, and Tailwind v4 theme CSS. Its mapping report identifies metadata and unsupported values. It refuses an incomplete export. Read [the tool guide](../README.md#local-tools) for output paths and mode selection.

Use the exact ordered core headings and the permitted extension headings from the profile. Additional detail belongs in `###` subsections. When importing a different convention, preserve its source and decisions while mapping its sections into this structure.
