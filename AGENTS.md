# Repository instructions

Read README.md, spec/zsd-design-md.md, and references/authoring.md before changes. Keep the product name `zero-slop-design`. The reference validator is an implementation dependency.

All natural language in SKILL.md, skill discovery descriptions, agent prompts, and shared skill instructions must use ASD-STE100 Issue 9. Use the approved dictionary meanings and parts of speech. Use technical terms only in their documented categories and meanings. Update references/technical-terms.json and docs/language-review.md with language changes. Never commit a copy of the ASD dictionary or standard.

Keep developer selections and project components. The template is an example. Mark proposals and missing data explicitly. Do not claim a lint score proves design quality, accessibility conformance, or full STE conformance.

The package must work from an installed plugin folder without npm. Rebuild tools/zsd.mjs after source changes. Keep manifests, catalogue, version, and bundled resource paths consistent. Use npm run validate for package checks. Do not add or run tests unless the user asks.

Do not read or publish workspace files outside this repository as plugin resources.
