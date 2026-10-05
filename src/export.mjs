import { object, resolveValue, withMode } from './design.mjs';

const metadata = new Set(['profile','kind','source','review','intent','preferences','implementation','unresolved','modes']);
const extensions = new Set(['motion','elevation','border','breakpoints','layout','accessibility']);
const cssName = (path) => `--zsd-${path.replaceAll('.', '-').replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
const keyOK = (key) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key);
const dimension = (value) => {
  const match = String(value).match(/^(-?\d+(?:\.\d+)?)(px|rem)$/);
  if (!match) throw new Error(`Unsupported dimension: ${value}.`);
  return { value: Number(match[1]), unit: match[2] };
};
const color = (value) => {
  if (typeof value !== 'string' || !/^#[\dA-Fa-f]{6}(?:[\dA-Fa-f]{2})?$/.test(value)) throw new Error(`Unsupported color: ${value}.`);
  return { colorSpace: 'srgb', components: [1,3,5].map((i) => parseInt(value.slice(i, i+2),16)/255), alpha: value.length === 9 ? parseInt(value.slice(7),16)/255 : 1 };
};
function fontFamily(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('The font family must be nonempty text.');
  const result=[];let current='',quote=null;
  for(const char of value) {
    if(char==='"'||char==="'") {if(quote===char)quote=null;else if(!quote)quote=char;current+=char;}
    else if(char===','&&!quote){result.push(current.trim());current='';}
    else current+=char;
  }
  if(quote)throw new Error('The font family has an unmatched quote.');
  result.push(current.trim());
  const names=result.map((name)=>name.replace(/^(["'])(.*?)\1$/,'$2'));
  if(names.some((name)=>!name||/[{};]/.test(name)))throw new Error('Unsupported font family syntax.');
  return names.length===1?names[0]:names;
}
function cssValue(value) {
  if ((typeof value !== 'string' && typeof value !== 'number') || /[;{}\r\n]|\/\*/.test(String(value))) throw new Error(`Unsupported CSS value: ${JSON.stringify(value)}.`);
  return String(value);
}
function typeFor(path, value) {
  const end = path.split('.').at(-1);
  if (end === 'typography' && object(value)) {
    if (Object.keys(value).some((p) => !['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing'].includes(p))) throw new Error('Unsupported composite typography property.');
    if (typeof value.fontFamily !== 'string' || !Number.isFinite(value.fontWeight) || !Number.isFinite(value.lineHeight)) throw new Error('Invalid composite typography.');
    return { $type:'typography', $value:{ fontFamily:fontFamily(value.fontFamily), fontSize:dimension(value.fontSize), fontWeight:value.fontWeight, letterSpacing:dimension(value.letterSpacing), lineHeight:value.lineHeight } };
  }
  if (end === 'fontWeight' && typeof value === 'number') return { $type: 'fontWeight', $value: value };
  if (path.startsWith('colors.') || /color/i.test(end)) return { $type: 'color', $value: color(value) };
  if (typeof value === 'number') return { $type: 'number', $value: value };
  if (/^-?\d+(?:\.\d+)?(?:px|rem)$/.test(String(value))) return { $type: 'dimension', $value: dimension(value) };
  if (/^\d+(?:\.\d+)?(?:ms|s)$/.test(String(value))) {
    const match = String(value).match(/^(\d+(?:\.\d+)?)(ms|s)$/);
    return { $type: 'duration', $value: { value: Number(match[1]), unit: match[2] } };
  }
  if (path.includes('easing')) {
    const named = { linear:[0,0,1,1], ease:[0.25,0.1,0.25,1], 'ease-in':[0.42,0,1,1], 'ease-out':[0,0,0.58,1], 'ease-in-out':[0.42,0,0.58,1] };
    const match = String(value).match(/^cubic-bezier\(([^)]+)\)$/);
    const points = named[value] ?? (match ? match[1].split(',').map((x) => Number(x.trim())) : null);
    if (points?.length === 4 && points.every(Number.isFinite) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) return { $type:'cubicBezier', $value:points };
  }
  if (end === 'fontFamily' && typeof value === 'string') return { $type: 'fontFamily', $value: fontFamily(value) };
  if (end === 'fontWeight' && typeof value === 'number') return { $type: 'fontWeight', $value: value };
  throw new Error(`No DTCG 2025.10 mapping for ${path}: ${JSON.stringify(value)}.`);
}
export function exportTokens(tokens, format, mode = 'default') {
  if (!['css','dtcg','tailwind'].includes(format)) throw new Error('Select css, dtcg, or tailwind.');
  const selected = withMode(tokens, mode), resolved = resolveValue(selected, selected);
  const css = [], theme = [], dtcg = {}, mapping = [], unsupported = [];
  const put = (path, value, themeName) => {
    if (path.split('.').some((key) => !/^[A-Za-z0-9_-]+$/.test(key))) { unsupported.push({path,message:'Invalid token path.'}); return; }
    if (format !== 'dtcg' && object(value) && path.endsWith('.typography')) {
      for (const [prop, child] of Object.entries(value)) put(`${path}.${prop}`, child);
      return;
    }
    let converted;
    try { converted = format === 'dtcg' ? typeFor(path, value) : cssValue(value); }
    catch (e) { unsupported.push({ path, message:e.message }); return; }
    const name = cssName(path);
    if (format === 'dtcg') {
      let group = dtcg; const keys = path.split('.');
      for (const key of keys.slice(0,-1)) group = group[key] ??= {};
      group[keys.at(-1)] = converted;
    } else {
      css.push(`  ${name}: ${converted};`);
      if (themeName) theme.push(`  ${themeName}: var(${name});`);
    }
    mapping.push({ source:path, target:format === 'dtcg' ? path : name, ...(themeName && format === 'tailwind' ? { theme:themeName } : {}) });
  };
  for (const group of ['colors','spacing','rounded']) {
    for (const [key,value] of Object.entries(resolved[group] ?? {})) {
      if (!keyOK(key)) { unsupported.push({path:`${group}.${key}`, message:'The token key is not kebab-case.'}); continue; }
      const ns = {colors:'color',spacing:'spacing',rounded:'radius'}[group];
      put(`${group}.${key}`,value,`--${ns}-zsd-${key}`);
    }
  }
  for (const [key, properties] of Object.entries(resolved.typography ?? {})) {
    if (!keyOK(key) || !object(properties)) { unsupported.push({path:`typography.${key}`,message:'Invalid typography token.'}); continue; }
    if (format === 'dtcg') {
      try {
        const extra = Object.keys(properties).filter((p) => !['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing'].includes(p));
        if (extra.length) throw new Error(`Unsupported typography properties: ${extra.join(', ')}.`);
        if (typeof properties.fontFamily !== 'string' || !Number.isFinite(properties.fontWeight) || !Number.isFinite(properties.lineHeight)) throw new Error('Typography needs fontFamily, fontWeight, and lineHeight.');
        dtcg.typography ??= {};
        dtcg.typography[key] = { $type:'typography', $value:{ fontFamily:fontFamily(properties.fontFamily), fontSize:dimension(properties.fontSize), fontWeight:properties.fontWeight, letterSpacing:dimension(properties.letterSpacing), lineHeight:properties.lineHeight } };
        mapping.push({source:`typography.${key}`,target:`typography.${key}`});
      } catch(e) { unsupported.push({path:`typography.${key}`,message:e.message}); }
    } else {
      for (const [prop,value] of Object.entries(properties)) {
        const ns = {fontFamily:`--font-zsd-${key}`,fontSize:`--text-zsd-${key}`,fontWeight:`--text-zsd-${key}--font-weight`,lineHeight:`--text-zsd-${key}--line-height`,letterSpacing:`--text-zsd-${key}--letter-spacing`}[prop];
        if (!ns) { unsupported.push({path:`typography.${key}.${prop}`,message:'Unsupported typography property.'}); continue; }
        put(`typography.${key}.${prop}`,value,ns);
      }
    }
  }
  for (const [key,properties] of Object.entries(resolved.components ?? {})) {
    if (!keyOK(key) || !object(properties)) { unsupported.push({path:`components.${key}`,message:'Invalid component token.'}); continue; }
    for (const [prop,value] of Object.entries(properties)) put(`components.${key}.${prop}`,value);
  }
  const ignored = [];
  for (const [group, values] of Object.entries(resolved['x-zsd'] ?? {})) {
    if (metadata.has(group)) { ignored.push(`x-zsd.${group}`); continue; }
    if (!extensions.has(group) || !object(values)) { unsupported.push({path:`x-zsd.${group}`,message:'Unsupported extension group.'}); continue; }
    for (const [key,value] of Object.entries(values)) {
      if (!keyOK(key)) { unsupported.push({path:`x-zsd.${group}.${key}`,message:'The token key is not kebab-case.'}); continue; }
      put(`x-zsd.${group}.${key}`,value,group === 'breakpoints' ? `--breakpoint-zsd-${key}` : undefined);
    }
  }
  const report = { format, formatVersion:format === 'dtcg' ? '2025.10' : format === 'tailwind' ? '4' : 'CSS custom properties', mode, mapping, ignoredMetadata:ignored, unsupported };
  if (unsupported.length) return {report, content:null};
  const content = format === 'dtcg' ? JSON.stringify(dtcg,null,2)+'\n' : '/* Generated by zero-slop-design. Source: DESIGN.md. */\n:root {\n'+css.join('\n')+'\n}\n'+(format === 'tailwind' ? '\n@theme inline {\n'+theme.join('\n')+'\n}\n' : '');
  return {report, content};
}
