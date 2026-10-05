---
name: export-design-tokens
description: "Export DESIGN.md tokens as CSS, DTCG JSON, or Tailwind theme data. Use to connect design values to a project token source."
---

# Design token export

Read [Procedure data](../../references/procedure.md) before the task.
Read [Design format](../../references/design-format.md) for document changes.
Read [Technical terms](../../references/technical-terms.md) for skill language.

## Task

Make token output for the specified project format.

## Input

- Design file.
- Output format and target path.
- Target tool version and applicable mode.

## Procedure

1. Read the design file and target tool data.
2. Do the document checks from the procedure.
3. Get the output format and mode from the developer or project instructions.
4. Use `export` with `css`, `dtcg`, or `tailwind`.
5. Read the export report for unsupported data.
6. Stop if the export cannot include a necessary token.
7. Keep the source file as the primary token source.
8. Compare output values with resolved source values.
9. Record the token mapping and the target format version.
10. Show the output path and data that the target format does not include.

## Output

- Token output and a mapping report.

## Completed task

- All exported references resolve.
- The report identifies metadata and unsupported values.
- Do not overwrite a target file without developer approval.
