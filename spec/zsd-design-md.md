# zero-slop-design DESIGN.md specification

Version: 0.1 (draft)
Status: Draft. Breaking changes can occur before 1.0.
Revised: 2026-10-05. This revision adds local-source provenance, metadata checks, and the plugin tools.

This document defines the zero-slop-design requirements for DESIGN.md files. The plugin marketplace provides skills that help developers define, apply, and maintain their design choices. Each marketplace skill MUST use ASD-STE100, as specified in §9.

The [published DESIGN.md formats](../docs/design-md-standard.md) inform interoperability. The current linter uses a pinned reference validator. Its implementation dependency does not define the product's name or skill catalogue.

MUST and MUST NOT state requirements. CAN states an allowed choice. This document uses the normative meanings of MUST and MUST NOT in RFC 2119 and RFC 8174.

The reusable starter is [templates/DESIGN.md](../templates/DESIGN.md). Installation and customization are in the [template guide](../docs/template-guide.md). The [research notes](../docs/design-md-standard.md) explain the source formats and their limits.

## 1. Goals

1. An agent can find the design choices and apply them without inventing the visual identity.
2. Each fact occurs one time. Values are in the front matter. Rules and reasons are in the prose.
3. A machine checks structure and token values. Review covers preferences, rationale, and the resulting interface.
4. The prose uses short instructions and consistent terms. Writing checks take inspiration from ASD-STE100.
5. A template captures the developer's choices. Its example style is not a required zero-slop-design visual identity.

## 2. Format validation and compatibility

- **ZSD-C1.** The file MUST pass `npx --yes @google/design.md@0.4.0 lint DESIGN.md` with 0 errors. Record the validator version.
- **ZSD-C2.** The file MUST NOT cause reference-validator warnings. Exception: the `token-like-ignored` warning for the `x-zsd` key.
- **ZSD-C3.** Profile extensions MUST be in the `x-zsd` key in the front matter, or in the extension sections in §5.3. Other top-level keys are not permitted.

## 3. Front matter

### 3.1 Required keys

```yaml
version: alpha
name: Acme Console
description: Dense dashboard UI for operations staff. Neutral surfaces, one blue accent.
x-zsd:
  profile: "0.1"
  source:
    url: https://acme.example
    captured: 2026-10-05
    method: generated   # generated | authored | hybrid
colors: { ... }
typography: { ... }
spacing: { ... }
rounded: { ... }
components: { ... }
```

- **ZSD-F1.** `name` and `description` MUST be nonempty strings. `x-zsd.profile` MUST equal the supported profile version, `"0.1"`. YAML MUST have a mapping root and no duplicate keys or circular aliases.
- **ZSD-F2.** `description` MUST be one or two sentences and 25 words or fewer.
- **ZSD-F3.** `x-zsd.source.method` MUST be `authored`, `generated`, or `hybrid`. A generated or hybrid source MUST have an HTTP(S) `url` or a nonempty `paths` list. Each path MUST be a nonempty string that identifies actual source data. Record the capture date when applicable. Local code and supplied screenshots do not need an invented URL.
- **ZSD-F4.** `colors`, `typography`, `spacing` and `rounded` MUST be present. An unused group can occur in `omitted`, with a `reason`. Required color roles in ZSD-T3 still apply. Keep the core body section and explain the omission.

### 3.2 Token names

- **ZSD-T1.** Token names MUST use kebab-case: `body-md`, not `bodyMd`.
- **ZSD-T2.** Color values MUST use `#RRGGBB` or `#RRGGBBAA` in uppercase.
- **ZSD-T3.** These color tokens MUST be present: `primary`, `on-primary`, `surface`, `on-surface`.
- **ZSD-T4.** For each color `X` that has a token `on-X`, the contrast between `X` and `on-X` MUST be 4.5:1 or more. This profile uses the ordinary-text threshold for these pairs. It does not establish WCAG conformance for an interface. Review alpha colors against their actual surface.
- **ZSD-T5.** These typography tokens MUST be present: one `headline-*`, `body-md` and one `label-*`.
- **ZSD-T6.** `fontWeight` MUST be a finite number between 1 and 1000. `lineHeight` MUST be a finite positive unitless number.
- **ZSD-T7.** `spacing` and `rounded` values MUST be nonnegative `px` strings, including `0px` for zero.
- **ZSD-T8.** Token references MUST resolve. Components MUST use references, not literal colors.

### 3.3 Extension tokens in `x-zsd`

The Google alpha schema has no dedicated token groups for motion, shadows, borders, breakpoints or dark mode. Write these in `x-zsd`. All keys are optional. These groups are opaque zero-slop-design extensions for the upstream tooling. Do not claim that upstream exports implement them.

```yaml
x-zsd:
  motion:
    duration-fast: 120ms
    duration-base: 200ms
    easing-standard: cubic-bezier(0.2, 0, 0, 1)
  elevation:
    shadow-1: 0 1px 2px #0000001A
    shadow-2: 0 4px 12px #0000001F
  border:
    width-default: 1px
  breakpoints:
    md: 768px
    lg: 1200px
  modes:
    dark:
      colors:
        surface: "#121316"
        on-surface: "#E6E7EA"
```

- **ZSD-X1.** Each mode MUST have a kebab-case name and a `colors` mapping. Each key in `x-zsd.modes.<mode>.colors` MUST also be a key in `colors`. Mode colors MUST follow ZSD-T2.
- **ZSD-X2.** Rule ZSD-T4 also applies to each mode.

### 3.4 Intent and implementation metadata

The starter uses these optional keys in `x-zsd`:

| Key | Contents |
|---|---|
| `kind` | `starter`, `reference`, or `project`. A starter contains example choices. |
| `review` | `status`: `draft` or `reviewed`. Optional `reviewer`, `reviewed-on`, and `scope` record an actual review. |
| `intent` | Audience, primary task, desired character, density, theme, and references. |
| `preferences` | `must-use`, `must-avoid`, and `preserve` lists. State concrete design choices. |
| `implementation` | Canonical token source, component sources, style sources, font assets, image assets, and `checks` (the design code check configuration path). Use real project paths. |
| `unresolved` | Choices that need project context. Never present a proposed value as a confirmed preference. |
| `layout` | Named layout limits that the prose uses. |
| `accessibility` | Named target and focus values. These are design instructions, not a conformance certificate. |

Metadata records the status and source of a choice. The body explains its application. Refer to extension values by path. Core token references MUST remain resolvable by the Google validator. References within opaque extension data need the consumer's own resolver.

- **ZSD-M1.** A supplied `kind` MUST be `starter`, `reference`, or `project`. A supplied `review` MUST be a mapping with status `draft` or `reviewed`. A reviewed document MUST have `reviewed-on` and a nonempty `scope`. Supplied `unresolved` data and preference fields MUST be lists of nonempty strings. Preference keys MUST be `must-use`, `must-avoid`, or `preserve`.

The linter checks these field shapes and resolves token references, including extension references. It does not prove source paths exist in a separate project or prove that an inspection occurred. Review rules in §5.4 cover those facts.

## 4. Prose language: zero-slop-design writing checks

The prose MUST follow the rules below. They are zero-slop-design rules inspired by ASD-STE100 Issue 9. Their `STE-*` identifiers remain stable for the prototype linter. They are not ASD rule numbers. Full STE conformance needs its controlled dictionary and a complete review; this profile does not provide those checks. Regex findings are suggestions for review, not proof of grammatical correctness.

| Rule | Requirement | Severity |
|---|---|---|
| **STE-1** | A sentence in a list item or rule has 20 words or fewer. | error |
| **STE-2** | A sentence in a paragraph has 25 words or fewer. | error |
| **STE-3** | A paragraph has 6 sentences or fewer. | error |
| **STE-4** | Use the active voice. | warning |
| **STE-5** | Use the present tense. Do not use `will`, `would` or `shall`. | warning |
| **STE-6** | Use `must` for a requirement. Do not use `should`, `might` or `may`. | warning |
| **STE-7** | Do not use an `-ing` word after a preposition (`for creating`). Write a full clause. | warning |
| **STE-8** | A noun cluster has three words or fewer. (review) | info |
| **STE-9** | Do not use contractions. Exception: the heading `Do's and Don'ts`. | warning |
| **STE-10** | One word has one meaning. Use the term list in §6. | warning |

## 5. Body structure

### 5.1 Sections

- **ZSD-S1.** The body MUST contain the eight core sections, in this order, with these exact headings: `Overview`, `Colors`, `Typography`, `Layout`, `Elevation & Depth`, `Shapes`, `Components`, `Do's and Don'ts`. Do not use the alias headings.
- **ZSD-S2.** Extension sections come after `Do's and Don'ts`, in this order: `Motion`, `Iconography`, `Imagery`, `Accessibility`. All are optional.
- **ZSD-S3.** Other `##` headings are not permitted.
- **ZSD-S4.** A file can have one `#` heading. It MUST be the same as `name`.

### 5.2 Content rules

- **ZSD-B1. Values live in the front matter.** The prose MUST NOT contain a color value or a dimension that is also a token value. Refer to the token by name in code format: `` `primary` ``.
- **ZSD-B2. Each token has a purpose.** Each color token and each typography token MUST occur in the prose one time or more.
- **ZSD-B3. Token sections use bullets.** In `Colors`, `Typography` and `Shapes`, write one bullet for each token or token group. Start each bullet with the token name in code format, then a colon:
  `` - `primary`: Use for the main action on a screen. Use it one time on each screen. ``
- **ZSD-B4. Overview is short.** `Overview` MUST have 80 words or fewer.
- **ZSD-B5. Components use subsections.** In `Components`, write one `###` subsection for each component family in the front matter (`button`, `input`, `card`). Each family MUST have a subsection.
- **ZSD-B6. Rules are instructions.** Each item in `Do's and Don'ts` MUST start with `Do` or `Do not`. The section MUST have 5 items or more.
- **ZSD-B7. No slop words.** The prose MUST NOT contain the words in §6.2.
- **ZSD-B8. Size budget.** The body MUST have 1,200 words or fewer. The full file MUST be 24 KB or less.

### 5.3 Extension sections

- **Motion.** Durations, easing and the events that cause motion. Refer to the `x-zsd.motion` tokens. Write the reduced-motion behavior.
- **Iconography.** Icon set, stroke width, sizes and when to use an icon with no label.
- **Imagery.** Photo and illustration style, crop ratios and treatment.
- **Accessibility.** Focus indicator, minimum target size and contrast exceptions.

### 5.4 Design completeness and review

These rules require review. The current linter does not enforce them.

- **ZSD-R1. Intent.** State the audience, primary task, and desired visual character. Replace starter choices with the developer's choices.
- **ZSD-R2. Provenance.** Identify observed facts, proposed choices, and unresolved decisions. Source URLs do not imply brand approval.
- **ZSD-R3. Implementation.** List existing component and style sources when they exist. Reuse them within the requested scope. Do not invent paths.
- **ZSD-R4. Responsive behavior.** Describe content width, narrow layouts, overflow, and the point where a layout changes.
- **ZSD-R5. States.** Explain applicable hover, focus, pressed, disabled, loading, empty, error, and success behavior. State when a behavior does not apply.
- **ZSD-R6. Accessibility.** Describe keyboard behavior, focus, labels, error feedback, reduced motion, and the contrast pairs that users actually see.
- **ZSD-R7. Conflicts.** Report conflicts between the design file, existing assets, and the requested change. Keep unresolved choices explicit.
- **ZSD-R8. Review evidence.** Record the review's actual scope. A lint pass cannot mark preferences as reviewed or prove an interface matches them.

The core sections hold this guidance. Use `###` subsections for implementation, responsive behavior, and review checks. This preserves the permitted `##` headings.

## 6. Terms

### 6.1 Term list (STE-10)

Use the term in the left column. Do not use the terms in the right column.

| Use | Do not use |
|---|---|
| surface | canvas, backdrop, background layer |
| accent | highlight color, pop color |
| radius | roundness, curvature |
| shadow | glow, drop |
| label | caption text, micro-copy |
| action | CTA, call to action |
| state | variant (for hover, focus, pressed) |

### 6.2 Slop words (ZSD-B7)

These words describe a feeling, not a rule. An agent cannot use them to make a decision.

`seamless`, `seamlessly`, `elevate`, `elevated` (not in `Elevation & Depth`), `sleek`, `stunning`, `vibrant`, `delightful`, `cutting-edge`, `world-class`, `robust`, `sophisticated`, `premium`, `effortless`, `immersive`, `harmonious`, `evokes`, `curated`, `bespoke`, `timeless`, `crisp`, `clean` (as an adjective), `modern`, `elegant`, `beautiful`, `intuitive`, `unleash`, `empower`, `next-level`, `game-changing`.

The em dash (`—`) is also not permitted. Use a period or a colon.

## 7. Conformance levels

| Level | Requirement |
|---|---|
| **ZSD Valid** | 0 errors |
| **ZSD Clean** | 0 errors and 0 warnings |

These are automated report levels, not full-profile certifications. Some MUST requirements produce warnings in the prototype. Other requirements need review. A file with 0 errors does not establish that all requirements are satisfied.

The linter gives a score from 0 to 100: `100 − (10 × errors) − (2 × warnings)`, with a minimum of 0. If the marketplace shows this score, label it as a lint score. Show the rule findings and validator versions. Keep design completeness, user review, and implemented-interface checks separate.

## 8. Notices

ASD-STE100 is a trademark of ASD (AeroSpace, Security and Defence Industries Association of Europe). The project is not endorsed by ASD. The DESIGN.md linter checks selected writing practices. The full ASD-STE100 requirement for marketplace skill instructions is in §9.

## 9. Marketplace skill writing standard

Every marketplace skill MUST use ASD-STE100 Issue 9 for its authored human-readable instructions. This requirement includes descriptions, procedures, and supporting instructions. The prose checks in §4 do not replace this requirement.

- Use the standard's writing rules and approved dictionary.
- Use each approved word with its approved meaning and part of speech.
- Define subject terms as technical nouns or technical verbs under the applicable ASD-STE100 categories.
- Maintain a shared glossary for design terms. Give each term one defined meaning.
- Preserve required identifiers, file paths, code, and external quotations. Apply STE to the explanations that accompany them.
- Record the standard issue and the language review for each released skill.

Each skill MUST state its purpose, trigger, required inputs, procedure, output, and completion criteria. It MUST explain how to report missing information and unresolved design choices.

Skill instructions use STE. User interface text follows the project's content rules. Skill language review and design review are separate records.

Source: [ASD-STE100 Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf) and [ASD's description of the rules and dictionary](https://www.asd-ste100.org/about_STE.html).
