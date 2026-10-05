#!/usr/bin/env node
import { readFile, writeFile, mkdir, stat, realpath } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintZsd } from '../packages/zsd-lint/src/index.mjs';
import { parseDesign, diffDesign, compareObservations } from './design.mjs';
import { exportTokens } from './export.mjs';
import { languageReport } from './language.mjs';

const help = `zero-slop-design 0.1.0 — DESIGN.md tools

  zsd lint FILE [--json] [--strict]
  zsd init FILE [--force]
  zsd diff BEFORE AFTER [--json]
  zsd drift FILE OBSERVATIONS.json [--json]
  zsd export FILE --format css|dtcg|tailwind [--mode NAME] [--out FILE] [--report FILE] [--force]
  zsd language FILE [--json]
  zsd help

Use: node /absolute/plugin/path/tools/zsd.mjs COMMAND
Exit codes: 0 success; 1 findings or unsupported export; 2 input or operation error.
Export writes stdout unless --out is supplied. Diagnostics use stderr.
Files are not overwritten unless --force is supplied.
Language checks cover selected writing conditions, not full STE conformance.
`;
function argumentsFor(args) {
  const paths = [], options = {};
  const flags = new Set(['json','strict','force']);
  const valued = new Set(['format','mode','out','report']);
  for (let i=0;i<args.length;i++) {
    if (!args[i].startsWith('--')) { paths.push(args[i]); continue; }
    const key = args[i].slice(2);
    if (flags.has(key)) options[key] = true;
    else if (valued.has(key)) { if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Missing value for --${key}.`); options[key] = args[++i]; }
    else throw new Error(`Unknown option: ${args[i]}.`);
  }
  return {paths,options};
}
async function read(path) {
  if (!path) throw new Error('Supply a file path.');
  const info = await stat(path);
  if (!info.isFile() || info.size > 1024*1024) throw new Error('The input must be a file of at most 1 MiB.');
  return readFile(path,'utf8');
}
async function output(path, data, force) {
  await mkdir(dirname(resolve(path)),{recursive:true});
  await writeFile(path,data,{flag:force ? 'w' : 'wx'});
}
async function canonical(path) {
  try { return await realpath(path); } catch(error) { if(error.code !== 'ENOENT')throw error;return resolve(path); }
}
const json = (data) => JSON.stringify(data,null,2)+'\n';
function print(report, asJSON) {
  if (asJSON) { process.stdout.write(json(report)); return; }
  if (report.findings) {
    process.stdout.write(`${report.level ?? 'language'}: ${report.summary?.errors ?? report.errors} errors, ${report.summary?.warnings ?? report.warnings} warnings\n`);
    for (const f of report.findings) process.stdout.write(`${f.severity} ${f.rule}${f.line ? ` line ${f.line}` : ''}${f.path ? ` ${f.path}` : ''}: ${f.message}\n`);
    if (report.coverage) process.stdout.write(`Coverage: ${report.coverage}\n`);
  } else process.stdout.write(json(report));
}
export async function main(args = process.argv.slice(2)) {
  const command = args.shift() ?? 'help';
  if (command === 'help' || command === '--help' || command === '-h') { process.stdout.write(help); return 0; }
  const {paths,options} = argumentsFor(args);
  const specs = {lint:{count:1,flags:['json','strict']},init:{count:1,flags:['force']},diff:{count:2,flags:['json']},drift:{count:2,flags:['json']},export:{count:1,flags:['format','mode','out','report','force']},language:{count:1,flags:['json']}};
  if (!Object.hasOwn(specs,command)) throw new Error(`Unknown command: ${command}.`);
  if (paths.length !== specs[command].count) throw new Error(`${command} needs ${specs[command].count} file path(s).`);
  for (const key of Object.keys(options)) if (!specs[command].flags.includes(key)) throw new Error(`Option --${key} is not available for ${command}.`);
  if (command === 'init') {
    const runtime = dirname(fileURLToPath(import.meta.url));
    const template = await read(resolve(runtime,'../templates/DESIGN.md'));
    await output(paths[0],template,options.force);
    process.stdout.write(`Starter written: ${paths[0]}\nReplace example selections and unresolved data.\n`);
    return 0;
  }
  const content = await read(paths[0]);
  if (command === 'lint') { const report = lintZsd(content); print(report,options.json); return report.summary.errors || (options.strict && report.summary.warnings) ? 1 : 0; }
  if (command === 'language') { const report = languageReport(content,paths[0]); print(report,options.json); return report.errors ? 1 : 0; }
  const {tokens} = parseDesign(content);
  if (command === 'diff') { const {tokens:after} = parseDesign(await read(paths[1])); print({coverage:'YAML data only; body changes require inspection',changes:diffDesign(tokens,after)},options.json); return 0; }
  if (command === 'drift') {
    const report = compareObservations(tokens,JSON.parse(await read(paths[1])));
    print(report,options.json); return report.differences ? 1 : 0;
  }
  const lint = lintZsd(content);
  if (lint.summary.errors || lint.summary.warnings) { process.stderr.write(json({message:'Correct document findings before export.',lint})); return 1; }
  if (!options.format) throw new Error('Supply --format css, dtcg, or tailwind.');
  const source=await canonical(paths[0]);
  const destinations=await Promise.all([options.out,options.report].filter(Boolean).map(canonical));
  if(destinations.length===2&&destinations[0]===destinations[1])throw new Error('The token output and report paths must be different.');
  if(destinations.includes(source))throw new Error('Output must not replace the source design file.');
  const result = exportTokens(tokens,options.format,options.mode);
  if (options.report) await output(options.report,json(result.report),options.force);
  if (result.report.unsupported.length) { process.stderr.write(json(result.report)); return 1; }
  if (options.out) await output(options.out,result.content,options.force);
  else process.stdout.write(result.content);
  process.stderr.write(json(result.report));
  return 0;
}
main().then((code) => {process.exitCode=code;}).catch((error) => {process.stderr.write(`zero-slop-design: ${error.message}\n`);process.exitCode=2;});
