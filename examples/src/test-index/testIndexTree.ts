/**
 * The test pages index - the tree of folders and pages, its path search and
 * the saved query: used by the index (testPagesIndexApp.ts) and the Angular
 * app (to find a folder in the tree). No framework in here.
 */
import type { IndexNode, TestPagesIndexProps } from './TestPagesIndex.types';

export type { IndexNode, TestPagesIndexProps };

export const STORAGE_KEY = 'infinite-tests:index-search';
export const EXPAND_STORAGE_KEY = 'infinite-tests:index-expand-all';

export type ExpandAllPreference = 'expanded' | 'collapsed';

export const readStoredQuery = (): string => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

export const writeStoredQuery = (query: string) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, query);
  } catch {}
};

/** when leaving the index: the next index starts unfiltered */
export const clearStoredQuery = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const readExpandPreference = (): ExpandAllPreference => {
  try {
    return window.localStorage.getItem(EXPAND_STORAGE_KEY) === 'expanded'
      ? 'expanded'
      : 'collapsed';
  } catch {
    return 'collapsed';
  }
};

export const writeExpandPreference = (preference: ExpandAllPreference) => {
  try {
    window.localStorage.setItem(EXPAND_STORAGE_KEY, preference);
  } catch {}
};

export const indexTitle = (segments: string[], framework: string) =>
  segments.length === 0 ? `Test pages (${framework})` : segments.join(' / ');

const queryTokens = (query: string) =>
  query.trim().toLowerCase().split(/\s+/).filter(Boolean);

export type HighlightPart = { text: string; match: boolean };

/** `text` split around the earliest match of any of the query's tokens */
export const highlightParts = (
  text: string,
  query: string,
): HighlightPart[] => {
  const lower = text.toLowerCase();
  let start = -1;
  let length = 0;
  for (const token of queryTokens(query)) {
    const idx = lower.indexOf(token);
    if (idx !== -1 && (start === -1 || idx < start)) {
      start = idx;
      length = token.length;
    }
  }
  if (start === -1) return [{ text, match: false }];
  return [
    { text: text.slice(0, start), match: false },
    { text: text.slice(start, start + length), match: true },
    { text: text.slice(start + length), match: false },
  ].filter((part) => part.text);
};

const nodeMatches = (node: IndexNode, token: string) =>
  node.name.toLowerCase().includes(token) ||
  node.href.toLowerCase().includes(token);

/**
 * Space-delimited path search: each token matches the next nesting level
 * (`props sort` finds the `sort*` folders and pages under a `props` folder).
 * A single token matches at any depth. A folder that matches the last token
 * keeps its whole subtree.
 */
export const filterTree = (nodes: IndexNode[], query: string): IndexNode[] => {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return nodes;

  const walk = (list: IndexNode[], remaining: string[]): IndexNode[] => {
    const [head, ...rest] = remaining;
    const result: IndexNode[] = [];
    for (const node of list) {
      if (node.type === 'page') {
        // a page can only match the last token
        if (rest.length === 0 && nodeMatches(node, head)) result.push(node);
        continue;
      }
      if (nodeMatches(node, head)) {
        if (rest.length === 0) {
          result.push(node);
          continue;
        }
        const children = walk(node.children, rest);
        if (children.length) result.push({ ...node, children });
        continue;
      }
      // not this folder: look deeper with the same tokens
      const children = walk(node.children, remaining);
      if (children.length) result.push({ ...node, children });
    }
    return result;
  };

  return walk(nodes, tokens);
};

export const countNodes = (nodes: IndexNode[]): number =>
  nodes.reduce(
    (total, node) =>
      total + 1 + (node.type === 'folder' ? countNodes(node.children) : 0),
    0,
  );

/** the first page, depth-first; the first folder when there is no page */
export const findFirstLinkHref = (nodes: IndexNode[]): string | null => {
  let firstFolder: string | null = null;
  const walk = (list: IndexNode[]): string | null => {
    for (const node of list) {
      if (node.type === 'page') return node.href;
      firstFolder ??= node.href;
      const nested = walk(node.children);
      if (nested) return nested;
    }
    return null;
  };
  return walk(nodes) ?? firstFolder;
};

export const collectFolderHrefs = (nodes: IndexNode[]): string[] =>
  nodes.flatMap((node) =>
    node.type === 'folder'
      ? [node.href, ...collectFolderHrefs(node.children)]
      : [],
  );

export const openFoldersForPreference = (
  preference: ExpandAllPreference,
  entries: IndexNode[],
): Set<string> =>
  preference === 'expanded' ? new Set(collectFolderHrefs(entries)) : new Set();

/** the index of the folder at `href`, from the tree of the whole app */
export const indexPropsAt = (
  root: IndexNode[],
  href: string,
): TestPagesIndexProps => {
  const segments = href.split('/').filter(Boolean);
  let entries: IndexNode[] = root;
  for (let i = 0; i < segments.length; i++) {
    const folderHref = '/' + segments.slice(0, i + 1).join('/');
    const folder = entries.find(
      (node) => node.type === 'folder' && node.href === folderHref,
    );
    entries = folder?.type === 'folder' ? folder.children : [];
  }
  return {
    segments,
    parentHref:
      segments.length === 0 ? null : '/' + segments.slice(0, -1).join('/'),
    entries,
  };
};

/** `/` focuses the search input, unless the user is typing somewhere */
export const isFocusSearchKey = (event: KeyboardEvent) => {
  if (event.key !== '/') return false;
  const active = document.activeElement;
  return !(
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  );
};
