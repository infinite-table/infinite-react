// Text-level scanning of the docs pages for the examples migration: code
// fences, <Sandpack> / <Snippet> wrappers, fence meta. Everything keeps its
// offsets in the page, so a conversion only rewrites the blocks it touches.
import fs from 'node:fs';
import path from 'node:path';

export const WWW_DIR = path.resolve(import.meta.dirname, '../..');
export const CONTENT_DIR = path.join(WWW_DIR, 'content');
export const DOCS_DIR = path.join(CONTENT_DIR, 'docs');

/** Languages the docs-kit inline-code ban covers. */
export const TYPECHECKED_LANGS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'typescript',
  'javascript',
]);

export const toPosix = (p) => p.split(path.sep).join('/');
export const contentRelative = (abs) => toPosix(path.relative(CONTENT_DIR, abs));

export function findPages(dir = CONTENT_DIR, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findPages(full, out);
    else if (entry.name.endsWith('.page.md')) out.push(full);
  }
  return out.sort();
}

const HIGHLIGHT_RE = /\{([\d,\s-]+)\}/;

/** `1-3,7` → [1, 2, 3, 7] */
export function parseLineRanges(spec) {
  const lines = new Set();
  for (const part of spec.split(',')) {
    const range = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
    if (!range) continue;
    const start = Number(range[1]);
    const end = range[2] ? Number(range[2]) : start;
    for (let line = start; line <= end; line++) lines.add(line);
  }
  return [...lines].sort((a, b) => a - b);
}

const unquote = (value) => value.replace(/^"+|"+$/g, '');

/**
 * Fence meta → `{ props, highlight }`. Handles the legacy forms too:
 * `files=["a.tsx","b.ts"]`, `files="a.tsx,b.ts"`, `{1-3,7}` and the stray
 * quote in `file=x.page.tsx"`.
 */
export function parseMeta(meta) {
  let rest = meta;
  let highlight = [];
  const hl = HIGHLIGHT_RE.exec(rest);
  if (hl) {
    highlight = parseLineRanges(hl[1]);
    rest = rest.replace(HIGHLIGHT_RE, ' ');
  }
  const props = {};
  for (const token of rest.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []) {
    const eq = token.indexOf('=');
    if (eq === -1) {
      props[token] = true;
      continue;
    }
    const name = token.slice(0, eq);
    const raw = token.slice(eq + 1);
    if (name === 'files') {
      let files;
      try {
        files = JSON.parse(raw);
        if (typeof files === 'string') files = files.split(',');
      } catch {
        files = unquote(raw).split(',');
      }
      props.files = files.map((file) => String(file).trim()).filter(Boolean);
      continue;
    }
    props[name] = unquote(raw);
  }
  return { props, highlight };
}

/** JSX attributes of a wrapper tag: `title="x" size="lg" tailwind`. */
export function parseAttributes(attrs) {
  const props = {};
  const re = /([\w-]+)(?:=(?:"([^"]*)"|\{([^}]*)\}|(\S+)))?/g;
  for (const match of attrs.matchAll(re)) {
    props[match[1]] = match[2] ?? match[3] ?? match[4] ?? true;
  }
  return props;
}

/** Ranges of `<!-- … -->`; the page compiler drops them before MDX runs. */
export function commentRanges(text) {
  return [...text.matchAll(/<!--[\s\S]*?-->/g)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}

/**
 * Every code fence of a page, in order:
 * `{ start, end, indent, lang, meta, body, line }`. `start`/`end` cover the
 * whole fence (opening line to the end of the closing one), `body` is the
 * code with the fence's indentation removed.
 */
export function scanFences(text) {
  const lines = text.split('\n');
  const fences = [];
  let offset = 0;
  let open = null;
  lines.forEach((line, index) => {
    if (!open) {
      const match = /^([ \t]*)(`{3,})([^\s`]*)([^`]*)$/.exec(line);
      if (match) {
        open = {
          start: offset,
          indent: match[1],
          ticks: match[2].length,
          lang: match[3],
          meta: match[4].trim(),
          line: index + 1,
          bodyLines: [],
        };
      }
    } else if (new RegExp(`^[ \\t]*\`{${open.ticks},}[ \\t]*$`).test(line)) {
      const indent = open.indent;
      const body = open.bodyLines
        .map((bodyLine) =>
          bodyLine.startsWith(indent) ? bodyLine.slice(indent.length) : bodyLine.trimStart(),
        )
        .join('\n');
      fences.push({
        start: open.start,
        end: offset + line.length,
        indent,
        lang: open.lang,
        meta: open.meta,
        line: open.line,
        body,
      });
      open = null;
    } else {
      open.bodyLines.push(line);
    }
    offset += line.length + 1;
  });
  return fences;
}

const WRAPPER_RE =
  /<(Sandpack|Snippet)\b((?:"[^"]*"|\{[^}]*\}|[^>"{])*)>([\s\S]*?)<\/\1>/g;

/** `<Sandpack …>…</Sandpack>` and `<Snippet>…</Snippet>` blocks, with their fences. */
export function scanWrappers(text, fences) {
  const wrappers = [];
  for (const match of text.matchAll(WRAPPER_RE)) {
    const start = match.index;
    const end = start + match[0].length;
    // a wrapper tag shown inside a code fence is not a wrapper
    if (fences.some((fence) => fence.start <= start && fence.end >= end)) continue;
    const description = /<Description>([\s\S]*?)<\/Description>/.exec(match[3]);
    // offsets of the description's content in the page
    const bodyStart = start + match[0].indexOf('>') + 1;
    const descriptionRange = description
      ? {
          start: bodyStart + description.index + '<Description>'.length,
          end: bodyStart + description.index + description[0].length - '</Description>'.length,
        }
      : null;
    const inside = fences.filter((fence) => fence.start >= start && fence.end <= end);
    const inDescription = (fence) =>
      descriptionRange != null && fence.start >= descriptionRange.start && fence.end <= descriptionRange.end;
    wrappers.push({
      start,
      end,
      name: match[1],
      attrs: parseAttributes(match[2]),
      descriptionRange,
      // the example's own fences; a fence in the description is ordinary inline code
      fences: inside.filter((fence) => !inDescription(fence)),
      descriptionFences: inside.filter(inDescription),
    });
  }
  return wrappers;
}

/** Absolute path of a `file=` / `files=` reference made from `pageFile`. */
export function resolveReference(reference, pageFile) {
  if (reference.startsWith('$DOCS/')) {
    return path.resolve(DOCS_DIR, reference.slice('$DOCS/'.length));
  }
  if (reference.startsWith('/')) return path.join(CONTENT_DIR, reference);
  return path.resolve(path.dirname(pageFile), reference);
}

/** `Using column.className as a function` → `using-column-classname-as-a-function` */
export function slugify(text, maxLength = 48) {
  let slug = text
    .toLowerCase()
    .replace(/['’`"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(/-[^-]*$/, '') || slug.slice(0, maxLength);
  }
  return slug;
}
