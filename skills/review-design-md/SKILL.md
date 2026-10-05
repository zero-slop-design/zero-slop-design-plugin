---
name: review-design-md
description: "Examine DESIGN.md for incorrect tokens, missing states, and different instructions for the same item. Use before interface implementation or after changes."
---

# Design file inspection

Read [Procedure data](../../references/procedure.md) before the task.
Read [Design format](../../references/design-format.md) for document changes.
Read [Technical terms](../../references/technical-terms.md) for skill language.

## Task

Examine a design file against its format and developer instructions.

## Input

- Target design file.
- Design brief and project instructions.
- Available implementation sources.

## Procedure

1. Read the target file and its source data.
2. Do the document checks from the procedure.
3. Compare the file with the design brief.
4. Find references to paths, tokens, components, and assets that are missing.
5. Examine theme pairs and component states.
6. Examine responsive behavior and accessibility instructions.
7. Compare instructions for the same item.
8. Record each defect with its location, effect, and necessary correction.
9. Divide document defects from items for which interface measured data is necessary.
10. Show the inspection area and unresolved items.

## Output

- An inspection report with defects, locations, corrections, and inspection area.

## Completed task

- Each defect has source data.
- The report gives the items for which developer decisions are necessary.
- Do not change the design file unless the developer tells you to correct it.
