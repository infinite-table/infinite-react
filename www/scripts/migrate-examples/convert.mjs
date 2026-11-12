#!/usr/bin/env node
// Moves docs pages from the Sandpack pipeline to docs-kit demos and snippets.
//
//   node scripts/migrate-examples/convert.mjs convert [--dry] <page.md | folder>…
//   node scripts/migrate-examples/convert.mjs check [--base <ref>] <page.md | folder>…
//   node scripts/migrate-examples/convert.mjs tsc <folder | file>…
//
// convert
//   - live examples: `X.page.tsx` → `X.demo.tsx` (git mv), and the
//     `<Sandpack>` / `<Description>` wrapper → a `<DemoDescription>` +
//     a `file="X.demo.tsx" title="…"` fence. A renamed example is
//     updated in every page that shows it, not only in the given ones.
//   - inline ts/tsx/js fences of the given pages → regions of a co-located
//     `<page>.snippet.tsx` (a fence with imports gets a file of its own), and
//     `{1-3}` highlights → `// #highlight` comments.
//   The snippet files are scaffolds: they still have to be made to type-check.
// check
//   Compares the code (and highlighted lines) each converted fence shows now
//   with the inline fence it replaced on the base ref.
// tsc
//   Type-checks only the given content folders / files (against the library
//   source, with the settings of content/tsconfig.json).
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { importDocsKit } from '../docs-kit-import.mjs';
import {
  CONTENT_DIR,
  TYPECHECKED_LANGS,
  WWW_DIR,
  commentRanges,
  contentRelative,
  findPages,
  parseMeta,
  resolveReference,
  scanFences,
  scanWrappers,
  slugify,
  toPosix,
} from './markdown.mjs';

const REPO_DIR = path.resolve(WWW_DIR, '..');
const EXAMPLE_SUFFIX = '.page.tsx';
const KIT_FILE_RE = /\.(demo|snippet)\.[cm]?[jt]sx?$/;

const args = process.argv.slice(2);
const command = args.shift();
const flags = { dry: false, base: 'origin/master' };
const targets = [];
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--dry') flags.dry = true;
  else if (args[index] === '--base') flags.base = args[++index];
  else targets.push(args[index]);
}

const warnings = [];
const warn = (message) => warnings.push(message);

/** Pages named on the command line (files, or every page under a folder). */
function selectPages() {
  const pages = new Set();
  for (const target of targets) {
    const abs = path.resolve(target);
    if (!fs.existsSync(abs)) throw new Error(`no such file or folder: ${target}`);
    if (fs.statSync(abs).isDirectory()) findPages(abs).forEach((page) => pages.add(page));
    else pages.add(abs);
  }
  return pages;
}

const inRanges = (ranges, fence) =>
  ranges.some((range) => fence.start >= range.start && fence.end <= range.end);

/** Whitespace between the start of the line and `offset`, if that is all there is. */
function indentBefore(text, offset) {
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
  const before = text.slice(lineStart, offset);
  return /^[ \t]*$/.test(before) ? before : '';
}

/** A page with its live example blocks and its inline type-checkable fences. */
function loadPage(file, text = fs.readFileSync(file, 'utf8')) {
  const fences = scanFences(text).map((fence) => ({ ...fence, ...parseMeta(fence.meta) }));
  const wrappers = scanWrappers(text, fences);
  const comments = commentRanges(text);
  const wrapped = new Set(wrappers.flatMap((wrapper) => wrapper.fences));

  const blocks = [];
  for (const wrapper of wrappers) {
    const [first, ...rest] = wrapper.fences;
    if (!first) {
      warn(`${contentRelative(file)}:${lineOf(text, wrapper.start)} <${wrapper.name}> without a code fence`);
      continue;
    }
    const references = [
      ...(first.props.files ?? [first.props.file]),
      ...rest.map((fence) => fence.props.file),
    ].filter((reference) => typeof reference === 'string');
    if (!references.length) {
      warn(`${contentRelative(file)}:${first.line} <${wrapper.name}> with inline code`);
      continue;
    }
    const indent = indentBefore(text, wrapper.start);
    blocks.push({
      start: wrapper.start - indent.length,
      end: wrapper.end,
      indent,
      line: lineOf(text, wrapper.start),
      entry: references[0],
      extras: references.slice(1),
      title: stringOrNull(wrapper.attrs.title ?? first.props.title),
      descriptionRange: wrapper.descriptionRange,
      size: wrapper.attrs.size ?? first.props.size,
      tailwind: Boolean(wrapper.attrs.tailwind || first.props.tailwind),
    });
  }
  for (const fence of fences) {
    if (wrapped.has(fence)) continue;
    const references = fence.props.files ?? (typeof fence.props.file === 'string' ? [fence.props.file] : []);
    if (!references.length) continue;
    if (KIT_FILE_RE.test(references[0])) continue; // already a docs-kit fence
    if (!fence.props.live) {
      warn(`${contentRelative(file)}:${fence.line} static file fence, left as it is: ${fence.meta}`);
      continue;
    }
    blocks.push({
      start: fence.start - fence.indent.length,
      end: fence.end,
      indent: fence.indent,
      line: fence.line,
      entry: references[0],
      extras: references.slice(1),
      title: stringOrNull(fence.props.title),
      descriptionRange: null,
      size: fence.props.size,
      tailwind: Boolean(fence.props.tailwind),
    });
  }
  for (const block of blocks) block.entryFile = resolveReference(block.entry, file);

  const inline = fences.filter(
    (fence) =>
      TYPECHECKED_LANGS.has(fence.lang) &&
      !wrapped.has(fence) &&
      !fence.props.file &&
      !fence.props.files &&
      !inRanges(comments, fence),
  );

  return { file, text, fences, blocks, inline };
}

const stringOrNull = (value) => (typeof value === 'string' ? value : null);
const lineOf = (text, offset) => text.slice(0, offset).split('\n').length;

// ---------------------------------------------------------------------------
// live examples

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s+['"](\.\.?\/[^'"]+)['"]|import\s*\(?\s*['"](\.\.?\/[^'"]+)['"]/g;

/** Files an example pulls in through relative imports (the tabs docs-kit adds on its own). */
function relativeImports(entryFile, seen = new Set()) {
  if (seen.has(entryFile) || !fs.existsSync(entryFile)) return seen;
  seen.add(entryFile);
  if (!/\.[cm]?[jt]sx?$/.test(entryFile)) return seen;
  const source = fs.readFileSync(entryFile, 'utf8');
  for (const match of source.matchAll(IMPORT_RE)) {
    const base = path.resolve(path.dirname(entryFile), match[1] ?? match[2]);
    const resolved = ['', '.tsx', '.ts', '.jsx', '.js', '.css', '.json']
      .map((ext) => base + ext)
      .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (resolved) relativeImports(resolved, seen);
  }
  return seen;
}

/** `$DOCS/x/a.page.tsx` → `/docs/x/a.demo.tsx` */
function demoReference(reference, suffix) {
  return reference
    .replace(/^\$DOCS\//, '/docs/')
    .replace(/^\.\//, '')
    .slice(0, -EXAMPLE_SUFFIX.length)
    .concat(suffix);
}

/** `text.slice(start, end)` with the edits that fall inside it applied. */
function sliceWithEdits(text, start, end, edits) {
  let result = text.slice(start, end);
  for (const edit of edits.filter((e) => e.start >= start && e.end <= end).sort((a, b) => b.start - a.start)) {
    result = result.slice(0, edit.start - start) + edit.text + result.slice(edit.end - start);
  }
  return result;
}

/** `inlineEdits`: the page's converted inline fences (one can sit in the description). */
function renderDemoBlock(page, block, suffix, inlineEdits) {
  const { title } = block;
  const description = block.descriptionRange
    ? sliceWithEdits(page.text, block.descriptionRange.start, block.descriptionRange.end, inlineEdits).trim()
    : null;
  // A title with markup (`code`, JSX) stays a <DemoTitle>: a fence info string
  // can't hold a backtick, and `title="…"` is plain text.
  const titleInFence = title && !/[`"{}<>]/.test(title);
  const lines = [];
  if (title && !titleInFence) lines.push(`<DemoTitle>${title}</DemoTitle>`);
  if (description) {
    const text = description
      .split('\n')
      .map((line) => (line.startsWith(block.indent) ? line.slice(block.indent.length) : line))
      .join('\n');
    lines.push('<DemoDescription>', '', text, '', '</DemoDescription>');
  }
  if (lines.length) lines.push('');
  const meta = [`file="${demoReference(block.entry, suffix)}"`];
  if (titleInFence) meta.push(`title="${title}"`);
  if (block.size === 'lg' || block.size === 'large') meta.push('height="large"');
  lines.push(`\`\`\`tsx ${meta.join(' ')}`, '```');
  return lines.map((line) => (line ? block.indent + line : line)).join('\n');
}

// ---------------------------------------------------------------------------
// inline fences → snippet files

const SNIPPET_HEADER = (pageName) =>
  `// Snippets shown on ${pageName}, one \`#region\` per code block.\n` +
  `// Type-checked against the library source (\`npm run tsc:content\`).\n`;

/** `{2,5-7}` → `// #highlight` markers in the code. */
function addHighlightMarkers(code, highlight) {
  if (!highlight.length) return code;
  const lines = code.split('\n');
  const marked = new Set(highlight.filter((line) => line >= 1 && line <= lines.length));
  const out = [];
  for (let index = 0; index < lines.length; index++) {
    if (!marked.has(index + 1)) {
      out.push(lines[index]);
      continue;
    }
    let end = index;
    while (marked.has(end + 2)) end++;
    const group = lines.slice(index, end + 1);
    if (group.length === 1) {
      out.push(group[0].trim() ? `${group[0]} // #highlight` : group[0]);
    } else {
      const indent = /^[ \t]*/.exec(group.find((line) => line.trim()) ?? '')[0];
      out.push(`${indent}// #highlight`, ...group, `${indent}// #endhighlight`);
    }
    index = end;
  }
  return out.join('\n');
}

const indentLines = (code, indent) =>
  code
    .split('\n')
    .map((line) => (line.trim() ? indent + line : ''))
    .join('\n');

let libraryExportsCache = null;
/** Names exported by `@infinite-table/infinite-react` (from the source), for the scaffold's imports. */
async function libraryExports() {
  if (libraryExportsCache) return libraryExportsCache;
  const { default: ts } = await import('typescript');
  const configPath = path.join(CONTENT_DIR, 'tsconfig.json');
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic() {},
  });
  const entry = path.resolve(WWW_DIR, '../source/src/index.tsx');
  const program = ts.createProgram([entry], { ...parsed.options, incremental: false });
  const checker = program.getTypeChecker();
  const symbol = checker.getSymbolAtLocation(program.getSourceFile(entry));
  libraryExportsCache = new Set(checker.getExportsOfModule(symbol).map((exported) => exported.name));
  return libraryExportsCache;
}

const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useContext',
  'useReducer',
];

/** Good enough for picking names out of the code: it also cuts `//` inside strings. */
const withoutComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, '');

/** Names a top-level fence imports or declares in its module. */
function topLevelNames(source) {
  const code = withoutComments(source);
  const names = new Set();
  for (const match of code.matchAll(/import\s+(?:type\s+)?([^;'"]*?)\s+from\s/g)) {
    for (const part of match[1].replace(/[{}]/g, ',').split(',')) {
      const name = /([A-Za-z_$][\w$]*)\s*$/.exec(part.trim());
      if (name && name[1] !== 'type') names.add(name[1]);
    }
  }
  for (const match of code.matchAll(
    /^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:async\s+)?(?:const|let|var|function\*?|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm,
  )) {
    names.add(match[1]);
  }
  if (/^export\s+default\b/m.test(code)) names.add('default');
  return names;
}

/** Import lines for the library / React names the code uses and `own` doesn't already provide. */
async function scaffoldImports(source, own = new Set()) {
  const code = withoutComments(source);
  const exports = await libraryExports();
  const used = new Set();
  for (const match of code.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\b/g)) used.add(match[1]);
  const libraryNames = [...used]
    .filter((name) => exports.has(name) && (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name)) && !own.has(name))
    .sort();
  const hooks = REACT_HOOKS.filter((hook) => used.has(hook) && !own.has(hook));
  const lines = [];
  if (/(?<![.\w$])React\./.test(code) && !own.has('React')) lines.push(`import * as React from 'react';`);
  if (hooks.length) lines.push(`import { ${hooks.join(', ')} } from 'react';`);
  if (libraryNames.length) {
    lines.push(`import {\n${libraryNames.map((name) => `  ${name},`).join('\n')}\n} from '@infinite-table/infinite-react';`);
  }
  return lines.join('\n');
}

/** Region name of an inline fence: its title, the enclosing `<Prop name>`, or the nearest heading. */
function regionBaseName(page, fence) {
  if (typeof fence.props.title === 'string' && slugify(fence.props.title)) return slugify(fence.props.title);
  const before = page.text.slice(0, fence.start);
  const propOpen = before.lastIndexOf('<Prop ');
  if (propOpen > before.lastIndexOf('</Prop>')) {
    const name = /^<Prop\s[^>]*?\bname="([^"]+)"/.exec(before.slice(propOpen));
    if (name && slugify(name[1])) return slugify(name[1]);
  }
  let heading = null;
  for (const match of before.matchAll(/^#{1,6}[ \t]+(.+)$/gm)) {
    if (!inRanges(page.fences, { start: match.index, end: match.index })) heading = match[1];
  }
  if (heading) {
    const text = heading.replace(/<[^>]+>/g, ' ').replace(/\{#[^}]*\}/g, ' ');
    if (slugify(text)) return slugify(text);
  }
  return 'intro';
}

async function convertInlineFences(page, edits, writes) {
  if (!page.inline.length) return 0;
  const dir = path.dirname(page.file);
  const pageName = path.basename(page.file);
  const base = pageName.slice(0, -'.page.md'.length);
  const sharedName = `${base}.snippet.tsx`;
  const sharedFile = path.join(dir, sharedName);
  const existing = fs.existsSync(sharedFile) ? fs.readFileSync(sharedFile, 'utf8') : null;

  const usedRegions = new Set(existing ? [...existing.matchAll(/^\s*\/\/\s*#region\s+(\S+)/gm)].map((m) => m[1]) : []);
  const usedFiles = new Set(fs.readdirSync(dir));
  const unique = (name, taken) => {
    let candidate = name;
    for (let n = 2; taken.has(candidate); n++) candidate = `${name}-${n}`;
    taken.add(candidate);
    return candidate;
  };

  // The page's fences, in order, in one module. A fence without imports is
  // wrapped in a block, so its declarations can't clash. A fence with imports
  // or exports has to be at the top level: it goes in the shared module too,
  // unless it declares a name the module already has - then it gets a file
  // of its own.
  const sharedParts = [];
  const sharedNames = existing ? topLevelNames(existing) : new Set();
  for (const fence of page.inline) {
    const baseName = regionBaseName(page, fence);
    const code = addHighlightMarkers(fence.body.replace(/\s+$/, ''), fence.highlight);
    const title = typeof fence.props.title === 'string' ? ` title="${fence.props.title}"` : '';
    for (const prop of Object.keys(fence.props)) {
      if (prop !== 'title') warn(`${contentRelative(page.file)}:${fence.line} dropped fence prop \`${prop}\``);
    }
    let meta;
    const names = /^\s*(?:import|export)\s/m.test(fence.body) ? topLevelNames(fence.body) : null;
    if (names && [...names].some((name) => sharedNames.has(name))) {
      let region = baseName;
      let fileName = `${base}.${region}.snippet.tsx`;
      for (let n = 2; usedFiles.has(fileName); n++) {
        region = `${baseName}-${n}`;
        fileName = `${base}.${region}.snippet.tsx`;
      }
      usedFiles.add(fileName);
      const imports = await scaffoldImports(code, names);
      writes.set(
        path.join(dir, fileName),
        `${SNIPPET_HEADER(pageName)}${imports ? `${imports}\n` : ''}\n//#region ${region}\n${code}\n//#endregion\n`,
      );
      meta = `file="${fileName}" region="${region}"${title}`;
    } else {
      const region = unique(baseName, usedRegions);
      if (names) {
        names.forEach((name) => sharedNames.add(name));
        sharedParts.push({ code, text: `//#region ${region}\n${code}\n//#endregion` });
      } else {
        sharedParts.push({ code, text: `{\n  //#region ${region}\n${indentLines(code, '  ')}\n  //#endregion\n}` });
      }
      meta = `file="${sharedName}" region="${region}"${title}`;
    }
    edits.push({
      start: fence.start - fence.indent.length,
      end: fence.end,
      text: `${fence.indent}\`\`\`${fence.lang} ${meta}\n${fence.indent}\`\`\``,
    });
  }

  if (sharedParts.length) {
    const body = sharedParts.map((part) => part.text).join('\n\n');
    if (existing) {
      writes.set(sharedFile, `${existing.replace(/\s+$/, '')}\n\n${body}\n`);
    } else {
      const imports = await scaffoldImports(sharedParts.map((part) => part.code).join('\n'), sharedNames);
      writes.set(sharedFile, `${SNIPPET_HEADER(pageName)}${imports ? `${imports}\n` : ''}\n${body}\n\nexport {};\n`);
    }
  }
  return page.inline.length;
}

// ---------------------------------------------------------------------------

async function convert() {
  const selected = selectPages();
  const pages = findPages().map((file) => loadPage(file));
  const selectedPages = pages.filter((page) => selected.has(page.file));
  if (!selectedPages.length) throw new Error('no pages selected');

  // examples to rename: the ones the selected pages show…
  const renames = new Map();
  const tailwind = new Set();
  for (const page of pages) {
    for (const block of page.blocks) if (block.tailwind) tailwind.add(block.entryFile);
  }
  const addRename = (entryFile) => {
    const suffix = tailwind.has(entryFile) ? '-tailwind.demo.tsx' : '.demo.tsx';
    renames.set(entryFile, { suffix, target: entryFile.slice(0, -EXAMPLE_SUFFIX.length) + suffix });
  };
  for (const page of selectedPages) {
    for (const block of page.blocks) {
      const where = `${contentRelative(page.file)}:${block.line}`;
      if (!block.entryFile.endsWith(EXAMPLE_SUFFIX)) {
        warn(`${where} not a ${EXAMPLE_SUFFIX} example, left as it is: ${block.entry}`);
      } else if (!fs.existsSync(block.entryFile)) {
        warn(`${where} missing file, left as it is: ${block.entry}`);
      } else {
        addRename(block.entryFile);
      }
    }
  }
  // …and the examples in their folders that no page shows
  const referenced = new Set(pages.flatMap((page) => page.blocks.map((block) => block.entryFile)));
  const folders = new Set(selectedPages.map((page) => path.dirname(page.file)));
  let orphans = 0;
  for (const folder of folders) {
    if (folder === CONTENT_DIR) continue;
    for (const name of fs.readdirSync(folder)) {
      const file = path.join(folder, name);
      if (name.endsWith(EXAMPLE_SUFFIX) && !referenced.has(file)) {
        addRename(file);
        orphans++;
      }
    }
  }

  const writes = new Map();
  let demoBlocks = 0;
  let pulledIn = 0;
  let inlineFences = 0;
  for (const page of pages) {
    const inlineEdits = [];
    if (selected.has(page.file)) inlineFences += await convertInlineFences(page, inlineEdits, writes);
    const edits = [];
    for (const block of page.blocks) {
      const rename = renames.get(block.entryFile);
      if (!rename) continue;
      const tabs = relativeImports(block.entryFile);
      for (const extra of block.extras) {
        if (!tabs.has(resolveReference(extra, page.file))) {
          warn(`${contentRelative(page.file)}:${block.line} \`${extra}\` isn't imported by ${block.entry}: it won't show as a tab`);
        }
      }
      edits.push({ start: block.start, end: block.end, text: renderDemoBlock(page, block, rename.suffix, inlineEdits) });
      demoBlocks++;
      if (!selected.has(page.file)) pulledIn++;
    }
    // an inline fence inside a converted block is already part of that block's text
    edits.push(...inlineEdits.filter((edit) => !edits.some((block) => edit.start >= block.start && edit.end <= block.end)));
    if (!edits.length) continue;
    let text = page.text;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
    }
    writes.set(page.file, text);
  }

  if (!flags.dry) {
    for (const [from, { target }] of renames) {
      execFileSync('git', ['mv', from, target], { cwd: REPO_DIR });
    }
    for (const [file, text] of writes) fs.writeFileSync(file, text);
  }

  for (const message of warnings) console.log(`warning: ${message}`);
  console.log(
    `${flags.dry ? '[dry run] ' : ''}${selectedPages.length} page(s): ${renames.size} example(s) renamed ` +
      `(${orphans} shown by no page), ${demoBlocks} live block(s) converted (${pulledIn} in other pages), ` +
      `${inlineFences} inline fence(s) moved to ${[...writes.keys()].filter((file) => file.endsWith('.snippet.tsx')).length} snippet file(s)`,
  );
}

// ---------------------------------------------------------------------------

const normalize = (code) =>
  code
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '');

function diff(before, after) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-examples-'));
  fs.writeFileSync(path.join(dir, 'before'), `${before}\n`);
  fs.writeFileSync(path.join(dir, 'after'), `${after}\n`);
  const result = spawnSync('diff', ['-u', '--label', 'before', '--label', 'now', 'before', 'after'], {
    cwd: dir,
    encoding: 'utf8',
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result.stdout.trimEnd();
}

async function check() {
  const { dedent, extractCodeMarkers, sliceRegion } = await importDocsKit('code');
  let same = 0;
  let different = 0;
  let errors = 0;
  for (const file of selectPages()) {
    const relative = toPosix(path.relative(REPO_DIR, file));
    let baseText;
    try {
      baseText = execFileSync('git', ['show', `${flags.base}:${relative}`], {
        cwd: REPO_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      continue; // a new page
    }
    const before = loadPage(file, baseText);
    const now = loadPage(file);
    const kept = new Map();
    for (const fence of before.fences) {
      if (typeof fence.props.file === 'string' && /\.snippet\./.test(fence.props.file)) {
        kept.set(fence.meta, (kept.get(fence.meta) ?? 0) + 1);
      }
    }
    const converted = now.fences.filter((fence) => {
      if (typeof fence.props.file !== 'string' || !/\.snippet\./.test(fence.props.file)) return false;
      const count = kept.get(fence.meta) ?? 0;
      if (count) kept.set(fence.meta, count - 1);
      return !count;
    });
    if (now.inline.length) {
      console.log(`${relative}: ${now.inline.length} inline fence(s) left (first on line ${now.inline[0].line})`);
      errors++;
    }
    if (converted.length !== before.inline.length) {
      console.log(
        `${relative}: ${before.inline.length} inline fence(s) on ${flags.base}, but ${converted.length} snippet fence(s) now`,
      );
      errors++;
      continue;
    }
    before.inline.forEach((old, index) => {
      const fence = converted[index];
      const where = `${relative}:${fence.line} ${fence.meta}`;
      try {
        const snippetFile = resolveReference(fence.props.file, file);
        let source = fs.readFileSync(snippetFile, 'utf8').trimEnd();
        let originalLines;
        if (typeof fence.props.region === 'string') {
          const sliced = sliceRegion(source, fence.props.region, where);
          source = sliced.source;
          originalLines = sliced.originalLines;
        }
        const shown = extractCodeMarkers(source, where, originalLines);
        const shownLines = shown.source.split('\n');
        const oldLines = dedent(old.body.split('\n')).split('\n');
        const problems = [];
        if (normalize(shown.source) !== normalize(oldLines.join('\n'))) {
          problems.push(diff(normalize(oldLines.join('\n')), normalize(shown.source)));
        }
        const highlighted = (lines, numbers) =>
          numbers
            .map((number) => (lines[number - 1] ?? '').trim())
            .filter(Boolean)
            .join('\n');
        const oldHighlight = highlighted(oldLines, old.highlight);
        const newHighlight = highlighted(shownLines, [...shown.highlight.lines].sort((a, b) => a - b));
        if (oldHighlight !== newHighlight) {
          problems.push(`highlighted lines differ:\n${diff(oldHighlight, newHighlight)}`);
        }
        if ((old.props.title ?? null) !== (fence.props.title ?? null)) {
          problems.push(`title: ${JSON.stringify(old.props.title)} → ${JSON.stringify(fence.props.title)}`);
        }
        if (old.lang !== fence.lang) problems.push(`language: ${old.lang} → ${fence.lang}`);
        if (problems.length) {
          different++;
          console.log(`\n--- ${where}\n${problems.join('\n')}`);
        } else {
          same++;
        }
      } catch (error) {
        errors++;
        console.log(`\n--- ${where}\nerror: ${error.message}`);
      }
    });
  }
  console.log(`\n${same} fence(s) show the same code as on ${flags.base}, ${different} differ, ${errors} error(s)`);
  if (errors) process.exitCode = 1;
}

// ---------------------------------------------------------------------------

function typeCheck() {
  if (!targets.length) throw new Error('tsc: pass content folders or files');
  const include = targets.map((target) => {
    const abs = path.resolve(target);
    return fs.statSync(abs).isDirectory() ? [`${abs}/**/*.ts`, `${abs}/**/*.tsx`] : [abs];
  });
  const cacheDir = path.join(WWW_DIR, 'node_modules/.cache/migrate-examples');
  fs.mkdirSync(cacheDir, { recursive: true });
  const configFile = path.join(cacheDir, `tsconfig.${process.pid}.json`);
  fs.writeFileSync(
    configFile,
    JSON.stringify({
      extends: path.join(CONTENT_DIR, 'tsconfig.json'),
      compilerOptions: { incremental: false },
      include: [
        path.join(WWW_DIR, 'app.d.ts'),
        path.join(WWW_DIR, 'next-env.d.ts'),
        path.resolve(WWW_DIR, '../source/globals.d.ts'),
        ...include.flat(),
      ],
    }),
  );
  const tsc = path.join(WWW_DIR, 'node_modules/.bin/tsc');
  const result = spawnSync(tsc, ['--project', configFile, '--pretty', 'false'], { cwd: WWW_DIR, encoding: 'utf8' });
  fs.rmSync(configFile, { force: true });
  // only the errors in the given folders / files (imports pull in other files)
  const roots = targets.map((target) => toPosix(path.relative(WWW_DIR, path.resolve(target))));
  const lines = (result.stdout + result.stderr)
    .split('\n')
    .filter((line) => line.trim())
    .filter((line) => !/^\S+\(\d+,\d+\): error/.test(line) || roots.some((root) => line.startsWith(root)) || line.startsWith(' '));
  const errorCount = lines.filter((line) => /\): error TS/.test(line)).length;
  if (lines.length) console.log(lines.join('\n'));
  console.log(errorCount ? `\n${errorCount} type error(s)` : 'no type errors');
  if (errorCount) process.exitCode = 1;
}

// ---------------------------------------------------------------------------

const commands = { convert, check, tsc: typeCheck };
if (!commands[command]) {
  console.error('usage: convert.mjs <convert [--dry] | check [--base <ref>] | tsc> <pages or folders…>');
  process.exit(1);
}
await commands[command]();
