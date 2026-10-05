// Zero Slop DESIGN.md linter.
// Runs the Google DESIGN.md linter, then the ZSD profile rules in spec/zsd-design-md.md.

import { lint as googleLint } from '@google/design.md/linter';
import { parseDesign, resolveValue } from '../../../src/design.mjs';

export const PROFILE_VERSION = '0.1';

const CORE_SECTIONS = [
  'Overview',
  'Colors',
  'Typography',
  'Layout',
  'Elevation & Depth',
  'Shapes',
  'Components',
  "Do's and Don'ts",
];
const EXTENSION_SECTIONS = ['Motion', 'Iconography', 'Imagery', 'Accessibility'];
const SECTION_ALIASES = {
  'Brand & Style': 'Overview',
  'Layout & Spacing': 'Layout',
  Elevation: 'Elevation & Depth',
};
const ALLOWED_TOP_LEVEL = new Set([
  'version', 'name', 'description', 'omitted',
  'colors', 'typography', 'rounded', 'spacing', 'components', 'x-zsd',
]);
const REQUIRED_COLORS = ['primary', 'on-primary', 'surface', 'on-surface'];
const REQUIRED_GROUPS = ['colors', 'typography', 'spacing', 'rounded'];

const SLOP_WORDS = [
  'seamless', 'seamlessly', 'elevate', 'elevated', 'sleek', 'stunning', 'vibrant',
  'delightful', 'cutting-edge', 'world-class', 'robust', 'sophisticated', 'premium',
  'effortless', 'effortlessly', 'immersive', 'harmonious', 'evokes', 'evoke', 'curated',
  'bespoke', 'timeless', 'crisp', 'clean', 'modern', 'elegant', 'beautiful', 'intuitive',
  'unleash', 'empower', 'next-level', 'game-changing',
];
const TERM_LIST = [
  // [pattern, use instead]
  [/\bcanvas\b/i, 'surface'],
  [/\bbackdrop\b/i, 'surface'],
  [/\bbackground layer\b/i, 'surface'],
  [/\bhighlight colou?r\b/i, 'accent'],
  [/\bpop colou?r\b/i, 'accent'],
  [/\broundness\b/i, 'radius'],
  [/\bcurvature\b/i, 'radius'],
  [/\bglow\b/i, 'shadow'],
  [/\bdrop[- ]shadow\b/i, 'shadow'],
  [/\bcaption text\b/i, 'label'],
  [/\bmicro-?copy\b/i, 'label'],
  [/\bCTAs?\b/, 'action'],
  [/\bcall[- ]to[- ]action\b/i, 'action'],
];
// Nouns that end in -ing. STE-7 does not flag these.
const ING_NOUNS = new Set([
  'spacing', 'padding', 'heading', 'headings', 'setting', 'settings', 'rounding', 'string',
  'thing', 'things', 'nothing', 'something', 'anything', 'everything', 'kerning', 'tracking',
  'leading', 'easing', 'timing', 'branding', 'rendering', 'loading', 'landing', 'onboarding',
  'pricing', 'rating', 'routing', 'ring', 'during', 'morning', 'evening', 'writing',
  'building', 'drawing', 'opening', 'housing', 'shading', 'lining', 'listing', 'listings',
  'wording', 'meaning', 'warning', 'warnings', 'heading-lg', 'spring', 'king', 'wing',
]);

const PASSIVE = /\b(is|are|was|were|be|been|being|get|gets)\s+(\w+ly\s+)?(\w+ed|made|set|built|shown|done|given|kept|held|put|laid|written|seen|known|drawn|hidden|chosen|broken|taken)\b/i;
const FUTURE = /\b(will|would|shall)\b|\w'll\b/i;
const WEAK_MODAL = /\b(should|might|may|ought)\b/i;
const ING_AFTER_PREP = /\b(for|by|of|in|on|with|without|after|before|about|from|to)\s+(\w+ing)\b/gi;
const CONTRACTION = /\b\w+(n't|'re|'ve|'ll|'d|'m)\b|\b(it|that|there|what|let|here|who)'s\b/gi;

/**
 * Lint a DESIGN.md document against the ZSD profile.
 * @param {string} content
 * @returns {{ findings: Array<{rule:string,severity:'error'|'warning'|'info',message:string,path?:string,line?:number}>, summary: {errors:number,warnings:number,infos:number}, score:number, level:'clean'|'valid'|'invalid', profile:string }}
 */
export function lintZsd(content) {
  const findings = [];
  const add = (rule, severity, message, extra = {}) =>
    findings.push({ rule, severity, message, ...extra });

  // ── Front matter ─────────────────────────────────────────
  let fm;
  let tokens = {};
  try {
    fm = parseDesign(content);
    tokens = fm.tokens;
  } catch (e) {
    add('ZSD-F1', 'error', e.message);
    return { profile: PROFILE_VERSION, level: 'invalid', score: 90, summary: { errors: 1, warnings: 0, infos: 0 }, findings };
  }
  const body = fm ? fm.body : content;
  const bodyLineOffset = fm ? fm.bodyLine : 0;

  // ── ZSD-C1, ZSD-C2: Google linter ────────────────────────
  try {
    const report = googleLint(content);
    for (const f of report.findings) {
      if (f.severity === 'info') continue;
      if (f.rule === 'token-like-ignored' && f.path === 'x-zsd') continue;
      const rule = f.severity === 'error' ? 'ZSD-C1' : 'ZSD-C2';
      add(rule, f.severity, `Reference validator (${f.rule}): ${f.message}`, f.path ? { path: f.path } : {});
    }
  } catch (e) {
    add('ZSD-C1', 'error', `The reference validator cannot parse the file: ${e.message}`);
  }

  // ── ZSD-C3: top-level keys ───────────────────────────────
  for (const key of Object.keys(tokens)) {
    if (!ALLOWED_TOP_LEVEL.has(key)) {
      add('ZSD-C3', 'error', `Top-level key "${key}" is not permitted. Move it into "x-zsd".`, { path: key });
    }
  }

  // ── ZSD-F*: required keys ────────────────────────────────
  const xzsd = isObject(tokens['x-zsd']) ? tokens['x-zsd'] : {};
  if (typeof tokens.name !== 'string' || !tokens.name.trim()) add('ZSD-F1', 'error', 'Add a nonempty "name" string.', { path: 'name' });
  if (typeof tokens.description !== 'string' || !tokens.description.trim()) add('ZSD-F1', 'error', 'Add a nonempty "description" string.', { path: 'description' });
  if (!xzsd.profile) add('ZSD-F1', 'error', `Add "x-zsd.profile: \\"${PROFILE_VERSION}\\"".`, { path: 'x-zsd.profile' });
  if (xzsd.profile && xzsd.profile !== PROFILE_VERSION) add('ZSD-F1', 'error', `Use profile "${PROFILE_VERSION}".`, { path: 'x-zsd.profile' });
  if (typeof tokens.description === 'string') {
    const sentences = splitSentences(tokens.description);
    const words = countWords(tokens.description);
    if (words > 25 || sentences.length > 2) {
      add('ZSD-F2', 'error', `"description" has ${words} words and ${sentences.length} sentences. The limit is 25 words and 2 sentences.`, { path: 'description' });
    }
  }
  const method = xzsd.source?.method;
  if (!['authored', 'generated', 'hybrid'].includes(method)) add('ZSD-F3', 'error', 'Use source method authored, generated, or hybrid.', { path: 'x-zsd.source.method' });
  const sourceURL = typeof xzsd.source?.url === 'string' && /^https?:\/\/\S+$/.test(xzsd.source.url);
  const sourcePaths = Array.isArray(xzsd.source?.paths) && xzsd.source.paths.length > 0 && xzsd.source.paths.every((p) => typeof p === 'string' && p.trim());
  if ((method === 'generated' || method === 'hybrid') && !sourceURL && !sourcePaths) {
    add('ZSD-F3', 'error', 'Extracted data needs a source URL or a nonempty source paths list.', { path: 'x-zsd.source' });
  }
  if (xzsd.kind !== undefined && !['starter','reference','project'].includes(xzsd.kind)) add('ZSD-M1','error','Use kind starter, reference, or project.',{path:'x-zsd.kind'});
  if (xzsd.review !== undefined) {
    if (!isObject(xzsd.review) || !['draft','reviewed'].includes(xzsd.review.status)) add('ZSD-M1','error','Use review status draft or reviewed.',{path:'x-zsd.review'});
    else if (xzsd.review.status === 'reviewed' && (!/^\d{4}-\d{2}-\d{2}$/.test(xzsd.review['reviewed-on'] ?? '') || typeof xzsd.review.scope !== 'string' || !xzsd.review.scope.trim())) add('ZSD-M1','error','A reviewed document needs reviewed-on and scope.',{path:'x-zsd.review'});
  }
  if (xzsd.unresolved !== undefined && (!Array.isArray(xzsd.unresolved) || !xzsd.unresolved.every((v) => typeof v === 'string' && v.trim()))) add('ZSD-M1','error','Use a list of nonempty strings for unresolved data.',{path:'x-zsd.unresolved'});
  if (xzsd.preferences !== undefined && !isObject(xzsd.preferences)) add('ZSD-M1','error','Preferences must be a mapping.',{path:'x-zsd.preferences'});
  for (const [key, value] of Object.entries(xzsd.preferences ?? {})) {
    if (!['must-use','must-avoid','preserve'].includes(key) || !Array.isArray(value) || !value.every((v) => typeof v === 'string' && v.trim())) add('ZSD-M1','error','Preference fields need lists of nonempty strings.',{path:`x-zsd.preferences.${key}`});
  }
  if (tokens.omitted !== undefined && (!Array.isArray(tokens.omitted) || !tokens.omitted.every((o) => isObject(o) && typeof o.section === 'string' && typeof o.reason === 'string' && o.reason.trim()))) add('ZSD-F4','error','Each omitted group needs section and reason.',{path:'omitted'});
  try { resolveValue(tokens, tokens); } catch (e) { add('ZSD-T8','error',e.message); }
  const omitted = new Set(
    (Array.isArray(tokens.omitted) ? tokens.omitted : []).map((o) => (typeof o === 'string' ? o : o?.section)),
  );
  for (const group of REQUIRED_GROUPS) {
    if (!isObject(tokens[group]) && !omitted.has(group)) {
      add('ZSD-F4', 'error', `Add "${group}" tokens, or write "${group}" in "omitted" with a reason.`, { path: group });
    }
  }

  // ── ZSD-T*: tokens ───────────────────────────────────────
  const colors = isObject(tokens.colors) ? tokens.colors : {};
  const typography = isObject(tokens.typography) ? tokens.typography : {};
  const components = isObject(tokens.components) ? tokens.components : {};

  const kebabGroups = {
    colors, typography, components,
    spacing: tokens.spacing, rounded: tokens.rounded,
    'x-zsd.motion': xzsd.motion, 'x-zsd.elevation': xzsd.elevation,
    'x-zsd.border': xzsd.border, 'x-zsd.breakpoints': xzsd.breakpoints,
  };
  for (const [group, map] of Object.entries(kebabGroups)) {
    if (!isObject(map)) continue;
    for (const key of Object.keys(map)) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
        add('ZSD-T1', 'error', `Token "${key}" is not kebab-case.`, { path: `${group}.${key}` });
      }
    }
  }
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value !== 'string' || !/^#[0-9A-F]{6}([0-9A-F]{2})?$/.test(value)) {
      add('ZSD-T2', 'error', `Color "${key}" is "${value}". Use uppercase #RRGGBB or #RRGGBBAA.`, { path: `colors.${key}` });
    }
  }
  for (const key of REQUIRED_COLORS) {
    if (!(key in colors)) add('ZSD-T3', 'error', `Add the color token "${key}".`, { path: `colors.${key}` });
  }
  checkOnPairs(colors, 'colors', add);

  const typeKeys = Object.keys(typography);
  if (isObject(tokens.typography) || !omitted.has('typography')) {
    if (!typeKeys.some((k) => k.startsWith('headline-'))) add('ZSD-T5', 'error', 'Add a "headline-*" typography token.', { path: 'typography' });
    if (!typeKeys.includes('body-md')) add('ZSD-T5', 'error', 'Add the "body-md" typography token.', { path: 'typography.body-md' });
    if (!typeKeys.some((k) => k.startsWith('label-'))) add('ZSD-T5', 'error', 'Add a "label-*" typography token.', { path: 'typography' });
  }
  for (const [key, t] of Object.entries(typography)) {
    if (!isObject(t)) continue;
    if ('fontWeight' in t && (!Number.isFinite(t.fontWeight) || t.fontWeight < 1 || t.fontWeight > 1000)) {
      add('ZSD-T6', 'error', `"fontWeight" of "${key}" must be a number.`, { path: `typography.${key}.fontWeight` });
    }
    if ('lineHeight' in t && (!Number.isFinite(t.lineHeight) || t.lineHeight <= 0)) {
      add('ZSD-T6', 'error', `"lineHeight" of "${key}" must be a unitless number.`, { path: `typography.${key}.lineHeight` });
    }
  }
  for (const group of ['spacing', 'rounded']) {
    if (!isObject(tokens[group])) continue;
    for (const [key, value] of Object.entries(tokens[group])) {
      const ok = typeof value === 'string' && /^\d+(\.\d+)?px$/.test(value);
      if (!ok) add('ZSD-T7', 'error', `"${group}.${key}" is "${value}". Use a nonnegative px value.`, { path: `${group}.${key}` });
    }
  }
  for (const [name, props] of Object.entries(components)) {
    if (!isObject(props)) continue;
    for (const prop of ['backgroundColor', 'textColor']) {
      const v = props[prop];
      if (typeof v === 'string' && !/^\{.+\}$/.test(v.trim())) {
        add('ZSD-T8', 'error', `"components.${name}.${prop}" is a literal value. Use a token reference such as "{colors.primary}".`, { path: `components.${name}.${prop}` });
      }
    }
  }

  // ── ZSD-X*: modes ────────────────────────────────────────
  if (isObject(xzsd.modes)) {
    for (const [mode, def] of Object.entries(xzsd.modes)) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(mode) || !isObject(def) || !isObject(def.colors)) {
        add('ZSD-X1','error','Each named mode needs a colors mapping.',{path:`x-zsd.modes.${mode}`});
        continue;
      }
      const modeColors = isObject(def?.colors) ? def.colors : {};
      for (const [key,value] of Object.entries(modeColors)) {
        if (typeof value !== 'string' || !/^#[0-9A-F]{6}([0-9A-F]{2})?$/.test(value)) add('ZSD-X1','error','Mode colors need uppercase hexadecimal values.',{path:`x-zsd.modes.${mode}.colors.${key}`});
        if (!(key in colors)) {
          add('ZSD-X1', 'error', `"x-zsd.modes.${mode}.colors.${key}" has no matching key in "colors".`, { path: `x-zsd.modes.${mode}.colors.${key}` });
        }
      }
      checkOnPairs({ ...colors, ...modeColors }, `x-zsd.modes.${mode}.colors`, add, 'ZSD-X2');
    }
  }

  // ── Body ─────────────────────────────────────────────────
  const doc = parseBody(body, bodyLineOffset);

  // ZSD-S*: sections
  const h2 = doc.headings.filter((h) => h.level === 2);
  const seen = new Set();
  for (const h of h2) {
    if (seen.has(h.text)) add('ZSD-S1', 'error', `Section "${h.text}" occurs more than one time.`, { line: h.line });
    seen.add(h.text);
    if (SECTION_ALIASES[h.text]) {
      add('ZSD-S1', 'error', `Use the heading "${SECTION_ALIASES[h.text]}", not the alias "${h.text}".`, { line: h.line });
    } else if (!CORE_SECTIONS.includes(h.text) && !EXTENSION_SECTIONS.includes(h.text)) {
      add('ZSD-S3', 'error', `Section "${h.text}" is not permitted. Permitted extension sections: ${EXTENSION_SECTIONS.join(', ')}.`, { line: h.line });
    }
  }
  for (const s of CORE_SECTIONS) {
    if (!seen.has(s)) add('ZSD-S1', 'error', `Add the section "## ${s}".`);
  }
  const order = [...CORE_SECTIONS, ...EXTENSION_SECTIONS];
  const present = h2.map((h) => h.text).filter((t) => order.includes(t));
  for (let i = 1; i < present.length; i++) {
    if (order.indexOf(present[i]) < order.indexOf(present[i - 1])) {
      const rule = EXTENSION_SECTIONS.includes(present[i]) || EXTENSION_SECTIONS.includes(present[i - 1]) ? 'ZSD-S2' : 'ZSD-S1';
      add(rule, 'error', `Section "${present[i]}" must come before "${present[i - 1]}".`);
    }
  }
  const h1 = doc.headings.filter((h) => h.level === 1);
  if (h1.length !== 1) add('ZSD-S4', 'error', 'Use exactly one "#" heading.');
  if (h1.length === 1 && tokens.name && h1[0].text !== tokens.name) {
    add('ZSD-S4', 'error', `The "#" heading "${h1[0].text}" is not the same as name "${tokens.name}".`, { line: h1[0].line });
  }

  // ZSD-B1: values in prose
  const tokenValues = new Set();
  for (const group of ['spacing', 'rounded']) {
    if (isObject(tokens[group])) Object.values(tokens[group]).forEach((v) => typeof v === 'string' && tokenValues.add(v.toLowerCase()));
  }
  for (const t of Object.values(typography)) {
    if (isObject(t) && typeof t.fontSize === 'string') tokenValues.add(t.fontSize.toLowerCase());
  }
  for (const unit of doc.units) {
    const hexes = unit.raw.match(/#[0-9a-f]{3,8}\b/gi);
    if (hexes) {
      add('ZSD-B1', 'warning', `Prose contains color value ${hexes.join(', ')}. Refer to the token name.`, { line: unit.line });
    }
    const dims = (unit.raw.match(/\b\d+(\.\d+)?(px|rem|em)\b/gi) ?? []).filter((d) => tokenValues.has(d.toLowerCase()));
    if (dims.length) {
      add('ZSD-B1', 'warning', `Prose repeats token value ${[...new Set(dims)].join(', ')}. Refer to the token name.`, { line: unit.line });
    }
  }

  // ZSD-B2: each color and typography token occurs in the prose
  const proseCode = new Set(doc.units.flatMap((u) => [...u.raw.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim())));
  const proseText = doc.units.map((u) => u.raw).join('\n');
  for (const [group, map] of [['colors', colors], ['typography', typography]]) {
    for (const key of Object.keys(map)) {
      if (!proseCode.has(key) && !new RegExp(`\\b${escapeRe(key)}\\b`).test(proseText)) {
        add('ZSD-B2', 'warning', `Token "${group}.${key}" does not occur in the prose. Give its purpose.`, { path: `${group}.${key}` });
      }
    }
  }

  // ZSD-B3: token sections use bullets that start with a token name
  for (const name of ['Colors', 'Typography', 'Shapes']) {
    for (const unit of doc.units.filter((u) => u.section === name && u.kind === 'item')) {
      if (!/^`[^`]+`(\s*(,|and|\/)\s*`[^`]+`)*\s*(\([^)]*\))?\s*:/.test(unit.raw)) {
        add('ZSD-B3', 'warning', `In "${name}", start each bullet with a token name in code format and a colon.`, { line: unit.line });
      }
    }
  }

  // ZSD-B4: Overview length
  const overviewWords = doc.units.filter((u) => u.section === 'Overview').reduce((n, u) => n + countWords(u.text), 0);
  if (overviewWords > 80) add('ZSD-B4', 'warning', `"Overview" has ${overviewWords} words. The limit is 80.`);

  // ZSD-B5: component families have subsections
  const families = [...new Set(Object.keys(components).map((k) => k.split('-')[0]))];
  const h3InComponents = doc.headings.filter((h) => h.level === 3 && h.section === 'Components').map((h) => h.text.toLowerCase());
  for (const fam of families) {
    if (!h3InComponents.some((t) => t.includes(fam))) {
      add('ZSD-B5', 'warning', `In "Components", add a "### " subsection for the "${fam}" family.`, { path: `components.${fam}` });
    }
  }

  // ZSD-B6: Do's and Don'ts
  const rules = doc.units.filter((u) => u.section === "Do's and Don'ts" && u.kind === 'item');
  for (const r of rules) {
    if (!/^(Do|Do not)\b/.test(r.text)) {
      add('ZSD-B6', 'error', 'Start each rule with "Do" or "Do not".', { line: r.line });
    }
  }
  if (seen.has("Do's and Don'ts") && rules.length < 5) {
    add('ZSD-B6', 'warning', `"Do's and Don'ts" has ${rules.length} items. Write 5 or more.`);
  }

  // ZSD-B7: slop words and em dashes
  const slopRe = new RegExp(`\\b(${SLOP_WORDS.map(escapeRe).join('|')})\\b`, 'gi');
  for (const unit of doc.units) {
    const hits = [...unit.text.matchAll(slopRe)].map((m) => m[1].toLowerCase())
      .filter((w) => !(unit.section === 'Elevation & Depth' && w.startsWith('elevat')));
    if (hits.length) add('ZSD-B7', 'error', `Slop words: ${[...new Set(hits)].join(', ')}. Write a rule that an agent can apply.`, { line: unit.line });
    if (unit.raw.includes('—')) add('ZSD-B7', 'error', 'Do not use the em dash. Use a period or a colon.', { line: unit.line });
  }

  // ZSD-B8: size budget
  const bodyWords = doc.units.reduce((n, u) => n + countWords(u.text), 0);
  if (bodyWords > 1200) add('ZSD-B8', 'warning', `The body has ${bodyWords} words. The limit is 1,200.`);
  const bytes = new TextEncoder().encode(content).length;
  if (bytes > 24 * 1024) add('ZSD-B8', 'warning', `The file is ${(bytes / 1024).toFixed(1)} KB. The limit is 24 KB.`);

  // ── STE rules ────────────────────────────────────────────
  for (const unit of doc.units) {
    const isItem = unit.kind === 'item';
    const limit = isItem ? 20 : 25;
    const sentences = splitSentences(unit.text);
    for (const s of sentences) {
      const n = countWords(s);
      if (n > limit) {
        add(isItem ? 'STE-1' : 'STE-2', 'error', `Sentence has ${n} words. The limit is ${limit}: "${clip(s)}"`, { line: unit.line });
      }
      if (PASSIVE.test(s)) add('STE-4', 'warning', `Possible passive voice. Say who does the action: "${clip(s)}"`, { line: unit.line });
      if (FUTURE.test(s)) add('STE-5', 'warning', `Use the present tense: "${clip(s)}"`, { line: unit.line });
      if (WEAK_MODAL.test(s)) add('STE-6', 'warning', `Use "must" for a requirement, or "can" for a possibility: "${clip(s)}"`, { line: unit.line });
      for (const m of s.matchAll(ING_AFTER_PREP)) {
        if (!ING_NOUNS.has(m[2].toLowerCase())) {
          add('STE-7', 'warning', `"${m[0]}": write a full clause, not an -ing word after a preposition.`, { line: unit.line });
        }
      }
    }
    if (!isItem && sentences.length > 6) {
      add('STE-3', 'error', `Paragraph has ${sentences.length} sentences. The limit is 6.`, { line: unit.line });
    }
    const contractions = [...unit.text.matchAll(CONTRACTION)].map((m) => m[0]);
    if (contractions.length) {
      add('STE-9', 'warning', `Do not use contractions: ${[...new Set(contractions)].join(', ')}.`, { line: unit.line });
    }
    for (const [re, use] of TERM_LIST) {
      const m = unit.text.match(re);
      if (m) add('STE-10', 'warning', `Use "${use}", not "${m[0]}".`, { line: unit.line });
    }
  }

  // ── Result ───────────────────────────────────────────────
  findings.sort((a, b) => sevRank(a.severity) - sevRank(b.severity) || (a.line ?? 0) - (b.line ?? 0));
  const summary = {
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    infos: findings.filter((f) => f.severity === 'info').length,
  };
  const score = Math.max(0, 100 - 10 * summary.errors - 2 * summary.warnings);
  const level = summary.errors ? 'invalid' : summary.warnings ? 'valid' : 'clean';
  return { profile: PROFILE_VERSION, level, score, summary, findings };
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Split the Markdown body into headings and prose units (paragraphs and list items).
 * Fenced code blocks, tables, HTML comments and block quotes are not prose.
 */
function parseBody(body, lineOffset) {
  const lines = body.split(/\r?\n/);
  const headings = [];
  const units = [];
  let section = null;
  let current = null;
  let inFence = false;
  let inComment = false;

  const flush = () => {
    if (current) {
      current.text = toPlain(current.raw);
      if (current.text.trim()) units.push(current);
    }
    current = null;
  };

  lines.forEach((line, i) => {
    const lineNo = i + 1 + lineOffset;
    if (/^\s*(```|~~~)/.test(line)) { flush(); inFence = !inFence; return; }
    if (inFence) return;
    if (inComment) { if (line.includes('-->')) inComment = false; return; }
    if (/^\s*<!--/.test(line)) { flush(); if (!line.includes('-->')) inComment = true; return; }

    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) {
      flush();
      const level = h[1].length;
      const text = h[2].trim();
      if (level === 2) section = text;
      headings.push({ level, text, line: lineNo, section: level === 2 ? text : section });
      return;
    }
    if (!line.trim()) { flush(); return; }
    if (/^\s*\|/.test(line) || /^\s*>/.test(line)) { flush(); return; }

    const item = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (item) {
      flush();
      current = { kind: 'item', raw: item[2], line: lineNo, section };
      return;
    }
    if (current) {
      current.raw += ' ' + line.trim();
    } else {
      current = { kind: 'paragraph', raw: line.trim(), line: lineNo, section };
    }
  });
  flush();
  return { headings, units };
}

/** Markdown to plain text. Inline code becomes one word, so a token name counts as one word. */
function toPlain(md) {
  return md
    .replace(/`[^`]*`/g, 'TOKEN')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|_)(.+?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  return text
    .replace(/\b(e\.g|i\.e|etc|vs|approx)\./gi, '$1')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function countWords(text) {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

function checkOnPairs(colors, path, add, rule = 'ZSD-T4') {
  for (const [key, value] of Object.entries(colors)) {
    const onKey = `on-${key}`;
    if (!(onKey in colors)) continue;
    if ([value, colors[onKey]].some((v) => typeof v === 'string' && /^#[\dA-Fa-f]{8}$/.test(v) && !v.endsWith('FF'))) {
      add(rule, 'warning', `Alpha pair "${onKey}" on "${key}" needs its actual surface for contrast measurement.`, { path: `${path}.${onKey}` });
      continue;
    }
    const ratio = contrast(value, colors[onKey]);
    if (ratio !== null && ratio < 4.5) {
      add(rule, 'error', `Contrast of "${onKey}" on "${key}" is ${ratio.toFixed(2)}:1. The minimum is 4.5:1.`, { path: `${path}.${onKey}` });
    }
  }
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function luminance(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace('#', '');
  if (/^[0-9a-f]{3,4}$/i.test(h)) h = h.slice(0, 3).split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clip(s, n = 80) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function sevRank(s) {
  return s === 'error' ? 0 : s === 'warning' ? 1 : 2;
}
