// Design code checks: compare source code with the resolved values in DESIGN.md.
// The checks find literal values and prohibited patterns. They do not examine layout,
// computed contrast, component states, or visual quality.
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';
import { object, resolveValue } from './design.mjs';

export const RULES = {
  'color-value': { severity: 'error', text: 'Color value is not a design token value.' },
  'color-function': { severity: 'error', text: 'Color function is not a design token value.' },
  'palette-class': { severity: 'error', text: 'Utility palette class is not a design token.' },
  'dimension-value': { severity: 'warning', text: 'Dimension is not a token value for this property.' },
  'font-family': { severity: 'error', text: 'Font family is not in the design typography.' },
  'avoid-gradient': { severity: 'error', text: 'Gradient is in the design must-avoid list.' },
  'avoid-blur': { severity: 'error', text: 'Background blur is in the design must-avoid list.' },
  'avoid-emoji': { severity: 'error', text: 'Emoji is in the design must-avoid list.' },
  'avoid-shadow': { severity: 'error', text: 'Shadow is in the design must-avoid list.' },
  'exception-reason': { severity: 'error', text: 'Exception comment has no reason.' },
};

const DEFAULT_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.html', '.vue', '.svelte', '.astro', '.mdx'];
const DEFAULT_IGNORE = ['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', '.turbo', '.vercel', 'dist', 'build', 'out', 'coverage', 'vendor'];
const MARKUP = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.html', '.vue', '.svelte', '.astro', '.mdx']);
const GENERIC_FONTS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', 'fangsong', 'inherit', 'initial', 'unset', 'revert']);
const PALETTE = 'slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const PALETTE_CLASS = new RegExp(`(?<![\\w-])(?:[a-z]+:)*(?:bg|text|border(?:-[trblxy])?|ring|ring-offset|outline|from|via|to|fill|stroke|decoration|shadow|accent|caret|divide|placeholder)-(?:${PALETTE})-(?:50|[1-9]00|950)(?:\\/\\d+)?(?![\\w-])`, 'g');
const HEX = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*[^)]*\)/g;
const CSS_DIMENSION = /\b(margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|gap|row-gap|column-gap|border(?:-[a-z]+)*-radius|font-size|letter-spacing)\s*:\s*([^;{}\n]+)/g;
const UTILITY_DIMENSION = /(?<![\w-])(?:[a-z]+:)*(p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|rounded(?:-[a-z]+)?|text|tracking)-\[(-?\d*\.?\d+)(px|rem)\]/g;
const FONT_DECLARATION = /font-family\s*:\s*([^;{}\n]+)/g;
const NEXT_FONT = /import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/g;
const GOOGLE_FONT_URL = /fonts\.googleapis\.com\/css2?\?family=([A-Za-z0-9+]+)/g;
const EXCEPTION = /design-check-ignore(?:-next-line)?\s+([a-z-]+)(?:\s*:\s*(\S.*?))?\s*(?:\*\/|-->|\}|$)/;
const AVOID = [
  { rule: 'avoid-gradient', words: /gradient/i, pattern: /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(|(?<![\w-])(?:[a-z]+:)*bg-(?:gradient-to|linear|radial|conic)-[\w-]+/g },
  { rule: 'avoid-blur', words: /glass|blur|translucent/i, pattern: /backdrop-filter\s*:|(?<![\w-])(?:[a-z]+:)*backdrop-blur(?:-[\w]+)?(?![\w-])/g },
  { rule: 'avoid-emoji', words: /emoji/i, pattern: /(?![\u00A9\u00AE\u2122\u203C\u2049])\p{Extended_Pictographic}/gu, markupOnly: true },
  { rule: 'avoid-shadow', words: /shadow/i, pattern: /box-shadow\s*:\s*(?!none\b)|(?<![\w-])(?:[a-z]+:)*shadow-(?:xs|sm|md|lg|xl|2xl|inner)(?![\w-])/g },
];

const upperHex = (value) => {
  let hex = value.slice(1).toUpperCase();
  if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('');
  return `#${hex.slice(0, 6)}`;
};
const px = (value, unit) => (unit === 'rem' ? Number(value) * 16 : Number(value));

/** Builds the permitted values from resolved tokens and the must-avoid list. */
export function designRules(tokens) {
  const resolved = resolveValue(tokens, tokens);
  const zsd = object(resolved['x-zsd']) ? resolved['x-zsd'] : {};
  const colors = new Set();
  const addColors = (group) => {
    if (!object(group)) return;
    for (const value of Object.values(group)) if (typeof value === 'string' && /^#[0-9A-Fa-f]{6,8}$/.test(value)) colors.add(upperHex(value));
  };
  addColors(resolved.colors);
  if (object(zsd.modes)) for (const mode of Object.values(zsd.modes)) addColors(mode?.colors);

  // Each property kind has its own permitted values.
  const dimensions = { spacing: new Set([0]), radius: new Set([0]), fontSize: new Set(), letterSpacing: new Set([0]) };
  const addDimension = (kind, value) => {
    const match = typeof value === 'string' && value.match(/^(-?\d*\.?\d+)(px|rem)$/);
    if (match) dimensions[kind].add(Math.abs(px(match[1], match[2])));
  };
  for (const group of [resolved.spacing, zsd.layout, zsd.border, zsd.accessibility]) if (object(group)) for (const v of Object.values(group)) addDimension('spacing', v);
  if (object(resolved.rounded)) for (const v of Object.values(resolved.rounded)) addDimension('radius', v);
  const fonts = new Set();
  if (object(resolved.typography)) {
    for (const role of Object.values(resolved.typography)) {
      if (!object(role)) continue;
      addDimension('fontSize', role.fontSize);
      addDimension('letterSpacing', role.letterSpacing);
      if (typeof role.fontFamily === 'string') for (const name of role.fontFamily.split(',')) fonts.add(name.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
    }
  }
  const avoid = Array.isArray(zsd.preferences?.['must-avoid']) ? zsd.preferences['must-avoid'] : [];
  const active = AVOID.filter((item) => avoid.some((text) => item.words.test(String(text))));
  const unchecked = avoid.filter((text) => !AVOID.some((item) => item.words.test(String(text))));
  return { colors, dimensions, fonts, active, unchecked };
}

function globToRegex(glob) {
  const source = glob.split('**').map((part) => part.split('*').map((piece) => piece.replace(/[.+^${}()|[\]\\?]/g, '\\$&')).join('[^/]*')).join('.*');
  return new RegExp(`^${source}$`);
}

async function sourceFiles(root, config) {
  const extensions = new Set(config.extensions ?? DEFAULT_EXTENSIONS);
  const names = new Set([...DEFAULT_IGNORE, ...(config.ignoreDirectories ?? [])]);
  const patterns = (config.ignore ?? []).map(globToRegex);
  const files = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      const rel = relative(root, path).split(sep).join('/');
      if (patterns.some((pattern) => pattern.test(rel))) continue;
      if (entry.isDirectory()) {
        if (!names.has(entry.name)) await walk(path);
      } else if (entry.isFile() && extensions.has(extname(entry.name))) {
        if ((await stat(path)).size <= 1024 * 1024) files.push(rel);
      }
    }
  }
  await walk(root);
  return files.sort();
}

function exceptionsFor(lines) {
  const map = new Map();
  const problems = [];
  lines.forEach((line, index) => {
    const match = line.match(EXCEPTION);
    if (!match) return;
    const target = line.includes('design-check-ignore-next-line') ? index + 1 : index;
    if (!match[2]) problems.push({ line: index + 1, column: line.indexOf('design-check-ignore') + 1, text: match[0].trim() });
    else {
      if (!map.has(target)) map.set(target, new Set());
      map.get(target).add(match[1]);
    }
  });
  return { map, problems };
}

/** Examines one file. Returns findings with 1-based line and column numbers. */
export function checkText(content, file, rules) {
  const findings = [];
  const markup = MARKUP.has(extname(file));
  const lines = content.split(/\r?\n/);
  const { map, problems } = exceptionsFor(lines);
  for (const p of problems) findings.push({ rule: 'exception-reason', file, ...p });
  const add = (rule, index, column, text, detail) => {
    if (map.get(index)?.has(rule)) return;
    findings.push({ rule, file, line: index + 1, column: column + 1, text, ...(detail ? { detail } : {}) });
  };
  lines.forEach((line, index) => {
    if (EXCEPTION.test(line) && !/[;:{]/.test(line.replace(EXCEPTION, ''))) return;
    for (const m of line.matchAll(HEX)) if (!rules.colors.has(upperHex(m[0]))) add('color-value', index, m.index, m[0]);
    for (const m of line.matchAll(COLOR_FUNCTION)) if (!/var\(/.test(m[0])) add('color-function', index, m.index, m[0]);
    for (const m of line.matchAll(PALETTE_CLASS)) add('palette-class', index, m.index, m[0]);
    for (const m of line.matchAll(CSS_DIMENSION)) {
      const kind = kindOf(m[1]);
      for (const d of m[2].matchAll(/(-?\d*\.?\d+)(px|rem)\b/g)) {
        if (!rules.dimensions[kind].has(Math.abs(px(d[1], d[2])))) add('dimension-value', index, m.index + m[0].indexOf(d[0], m[1].length), d[0], `${m[1]}: not a ${kind} token value`);
      }
    }
    for (const m of line.matchAll(UTILITY_DIMENSION)) {
      const kind = kindOf(m[1]);
      if (!rules.dimensions[kind].has(Math.abs(px(m[2], m[3])))) add('dimension-value', index, m.index, m[0], `not a ${kind} token value`);
    }
    for (const m of line.matchAll(FONT_DECLARATION)) {
      for (const raw of m[1].split(',')) {
        const name = raw.trim().replace(/!important$/, '').trim().replace(/^['"]|['"]$/g, '');
        if (!name || /var\(|^inherit$/i.test(name) || GENERIC_FONTS.has(name.toLowerCase())) continue;
        if (!rules.fonts.has(name.toLowerCase())) add('font-family', index, m.index, name);
      }
    }
    for (const m of line.matchAll(GOOGLE_FONT_URL)) {
      const name = decodeURIComponent(m[1]).replace(/\+/g, ' ');
      if (!rules.fonts.has(name.toLowerCase())) add('font-family', index, m.index, name);
    }
    for (const avoid of rules.active) {
      if (avoid.markupOnly && !markup) continue;
      for (const m of line.matchAll(avoid.pattern)) add(avoid.rule, index, m.index, m[0].trim());
    }
  });
  // next/font imports can cover more than one line.
  for (const m of content.matchAll(NEXT_FONT)) {
    const index = content.slice(0, m.index).split('\n').length - 1;
    for (const raw of m[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/)[0].replace(/_/g, ' ');
      if (name && !rules.fonts.has(name.toLowerCase())) add('font-family', index, 0, name);
    }
  }
  return findings;
}

/** Maps a CSS property or utility prefix to its token group. */
function kindOf(name) {
  if (/radius|^rounded/.test(name)) return 'radius';
  if (/^font-size$|^text$/.test(name)) return 'fontSize';
  if (/letter-spacing|^tracking$/.test(name)) return 'letterSpacing';
  return 'spacing';
}

const fingerprint = (f) => `${f.rule}|${f.file}|${f.text}`;

/** Runs the code check. `known` is the known defect list, or null. */
export async function checkCode(tokens, { root, config = {}, known = null }) {
  const rules = designRules(tokens);
  const severities = Object.fromEntries(Object.entries(RULES).map(([id, rule]) => [id, config.rules?.[id] ?? rule.severity]));
  const files = await sourceFiles(root, config);
  const all = [];
  for (const file of files) all.push(...checkText(await readFile(join(root, file), 'utf8'), file, rules));
  const findings = all
    .filter((f) => severities[f.rule] !== 'off')
    .map((f) => ({ ...f, severity: severities[f.rule], message: RULES[f.rule].text }));

  const allowance = new Map();
  for (const item of known?.defects ?? []) allowance.set(fingerprint(item), (allowance.get(fingerprint(item)) ?? 0) + (item.count ?? 1));
  for (const f of findings) {
    const key = fingerprint(f);
    const left = allowance.get(key) ?? 0;
    if (left > 0) {
      f.known = true;
      allowance.set(key, left - 1);
    }
  }
  const fixed = [...allowance.entries()].filter(([, left]) => left > 0).map(([key, count]) => ({ key, count }));
  const open = findings.filter((f) => !f.known);
  return {
    files: files.length,
    errors: open.filter((f) => f.severity === 'error').length,
    warnings: open.filter((f) => f.severity === 'warning').length,
    known: findings.length - open.length,
    fixedKnown: fixed,
    findings,
    permitted: { colors: [...rules.colors].sort(), dimensions: Object.fromEntries(Object.entries(rules.dimensions).map(([k, v]) => [k, [...v].sort((a, b) => a - b)])), fonts: [...rules.fonts].sort() },
    coverage: {
      checked: ['color values and functions', 'utility palette classes', 'spacing, radius, and font size dimensions', 'font families', ...rules.active.map((a) => a.rule)],
      notChecked: [...rules.unchecked.map((text) => `must-avoid: ${text}`), 'utility scale classes such as p-4 or text-sm', 'layout quality', 'computed contrast', 'component states', 'responsive behavior'],
    },
  };
}

/** Makes a known defect list from current findings. */
export function knownDefects(report, design) {
  const counts = new Map();
  for (const f of report.findings) {
    const key = fingerprint(f);
    const item = counts.get(key) ?? { rule: f.rule, file: f.file, text: f.text, count: 0 };
    item.count += 1;
    counts.set(key, item);
  }
  return { version: 1, design, defects: [...counts.values()].sort((a, b) => fingerprint(a).localeCompare(fingerprint(b))) };
}
