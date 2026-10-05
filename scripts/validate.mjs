import { readFile, readdir, realpath, stat, lstat } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { lintZsd } from '../packages/zsd-lint/src/index.mjs';
import { languageReport } from '../src/language.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),errors=[],notes=[];
const fail=(message)=>errors.push(message);
const read=(path)=>readFile(resolve(root,path),'utf8');
const data=async(path)=>JSON.parse(await read(path));
async function localPath(path,base=root) {
 const resolved=resolve(base,path);
 if (isAbsolute(path)||relative(root,resolved).startsWith('..')) {fail(`Resource outside plugin: ${path}`);return;}
 try {const canonical=await realpath(resolved);if(relative(root,canonical).startsWith('..'))fail(`Resource outside plugin: ${path}`);}catch{fail(`Missing resource: ${relative(root,resolved)}`);}
}
function language(text,label) {
 const report=languageReport(text,label);
 for (const item of report.findings) fail(`${label}:${item.line} ${item.message}`);
}
const pkg=await data('package.json');
const manifestPaths=['plugin.json','.codex-plugin/plugin.json','.claude-plugin/plugin.json'];
for (const path of manifestPaths) {
 const m=await data(path);
 if(m.name!=='zero-slop-design'||m.version!==pkg.version||typeof m.description!=='string'||m.author?.name!=='zero-slop-design')fail(`Invalid or inconsistent manifest: ${path}`);
 if(m.skills)await localPath(m.skills);
}
const codex=await data('.agents/plugins/marketplace.json'),claude=await data('.claude-plugin/marketplace.json');
if(codex.name!=='zero-slop-design'||claude.name!=='zero-slop-design'||claude.owner?.name!=='zero-slop-design')fail('Invalid marketplace identity.');
for(const entry of codex.plugins??[]) {
 if(entry.name!=='zero-slop-design'||entry.source?.source!=='local'||entry.policy?.installation!=='AVAILABLE'||entry.policy?.authentication!=='ON_INSTALL'||!entry.category)fail('Invalid Codex marketplace entry.');
 await localPath(entry.source?.path??'MISSING');
}
for(const entry of claude.plugins??[]) {if(entry.name!=='zero-slop-design')fail('Invalid Claude marketplace entry.');await localPath(entry.source??'MISSING');}
if(codex.plugins?.length!==1||claude.plugins?.length!==1)fail('Each marketplace must contain the plugin.');
const catalog=await data('catalog.json');
if(catalog.version!==pkg.version||catalog.skills.length!==13)fail('Invalid catalogue version or skill count.');
const folders=(await readdir(resolve(root,'skills'),{withFileTypes:true})).filter((e)=>e.isDirectory()).map((e)=>e.name).sort();
if(JSON.stringify(folders)!==JSON.stringify(catalog.skills.map((s)=>s.name).sort()))fail('Catalogue and skill folders differ.');
for(const skill of catalog.skills) {
 const path=`${skill.path}/SKILL.md`,content=await read(path);
 const match=content.match(/^---\n([\s\S]*?)\n---\n/);
 if(!match){fail(`Missing skill metadata: ${path}`);continue;}
 const fm=parse(match[1]);
 if(fm.name!==skill.name||fm.description!==skill.description||!fm.description?.trim()||fm.description.length>1024)fail(`Invalid skill metadata: ${path}`);
 for(const heading of ['Task','Input','Procedure','Output','Completed task'])if(!content.includes(`## ${heading}\n`))fail(`Missing ${heading}: ${path}`);
 language(content,path);language(fm.description,`${path} description`);
 const ui=parse(await read(`${skill.path}/agents/openai.yaml`)).interface;
 if(!ui||ui.short_description.length<25||ui.short_description.length>64||!ui.default_prompt.includes(`$${skill.name}`))fail(`Invalid skill interface: ${skill.name}`);
 for(const value of Object.values(ui))language(value,`${skill.name} interface`);
 const links=[...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((m)=>m[1]);
 for(const link of links)if(!/^https?:\/\//.test(link)&&!link.startsWith('#'))await localPath(link.split('#')[0],dirname(resolve(root,path)));
}
for(const name of (await readdir(resolve(root,'references'))).filter((p)=>p.endsWith('.md')))language(await read(`references/${name}`),`references/${name}`);
const terms=await data('references/technical-terms.json');
const termKeys=new Set();
for(const term of terms.terms) {
 const key=`${term.term}:${term.partOfSpeech}`;
 if(termKeys.has(key)||!['noun','verb'].includes(term.partOfSpeech)||!term.category||!term.meaning||!Array.isArray(term.forms))fail(`Invalid technical term: ${key}`);
 termKeys.add(key);language(term.meaning,`technical term ${term.term}`);
}
const template=lintZsd(await read('templates/DESIGN.md'));
if(template.summary.errors||template.summary.warnings)fail(`Starter findings: ${JSON.stringify(template.findings)}`);
for(const resource of ['tools/zsd.mjs','tools/spec-config.yaml','THIRD_PARTY_NOTICES.md','LICENSE','README.md','docs/language-review.md'])await localPath(resource);
const build=await data('tools/build-info.json');
if(build.version!==pkg.version)fail('Build version differs from package version.');
for(const [path,expected] of Object.entries({...build.inputs,'tools/zsd.mjs':build.runtime,'tools/spec-config.yaml':build.validatorData})) {
 const hash=createHash('sha256').update(await read(path)).digest('hex');
 if(hash!==expected)fail(`Stale build resource: ${path}; run npm run build.`);
}
const runtime=spawnSync(process.execPath,[resolve(root,'tools/zsd.mjs'),'lint',resolve(root,'templates/DESIGN.md'),'--strict','--json'],{encoding:'utf8'});
if(runtime.status!==0)fail(`Bundled linter validation failed: ${runtime.stderr||runtime.stdout}`);
else notes.push('Bundled linter: starter is clean.');
// File links and package containment. External URLs are not opened by this command.
async function walk(folder) {
 for(const entry of await readdir(folder,{withFileTypes:true})) {
  if(['.git','node_modules','dist'].includes(entry.name))continue;
  const path=resolve(folder,entry.name);
  if((await lstat(path)).isSymbolicLink()){fail(`Do not package symbolic links: ${relative(root,path)}`);continue;}
  if(entry.isDirectory()){await walk(path);continue;}
  if(entry.name.startsWith('.env')||/\.local\.jsonl?$/.test(entry.name))fail(`Private file in package boundary: ${relative(root,path)}`);
  if(!entry.name.endsWith('.md'))continue;
  const content=await readFile(path,'utf8');
  for(const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
   const link=match[1];
   if(/^[a-z]+:/i.test(link)||link.startsWith('#'))continue;
   await localPath(link.split('#')[0],dirname(path));
  }
 }
}
await walk(root);
process.stdout.write(JSON.stringify({version:pkg.version,skills:folders.length,errors:errors.length,findings:errors,notes,languageCoverage:'Selected writing checks; dictionary meanings and grammar require the recorded language inspection.'},null,2)+'\n');
if(errors.length)process.exitCode=1;
