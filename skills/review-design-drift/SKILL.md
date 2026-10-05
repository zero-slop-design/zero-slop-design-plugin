---
name: review-design-drift
description: "Compare an interface with DESIGN.md. Use to find differences in tokens, components, states, and responsive behavior."
---

# Design drift inspection

Read [Procedure data](../../references/procedure.md) before the task.
Read [Design format](../../references/design-format.md) for document changes.
Read [Technical terms](../../references/technical-terms.md) for skill language.

## Task

Find differences between an interface and its design file.

## Input

- Design file.
- Interface source paths or an available interface.
- Specified routes, states, viewports, and modes.

## Procedure

1. Read the design file and target interface data.
2. Record the inspection routes, states, viewports, and modes.
3. Get computed style values or source values for applicable items.
4. Compare these values with resolved design tokens.
5. Record each difference with the design path and interface location.
6. Divide approved differences from defects.
7. Use `drift` for a comparison when an observations file is available.
8. Examine layout, text hierarchy, assets, and interaction behavior in a different inspection.
9. Record missing states and missing measured data as `unresolved`.
10. Show the defects, source data, and inspection area.

## Output

- A drift report with measured differences and inspection area.

## Completed task

- Each difference has a design value and a measured value.
- The report does not show items without measured data as correct.
- Do not change the interface unless the developer tells you to correct it.
