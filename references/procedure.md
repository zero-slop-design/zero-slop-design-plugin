# Procedure data

## Before the task

1. Read the project instructions.
2. Find the target repository and target paths.
3. Read the design file and available design brief.
4. Record the task area and developer selections.
5. Keep project components and assets when applicable.
6. Get a developer decision if different instructions prevent the same task.
7. Record missing data as `unresolved`.
8. Give example values the status `proposed`.

The template contains example data. It does not set the developer selections.
Use interface text from the developer instructions.
Use ASD-STE100 Issue 9 for skill instructions.

## Document checks

The plugin root contains `tools/zsd.mjs`.
The command must have Node.js 22 or a subsequent version.
Resolve the plugin root from this reference path.
Find the installed plugin directory before the command.

```sh
node /absolute/plugin/path/tools/zsd.mjs lint /absolute/project/path/DESIGN.md --json
```

1. Do the lint command for a changed design file.
2. Correct format defects in the approved task area.
3. Record lint warnings that make a developer decision necessary.
4. Compare changed paths with the specified task.
5. Report the lint result and unresolved items.

The lint result includes selected document checks.
It does not show interface accessibility or full ASD-STE100 conformance.

## Source data

Record source paths or URLs and source dates for source data.
Record viewport, mode, route, and state for interface measured data.
Keep measured values apart from estimates.
A screenshot does not supply keyboard behavior or all component states.
Open external sources only with developer approval for access.

## Interface checks

Do not add or do tests unless the developer tells you to do tests.
Do only the interface checks with developer approval.
Record remaining checks and the cause of missing inspection area.
Do not show measured data that is not available as correct results.

## Task report

Show changed paths, recorded selections, checks, and unresolved items.
Include measured source data with each defect in the report.
Record if the task includes the document or the interface in operation.
