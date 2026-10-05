# Design format

Read [the specification](../spec/zsd-design-md.md) for the full profile.
Use [the template](../templates/DESIGN.md) for example syntax.

## YAML data

Use `version: alpha` and `x-zsd.profile: "0.1"`.
Give the file a name and a short description.
Use `colors`, `typography`, `spacing`, `rounded`, and `components` for primary tokens.
Use `x-zsd` for design intent, sources, modes, and other extensions.

Use uppercase hexadecimal notation for colors.
Use font weights as numbers and unitless line heights.
Use pixel values for spacing and radius tokens.
Use token references for component colors.
Keep the necessary primary, surface, headline, body, and label roles.

## Body

Use one level 1 heading with the same text as `name`.
Use these level 2 headings in this sequence:

1. `Overview`
2. `Colors`
3. `Typography`
4. `Layout`
5. `Elevation & Depth`
6. `Shapes`
7. `Components`
8. `Do's and Don'ts`

Add these extension headings after the primary headings when applicable:

1. `Motion`
2. `Iconography`
3. `Imagery`
4. `Accessibility`

Put other content divisions in level 3 headings.

Write values only in YAML.
Write functions, conditions, and instructions in the body.
Use token names in code format before each token description.
Give each component family a level 3 heading.
Start each item in `Do's and Don'ts` with `Do` or `Do not`.

Keep the body to 1,200 words or less and the file to 24 KiB or less.

## Metadata

Use `kind: project` for a project file.
Use `source.method: authored`, `generated`, or `hybrid`.
For source data, record a source URL or source paths.
Record the source date when applicable.

Use `review.status: draft` until the specified inspection is completed.
Record the inspection date and inspection area with `review.status: reviewed`.
Do not mark unresolved design selections as approved.
Keep the primary token source and component paths in `implementation`.

## Tools

Use the plugin CLI for document and token operations.
Operate `help` for command syntax.
Use full plugin and project paths.

Use `diff` to compare YAML data before and after a change.
Use `drift` to compare measured observations with resolved design data.
Read [Observation data](observations.md) before a design drift comparison.
Use `export` for CSS, DTCG 2025.10 JSON, or Tailwind v4 theme data.
Use `--mode` only with a mode that the design file contains.
