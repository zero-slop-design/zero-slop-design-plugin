# Code checks

The `check-code` command compares source code with the resolved values in a design file.
It finds literal values and prohibited patterns.
It does not examine layout, computed contrast, component states, or visual quality.
Use `review-design-drift` and `review-accessibility` for those items.

## Command

```sh
node tools/zero-slop-design/zsd.mjs check-code DESIGN.md --config design-check.config.json
node tools/zero-slop-design/zsd.mjs check-code DESIGN.md --config design-check.config.json --update-known
```

The command reads the design file each time.
A change to the design file changes the permitted values without a new configuration.
Exit code 1 shows a new error.
With `--strict`, a new warning also gives exit code 1.

## Rules

| Rule | Default | Finding |
|---|---|---|
| `color-value` | error | A hexadecimal color that is not a token value in a color mode. |
| `color-function` | error | A color function, such as `rgb()` or `oklch()`, in source code. |
| `palette-class` | error | A utility palette class, such as `bg-blue-500`. |
| `dimension-value` | warning | A spacing, radius, font size, or letter spacing value that is not in its token group. |
| `font-family` | error | A font family that is not in the design typography. |
| `avoid-gradient` | error | A gradient, when `must-avoid` contains gradients. |
| `avoid-blur` | error | A background blur, when `must-avoid` contains glass or blur effects. |
| `avoid-emoji` | error | An emoji in markup, when `must-avoid` contains emoji. |
| `avoid-shadow` | error | A shadow, when `must-avoid` contains shadows. |
| `exception-reason` | error | An exception comment without a cause. |

The rules examine arbitrary utility values, such as `p-[13px]`. They do not examine utility scale classes, such as `p-4`.
The report lists each `must-avoid` item that the rules do not examine.
Record a manual inspection for these items.

## Configuration

`design-check.config.json` is a JSON file in the project root.

| Key | Contents |
|---|---|
| `root` | The source root, relative to the configuration file. |
| `known` | The path of the known defect list. |
| `ignore` | Path patterns to ignore. Use `*` for one path segment and `**` for many segments. |
| `ignoreDirectories` | Directory names to ignore in addition to the default names. |
| `extensions` | File extensions to examine. |
| `rules` | A severity for each rule: `error`, `warning`, or `off`. |

Ignore generated token files, third-party files, and the tool copy.
Do not ignore a path to hide a defect.

## Exception comments

An exception comment stops one rule on one line.
The comment must give a cause.

```tsx
// design-check-ignore-next-line color-value: example value shown as text, not a style
const sample = "#121212";
```

Put `design-check-ignore` on the same line, or `design-check-ignore-next-line` on the line before it.

## Known defect list

The known defect list records the findings that the project accepts at a specified time.
The command reports these findings, but they do not cause a failure.
A new finding causes a failure.
The report shows a known defect that the source code no longer contains.
Write the list again after each correction, so that the list becomes shorter.

## Tool copy

Put a copy of `zsd.mjs` and `spec-config.yaml` in `tools/zero-slop-design/` in the project.
Put a copy of `LICENSE` and `THIRD_PARTY_NOTICES.md` in the same directory.
Continuous integration then does the command without the plugin or an npm package.
Replace the copy when the plugin version changes, and record the version.
