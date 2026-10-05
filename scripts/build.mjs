import { build } from 'esbuild';
import { readFile, writeFile, copyFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'tools'),{recursive:true});
await build({entryPoints:[resolve(root,'src/cli.mjs')],outfile:resolve(root,'tools/zsd.mjs'),bundle:true,platform:'node',format:'esm',target:'node22',legalComments:'eof',banner:{js:"import { createRequire as bundleCreateRequire } from 'node:module'; const require = bundleCreateRequire(import.meta.url);"}});
await copyFile(resolve(root,'node_modules/@google/design.md/dist/linter/spec-config.yaml'),resolve(root,'tools/spec-config.yaml'));
const dependencies = new Map();
async function dependency(name,from=root) {
  let search=from,folder,pkg;
  while (true) {
    folder=resolve(search,'node_modules',name);
    try {pkg=JSON.parse(await readFile(resolve(folder,'package.json'),'utf8'));break;}catch{}
    const parent=dirname(search);if(parent===search)throw new Error(`Missing dependency ${name}.`);search=parent;
  }
  const key=`${pkg.name}@${pkg.version}`;
  if(dependencies.has(key))return;
  dependencies.set(key,{folder,pkg});
  for(const child of Object.keys(pkg.dependencies??{}).sort())await dependency(child,folder);
}
await dependency('@google/design.md');await dependency('yaml');
const notices = ['# Third-party notices\n\nThe runtime includes the reference DESIGN.md validator and YAML parser.\nThese notices cover their dependency graph, including libraries bundled by the validator.\nThe implementation does not change the zero-slop-design product identity.\n'];
for (const [key,{folder,pkg}] of [...dependencies.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0)) {
  let text;
  const filenames=(await readdir(folder)).filter((name)=>/^licen[cs]e(?:\.[a-z]+)?$/i.test(name)).sort();
  for (const filename of filenames) {
    try {text = await readFile(resolve(folder,filename),'utf8'); break;} catch {}
  }
  // format 0.2.2 declares MIT in package.json and its source header, but has no license file.
  if (!text && pkg.name==='format' && pkg.version==='0.2.2' && pkg.licenses?.[0]?.type==='MIT') {
    const readme=await readFile(resolve(folder,'Readme.md'),'utf8');
    const copyright=readme.match(/Copyright[^\n]+/)?.[0];
    if(!copyright)throw new Error('Missing format copyright notice.');
    const mit=await readFile(resolve(root,'LICENSE'),'utf8');
    text=copyright+'\n\n'+mit.slice(mit.indexOf('Permission is hereby granted'));
  }
  if (!text) throw new Error(`Missing license for ${key}.`);
  notices.push(`\n## ${pkg.name} ${pkg.version} (${pkg.license??pkg.licenses?.[0]?.type})\n\n\`\`\`text\n${text.trim()}\n\`\`\`\n`);
}
const upstream=await readFile(resolve(root,'node_modules/@google/design.md/dist/linter/index.js'),'utf8');
const bundled=[...new Set([...upstream.matchAll(/node_modules\/\.bun\/([^/]+)\/node_modules\//g)].map((m)=>m[1]))].sort();
notices.push('\n## Libraries already bundled in the reference validator\n\nThe package source identifies these versions. License texts above also cover these library families.\n\n'+bundled.map((name)=>`- ${name}`).join('\n')+'\n');
await writeFile(resolve(root,'THIRD_PARTY_NOTICES.md'),notices.join(''));
const inputs=['package.json','package-lock.json','scripts/build.mjs','packages/zsd-lint/src/index.mjs',...(await readdir(resolve(root,'src'))).filter((name)=>name.endsWith('.mjs')).map((name)=>`src/${name}`)].sort();
const digest=async(path)=>createHash('sha256').update(await readFile(resolve(root,path))).digest('hex');
const hashes=Object.fromEntries(await Promise.all(inputs.map(async(path)=>[path,await digest(path)])));
await writeFile(resolve(root,'tools/build-info.json'),JSON.stringify({version:JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version,inputs:hashes,runtime:await digest('tools/zsd.mjs'),validatorData:await digest('tools/spec-config.yaml')},null,2)+'\n');
process.stdout.write('Built tools/zsd.mjs and reference validator data.\n');
