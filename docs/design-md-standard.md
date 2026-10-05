# DESIGN.md standards and conventions

Researched: 2026-10-05. Sources are linked beside the findings they support.

zero-slop-design standardizes DESIGN.md files and provides design workflows through a plugin marketplace of skills. Every skill uses ASD-STE100. External specifications inform interoperability and implementation. The product defines its own requirements for design choices, completeness, and review.

## What exists

| Format or convention | Status and purpose | Decision for zero-slop-design |
|---|---|---|
| Google Labs DESIGN.md | Published alpha specification for visual identity, tokens, and design rationale. Optional YAML front matter and ordered Markdown sections. | Support compatibility and use its validator as an implementation dependency. Pin its version because the specification is still a draft. |
| Google Stitch `design-md` skill | A separate, prose-oriented convention with five numbered sections and values in the body. Its output structure differs from the alpha specification. | Accept as an import source; normalize headings and extract tokens before claiming alpha compatibility. |
| DTCG Design Tokens Format 2025.10 | A stable Community Group specification for exchanging typed tokens in JSON. It is not a W3C Standard or a DESIGN.md specification. | Use for token exports, with explicit conversion and validation. |
| Community DESIGN.md collections | Examples and extraction services, with different structures and levels of detail. | Treat each file as an input that needs inspection. A collection listing is not proof of conformance. |
| Harness instruction files | `AGENTS.md`, `CLAUDE.md`, and Cursor rules control how an agent discovers project guidance. | Provide a small adapter that points to one canonical design file. |
| Kiro `design.md` | A technical architecture document within a feature specification. | Keep it distinct from the visual design file. Account for case-insensitive filesystems when choosing paths. |

Sources: [Google's specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md), [Google's Stitch skill](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-utilities/skills/design-md/SKILL.md), [DTCG format](https://www.designtokens.org/tr/2025.10/format/), [VoltAgent's collection](https://github.com/VoltAgent/awesome-design-md), [Kiro specs](https://kiro.dev/docs/specs/).

The sources show an emerging ecosystem with multiple conventions. They do not establish one format that every coding harness automatically discovers or enforces. zero-slop-design's interoperability rules are a product decision based on this research.

## Published DESIGN.md structure

The front matter holds normative token values. The body explains their purpose and application. Present core sections follow this order:

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

Google permits omitted sections, aliases for some headings, and additional sections. Duplicate section headings are errors. Token groups cover `colors`, `typography`, `spacing`, `rounded`, and `components`; references use `{path.to.token}`. Color values can use CSS formats. Dimensions accept `px`, `em`, and `rem`. Recommended names are not a universal naming requirement. [Specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md).

zero-slop-design deliberately requires the eight exact headings, machine-readable values, semantic roles, and a smaller writing budget. Those are additional profile requirements. They must be labeled as zero-slop-design requirements when the marketplace explains a finding.

## Tooling and version evidence

At research time, the published `@google/design.md` package is **0.4.0**, and the specification identifies itself as **alpha**. The last change to `docs/spec.md` is commit `961439fc064335fea10f165e022b10e6e5182e95`, dated 2026-07-27. These are a research snapshot, not a promise about future releases. [Package manifest](https://github.com/google-labs-code/design.md/blob/main/packages/cli/package.json), [specification history](https://github.com/google-labs-code/design.md/commits/main/docs/spec.md).

The CLI provides linting, comparison, and exports for CSS variables, Tailwind, and DTCG tokens. Reports need the package version, profile version, findings, and checked file revision. Export compatibility needs its own check, particularly for namespaced extensions. [Reference tooling](https://github.com/google-labs-code/design.md).

Use the pinned validator rather than an unversioned package command:

```sh
npx --yes @google/design.md@0.4.0 lint DESIGN.md
```

## DTCG is a separate format

Google borrows token grouping and reference ideas from DTCG; its YAML schema is not DTCG JSON. DTCG uses properties such as `$type` and `$value`, with defined representations for colors and dimensions. A file is not DTCG conformant just because it contains braces or is named `tokens.json`. [DTCG format](https://www.designtokens.org/tr/2025.10/format/).

Keep the readable design file canonical for design intent. Generate token artifacts from it, record the converter version, and check the resulting artifact. zero-slop-design extension data needs a documented mapping or a report that identifies what the export leaves out.

## How coding harnesses load the file

| Harness | Documented mechanism | Suggested marketplace adapter |
|---|---|---|
| Codex | Discovers `AGENTS.override.md`, `AGENTS.md`, and configured fallback names. Unlisted filenames are not instruction files by default. | Add an instruction to the applicable `AGENTS.md` that tells the agent to read the design file before UI work. |
| Claude Code | Loads `CLAUDE.md`; `@path/to/import` expands another file into context. | Add `@DESIGN.md` to the applicable project `CLAUDE.md`. |
| Cursor | Supports `AGENTS.md` and `.cursor/rules/*.mdc`, with explicit inclusion rules and file references. | Point a project instruction or scoped rule at the canonical file. |

Sources: [OpenAI's instruction discovery guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Claude Code memory and imports](https://code.claude.com/docs/en/memory), [Cursor rules](https://cursor.com/docs/rules).

An adapter helps load context. It does not make an agent's output conformant. Keep design values in one file and check the resulting interface against that file. Merge adapters into existing instructions within the requested scope; preserve the harness's instruction precedence.

## Quality and accessibility claims

Separate these results on a marketplace listing:

- **Format:** the pinned Google validator's result.
- **Profile:** the zero-slop-design linter's result, version, and individual findings.
- **Completeness:** coverage of preferences, responsive layouts, component states, assets, and implementation paths.
- **User review:** whether the design choices are draft or reviewed, with the review's actual scope.
- **Interface checks:** evidence from the implemented UI, including visual and accessibility checks when performed.

A lint score measures the checks that produced it. It cannot establish that the user likes the design, that every instruction is enforceable, or that the rendered UI meets WCAG.

WCAG 2.2 AA uses 4.5:1 for ordinary text and 3:1 for qualifying large text. Relevant non-text contrast is 3:1. Its minimum target criterion generally uses 24 CSS pixels, with specified exceptions. The template's 44-pixel control target is a zero-slop-design starter choice. [Text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

ASD-STE100 includes writing rules and a controlled dictionary. All marketplace skills must follow both, with a shared glossary for technical nouns and technical verbs. The current DESIGN.md linter uses only sentence limits and language heuristics; skill language review needs the full standard. See [the skill writing requirement](../spec/zsd-design-md.md#9-marketplace-skill-writing-standard) and [ASD's explanation](https://www.asd-ste100.org/about_STE.html).

## Changes to the zero-slop-design template

The [zero-slop-design starter template](../templates/DESIGN.md) uses the standard's core sections, metadata, and guidance for:

- Audience, primary task, desired character, and preferences that the developer can replace.
- Honest source provenance, draft review status, and unresolved decisions.
- Existing component, style, font, and asset locations without invented paths.
- Responsive behavior, interaction states, focus, reduced motion, and error feedback.
- Tokens as the value source, with short instructions in the body.

The palette and layout are example choices. Installing the template does not make those choices the user's preferences. The [template guide](template-guide.md) explains customization and harness adapters; the [profile](../spec/zsd-design-md.md) defines the additional requirements.

The plugin now includes dependency manifests and a bundled CLI. Generated and hybrid provenance accepts source URLs or local source paths. The linter checks selected review metadata and token references. Alpha color pairs produce a warning that requires the actual surface for measurement. Language checks remain heuristics; [the language inspection record](language-review.md) describes the authored skills and source limits. Document lint does not establish interface quality or accessibility conformance.
