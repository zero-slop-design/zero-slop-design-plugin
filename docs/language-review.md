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

## Inspection for 0.2.0

Date: 2026-10-06. Package: 0.2.0. Standard: ASD-STE100 Issue 9.

Area: `skills/enforce-design/SKILL.md`, its discovery description and agent interface text, `references/code-checks.md`, and seven new glossary terms: code check, known defect, known defect list, exception comment, continuous integration, package script, and finding.

- Used approved general verbs for each procedure step: read, do, correct, find, put, write, add, get, use, record, and show.
- Kept "baseline" for its typography meaning. The skill uses "known defect list" for accepted findings.
- Kept one instruction in each numbered step, procedure sentences at 20 words or fewer, and descriptive sentences at 25 words or fewer.
- Recorded what the code check does not examine, and did not claim design quality or accessibility conformance.

The selected automated checks pass. An authorized Issue 9 dictionary copy was not available for this inspection. The new text needs the dictionary inspection that the procedure above specifies before a claim of full conformance.
