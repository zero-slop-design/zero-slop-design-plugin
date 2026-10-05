import { parseDocument } from 'yaml';

export const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const unsafe = new Set(['__proto__', 'prototype', 'constructor']);
export function assertTree(value, ancestors = new Set(), path = '') {
  if (value === null || typeof value !== 'object') return;
  if (ancestors.has(value)) throw new Error(`Circular YAML data at ${path || 'root'}.`);
  if (ancestors.size > 40) throw new Error('The data nesting limit is 40.');
  ancestors.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (unsafe.has(key)) throw new Error(`Unsafe data key: ${path ? `${path}.` : ''}${key}.`);
    assertTree(child, ancestors, path ? `${path}.${key}` : key);
  }
  ancestors.delete(value);
}
export function parseDesign(content) {
  if (typeof content !== 'string') throw new Error('The design input must be text.');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Add YAML front matter between two --- lines.');
  const doc = parseDocument(match[1], { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map((e) => e.message).join('; '));
  const tokens = doc.toJS({ maxAliasCount: 100 });
  if (!object(tokens)) throw new Error('The YAML root must be a mapping.');
  assertTree(tokens);
  return { tokens, body: content.slice(match[0].length), bodyLine: match[0].split('\n').length - 1 };
}
export function atPath(tokens, path) {
  if (typeof path !== 'string' || !/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/.test(path)) throw new Error(`Invalid token path: ${path}.`);
  let value = tokens;
  for (const key of path.split('.')) {
    if (unsafe.has(key) || !object(value) || !Object.hasOwn(value, key)) throw new Error(`Missing token: ${path}.`);
    value = value[key];
  }
  return value;
}
export function resolveValue(tokens, value, chain = []) {
  if (typeof value === 'string') {
    const match = value.match(/^\{([^{}]+)\}$/);
    if (!match) return value;
    if (chain.includes(match[1])) throw new Error(`Circular token reference: ${[...chain, match[1]].join(' -> ')}.`);
    if (chain.length > 40) throw new Error('The token reference limit is 40.');
    return resolveValue(tokens, atPath(tokens, match[1]), [...chain, match[1]]);
  }
  if (Array.isArray(value)) return value.map((item) => resolveValue(tokens, item, chain));
  if (object(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolveValue(tokens, child, chain)]));
  return value;
}
export function withMode(tokens, mode = 'default') {
  if (mode === 'default') return tokens;
  const modes = tokens['x-zsd']?.modes;
  if (!object(modes) || !Object.hasOwn(modes, mode) || !object(modes[mode]) || !object(modes[mode].colors)) throw new Error(`Unknown or invalid color mode: ${mode}.`);
  return { ...tokens, colors: { ...tokens.colors, ...modes[mode].colors } };
}
export function flatten(value, prefix = '', out = {}) {
  if (object(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else out[prefix] = value;
  return out;
}
export function diffDesign(before, after) {
  const a = flatten(before), b = flatten(after);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].sort().filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key])).map((path) => ({ path, change: !Object.hasOwn(a, path) ? 'added' : !Object.hasOwn(b, path) ? 'removed' : 'changed', ...(Object.hasOwn(a, path) ? { before: a[path] } : {}), ...(Object.hasOwn(b, path) ? { after: b[path] } : {}) }));
}
export function compareObservations(tokens, data) {
  assertTree(data);
  if (!object(data) || data.version !== 1 || !object(data.source) || !Array.isArray(data.observations) || data.observations.length === 0) throw new Error('Observations need version 1, a source, and a nonempty observations array.');
  if (!(typeof data.source.url === 'string' && /^https?:\/\//.test(data.source.url)) && !(typeof data.source.path === 'string' && data.source.path.trim())) throw new Error('Record an observation source URL or path.');
  if (typeof data.source.captured !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(data.source.captured)) throw new Error('Record the observation capture date.');
  const results = data.observations.map((item, index) => {
    if (!object(item) || !Object.hasOwn(item, 'value') || typeof item.location !== 'string' || !item.location.trim() || typeof item.state !== 'string' || !item.state.trim() || typeof item.mode !== 'string' || !item.mode.trim() || !object(item.viewport) || !Number.isFinite(item.viewport.width) || item.viewport.width <= 0 || !Number.isFinite(item.viewport.height) || item.viewport.height <= 0) throw new Error(`Observation ${index + 1} needs value, location, viewport, mode, and state.`);
    const selected = withMode(tokens, item.mode);
    const expected = resolveValue(selected, atPath(selected, item.path));
    return { ...item, expected, result: JSON.stringify(expected) === JSON.stringify(item.value) ? 'match' : 'drift' };
  });
  return { source: data.source, observed: results.length, matches: results.filter((r) => r.result === 'match').length, differences: results.filter((r) => r.result === 'drift').length, coverage: 'supplied observations only', results };
}
