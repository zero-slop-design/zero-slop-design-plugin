# Skill language inspection

Date: 2026-10-05. Package: 0.1.0. Standard: ASD-STE100 Issue 9.

## Area

The inspection includes all 13 SKILL.md files, discovery descriptions, agent interface text, and shared instructions in references/. The original technical glossary gives categories, meanings, parts of speech, and forms. Identifiers, paths, commands, data examples, and standard names keep their specified spelling.

README, research notes, and the DESIGN.md format specification are product documentation. The DESIGN.md starter uses the profile writing rules; it is not a claim that user interface copy must use STE.

## Work completed

- Examined vocabulary against the Issue 9 dictionary data, including approved meanings and parts of speech for procedure verbs.
- Replaced unapproved general verbs and meanings, including imperative check, create, review, preserve, specify, and update.
- Kept technical nouns in the software, interface design, and language/document fields.
- Limited technical verbs to named data processing operations; used approved general verbs for other instructions.
- Examined numbered instructions for one action per sentence, active voice, permitted verb forms, and consistent names.
- Checked procedure sentences at 20 words, descriptive sentences at 25 words, and paragraphs at six sentences.
- Recorded missing data, developer selections, estimates, inspection areas, and conformance limits explicitly.

## Source and reproducibility

The [ASD standard](https://www.asd-ste100.org/STE_downloads.html) is the authority. Its download was unavailable during this session. A private authoring inspection used Issue 9 transcriptions from [the vocabulary project](https://github.com/dfch/biz.dfch.AsdSte100Vocab) and [the rules project](https://github.com/dfch/biz.dfch.AsdSte100Rules). Those third-party transcriptions can contain errors. They were not copied into this plugin.

The package contains the original project glossary and selected writing checks. It does not contain the ASD dictionary, a complete grammar checker, or an independent STE certification. `npm run validate` repeats the selected automated checks; it cannot repeat the private dictionary inspection.

For language changes, inspect against an authorized Issue 9 copy, check word meaning and part of speech in context, update the glossary if a technical term is necessary, and record the new inspection here. Do not label automated word matching as proof of full conformance.
