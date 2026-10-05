---
name: create-design-md
description: "Write DESIGN.md from a design brief. Use when the project must have a design file with tokens and interface instructions."
---

# Design file

Read [Procedure data](../../references/procedure.md) before the task.
Read [Design format](../../references/design-format.md) for document changes.
Read [Technical terms](../../references/technical-terms.md) for skill language.

## Task

Make a design file from the approved design brief.

## Input

- Design brief or developer instructions.
- Target file path.
- Project components and style sources.

## Procedure

1. Read the design brief and project instructions.
2. Find the target design file and the project token source.
3. Keep applicable tokens and components from the project.
4. Use `../../templates/DESIGN.md` as the format example.
5. Replace example selections with source data.
6. Write values in YAML and their functions in the body.
7. Record the source method and source locations.
8. Record example or missing selections in `x-zsd.unresolved`.
9. Set `x-zsd.kind` to `project` and `x-zsd.review.status` to `draft`.
10. Write the target file.
11. Do the document checks from the procedure.

## Output

- A DESIGN.md file with design data, source locations, and unresolved items.

## Completed task

- Tokens resolve without circular references.
- The file records the developer selections.
- The result shows the document check area.
