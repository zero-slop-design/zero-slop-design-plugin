---
name: enforce-design
description: "Add design code checks from DESIGN.md to a project and its continuous integration. Use to stop changes with colors, sizes, fonts, or effects that the design file does not permit."
---

# Design code checks

Read [Procedure data](../../references/procedure.md) before the task.
Read [Code checks](../../references/code-checks.md) before the task.
Read [Design format](../../references/design-format.md) for document changes.
Read [Technical terms](../../references/technical-terms.md) for skill language.

## Task

Add design code checks to the project repository and its continuous integration.

## Input

- Design file.
- Project repository and its source paths.
- Continuous integration files, if they are available.
- Developer approval for continuous integration changes.

## Procedure

1. Read the design file and the project instructions.
2. Do the lint command for the design file.
3. Correct the design file defects before the next step.
4. Find the source paths, the style method, and the package manager.
5. Put a copy of `tools/zsd.mjs` and `tools/spec-config.yaml` in `tools/zero-slop-design/` in the project.
6. Put a copy of `LICENSE` and `THIRD_PARTY_NOTICES.md` in the same directory.
7. Write `design-check.config.json` with the source root and the paths to ignore.
8. Add generated token files and third-party files to the paths to ignore.
9. Do the `check-code` command and read each finding.
10. Correct the findings in the approved task area.
11. Get a developer decision for each finding that remains.
12. Add an exception comment with a cause for each approved exception.
13. Write the known defect list with `--update-known` for the findings that remain.
14. Add a package script that does the `check-code` command.
15. Get developer approval before you change continuous integration files.
16. Add the lint command and the `check-code` command to the continuous integration file.
17. Use the [continuous integration template](../../templates/ci/github-actions.yml) when the project has no continuous integration.
18. Record the configuration path in `x-zsd.implementation.checks`.
19. Do the `check-code` command again and record the result.
20. Show the changed paths, the checked rules, and the items that the code check does not examine.

## Output

- A tool copy, a configuration file, a known defect list, a package script, and a continuous integration step.

## Completed task

- The `check-code` command shows 0 errors for new source code.
- Each exception comment has a cause.
- The report shows the items that the code check does not examine.
- Do not claim that a code check result proves design quality or accessibility.
