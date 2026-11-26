/**
 * The test pages index of a folder, without a framework: the React, Vue and
 * Angular apps mount it in an element of their index route
 * (TestPagesIndex.tsx, TestPagesIndex.vue, angular-app/test-pages-index.ts).
 *
 * - a header: the folder, the React / Vue / Angular switch (same folder in
 *   the other app) and the light / dark toggle (examplesTheme.ts);
 * - the pages and specs changed most recently, live, with their last
 *   result, and a button to run them;
 * - the tree of the folder: collapsible folders (the open ones are kept in
 *   localStorage, shared by the three apps), a path search, a "Run" button on
 *   every page and folder with its last result (pass / fail);
 * - one output panel for the runs (Playwright in watch mode, through the
 *   test-runner sidecar).
 *
 * The results and the changes come from the sidecar (scripts/test-runner-
 * results.js), live through its event stream.
 */
import {
  buildFrameworkSiblingHref,
  currentBasePath,
  EXAMPLES_FRAMEWORKS,
  type ExamplesFramework,
  FRAMEWORK_LABELS,
  withBasePath,
} from './frameworkLinkShared';
import {
  onThemeChange,
  readTheme,
  themeToggleLabel,
  themeToggleTitle,
  toggleTheme,
} from './examplesTheme';
import {
  clearStoredQuery,
  collectFolderHrefs,
  countNodes,
  filterTree,
  findFirstLinkHref,
  highlightParts,
  isFocusSearchKey,
  openFoldersForPreference,
  readExpandPreference,
  readStoredQuery,
  writeStoredQuery,
} from './testIndexTree';
import type { IndexNode, TestPagesIndexProps } from './TestPagesIndex.types';
import {
  labelFor,
  outputParts,
  type RecentChange,
  type TestResult,
  type TestResults,
  TestRunnerClient,
  type TestRunnerState,
} from './testRunnerCore';

export type TestPagesIndexOptions = TestPagesIndexProps & {
  framework: ExamplesFramework;
  /** the test-runner sidecar's port (each app has it in its own env) */
  testRunnerPort: number;
};

const OPEN_FOLDERS_KEY = 'infinite-tests:index-open-folders';
const RECENT_LIMIT = 8;

const isAutomation = () =>
  typeof navigator !== 'undefined' && !!(navigator as any).webdriver;

// ------------------------------------------------------------------ dom

type Child = Node | string | null | undefined | false;
type Props = Record<string, any>;

function h(tag: string, props: Props | null, ...children: Child[]) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
}

const replaceChildren = (el: Element, ...children: Child[]) => {
  el.replaceChildren(
    ...(children.filter(
      (child) => child !== null && child !== undefined && child !== false,
    ) as (Node | string)[]),
  );
};

// --------------------------------------------------------------- helpers

function readOpenFolders(entries: IndexNode[]): Set<string> {
  try {
    const raw = localStorage.getItem(OPEN_FOLDERS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  // the earlier "expand all" preference
  return openFoldersForPreference(readExpandPreference(), entries);
}

function writeOpenFolders(open: Set<string>) {
  try {
    localStorage.setItem(OPEN_FOLDERS_KEY, JSON.stringify([...open]));
  } catch {}
}

/** the same URL (inside the apps) in another framework's app */
function frameworkHref(framework: ExamplesFramework, href: string) {
  if (currentBasePath()) {
    // the front of the dev servers: same origin, the other base path
    return href === '/' ? `/${framework}/` : `/${framework}${href}`;
  }
  return buildFrameworkSiblingHref(href, framework);
}

function ago(ts: number) {
  const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

const KIND_LABELS: Record<string, string> = {
  spec: 'spec',
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
};

// ------------------------------------------------------------------- app

export function mountTestPagesIndex(
  container: HTMLElement,
  options: TestPagesIndexOptions,
): () => void {
  ensureIndexStyles();

  // the breadcrumbs link the parent folders (no separate "back" link)
  const { framework, segments, entries } = options;
  const automation = isAutomation();
  const runnerBase = () =>
    `${window.location.protocol}//${window.location.hostname}:${options.testRunnerPort}`;
  const runner = new TestRunnerClient(framework, runnerBase);
  const folderHref = segments.length ? '/' + segments.join('/') : '/';

  let query = readStoredQuery();
  let openFolders = readOpenFolders(entries);
  let results: TestResults = { pages: {}, folders: {} };
  let recent: RecentChange[] = [];
  let runnerOnline = false;
  const disposers: (() => void)[] = [];

  // --- the skeleton: rendered once, its parts updated -------------------

  const root = h('div', { className: 'tpi' });
  const themeButton = h('button', {
    type: 'button',
    className: 'tpi-icon-button',
    onClick: () => toggleTheme(),
  });
  const renderTheme = () => {
    const theme = readTheme();
    themeButton.textContent = themeToggleLabel(theme);
    themeButton.title = themeToggleTitle(theme);
    themeButton.setAttribute('aria-label', themeToggleTitle(theme));
  };
  renderTheme();
  disposers.push(onThemeChange(renderTheme));

  const crumbs = h(
    'nav',
    { className: 'tpi-crumbs', 'aria-label': 'Folders' },
    h('a', { href: withBasePath('/'), onClick: clearStoredQuery }, 'pages'),
    ...segments.flatMap((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const last = index === segments.length - 1;
      return [
        h('span', { className: 'tpi-crumb-sep', 'aria-hidden': 'true' }, '/'),
        last
          ? h('span', { className: 'tpi-crumb-current' }, segment)
          : h(
              'a',
              { href: withBasePath(href), onClick: clearStoredQuery },
              segment,
            ),
      ];
    }),
  );

  const switcher = h(
    'div',
    { className: 'tpi-switch', role: 'group', 'aria-label': 'Framework' },
    ...EXAMPLES_FRAMEWORKS.map((fw) =>
      fw === framework
        ? h(
            'span',
            { className: 'tpi-switch-item is-current', 'aria-current': 'page' },
            FRAMEWORK_LABELS[fw],
          )
        : h(
            'a',
            {
              className: 'tpi-switch-item',
              href: frameworkHref(fw, folderHref),
              title: `This folder in the ${FRAMEWORK_LABELS[fw]} app`,
            },
            FRAMEWORK_LABELS[fw],
          ),
    ),
  );

  const header = h(
    'header',
    { className: 'tpi-header' },
    h(
      'div',
      { className: 'tpi-heading' },
      crumbs,
      h(
        'h1',
        { className: 'tpi-title' },
        segments.length ? segments[segments.length - 1] : 'Test pages',
        h(
          'span',
          { className: 'tpi-title-framework' },
          FRAMEWORK_LABELS[framework],
        ),
      ),
    ),
    h('div', { className: 'tpi-header-tools' }, switcher, themeButton),
  );

  const recentList = h('ul', { className: 'tpi-recent-list' });
  const recentCard = h(
    'section',
    { className: 'tpi-card tpi-recent', 'aria-label': 'Recently changed' },
    h(
      'div',
      { className: 'tpi-card-head' },
      h('h2', null, 'Recently changed'),
      h('span', { className: 'tpi-muted' }, 'pages and specs, live'),
    ),
    recentList,
  );

  const search = h('input', {
    type: 'search',
    className: 'tpi-search',
    placeholder: 'Search… (space = next level, / to focus, Enter opens)',
    'aria-label':
      'Search test pages; use space to match the next folder level. Press Enter to open the first match.',
  }) as HTMLInputElement;
  search.value = query;
  search.addEventListener('input', () => {
    query = search.value;
    writeStoredQuery(query);
    renderTree();
  });
  search.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const first = tree.querySelector<HTMLElement>('.tpi-row[data-href]');
      if (first) setActive(first.dataset.href!, true);
      return;
    }
    if (event.key !== 'Enter' || !query.trim()) return;
    event.preventDefault();
    const href = findFirstLinkHref(filterTree(entries, query));
    if (!href) return;
    clearStoredQuery();
    window.location.assign(withBasePath(href));
  });

  const count = h('span', { className: 'tpi-count' });
  // the "Run all" of the folder itself (rebuilt with its state)
  const runFolderSlot = h('span', { className: 'tpi-run-slot' });

  const toolbar = h(
    'div',
    { className: 'tpi-toolbar' },
    search,
    h(
      'button',
      {
        type: 'button',
        className: 'tpi-button',
        onClick: () => {
          openFolders = new Set([
            ...openFolders,
            ...collectFolderHrefs(entries),
          ]);
          writeOpenFolders(openFolders);
          renderTree();
        },
      },
      'Expand all',
    ),
    h(
      'button',
      {
        type: 'button',
        className: 'tpi-button',
        onClick: () => {
          const here = new Set(collectFolderHrefs(entries));
          openFolders = new Set(
            [...openFolders].filter((href) => !here.has(href)),
          );
          writeOpenFolders(openFolders);
          renderTree();
        },
      },
      'Collapse all',
    ),
    count,
    h('span', { className: 'tpi-spacer-flex' }),
    runFolderSlot,
  );

  const tree = h('div', { className: 'tpi-tree' });
  const treeCard = h(
    'section',
    { className: 'tpi-card tpi-tree-card' },
    toolbar,
    tree,
  );

  const panel = h('div', { className: 'tpi-panel', hidden: true });

  root.append(header, recentCard, treeCard, panel);
  container.replaceChildren(root);

  // --- results and runs --------------------------------------------------

  /** when a page's own files last changed (its spec or its page in this app) */
  const changedAt = (pathname: string) => {
    const change = recent.find((item) => item.pathname === pathname);
    if (!change) return 0;
    return Math.max(change.kinds.spec ?? 0, change.kinds[framework] ?? 0);
  };

  const resultOf = (
    type: 'page' | 'folder',
    href: string,
  ): TestResult | undefined =>
    type === 'page' ? results.pages[href] : results.folders[href];

  const isRunning = (href: string) =>
    runner.state.active && runner.state.pathname === href;

  function runOrStop(href: string, mode: 'page' | 'folder') {
    if (isRunning(href)) {
      runner.stop();
    } else {
      void runner.start(href, mode);
    }
  }

  /** the Run button of a page or folder, colored by its last result */
  function runButton(
    type: 'page' | 'folder',
    href: string,
    compact = true,
    inTree = false,
  ) {
    const running = isRunning(href);
    const state = runner.state;
    const result = resultOf(type, href);
    const stale = type === 'page' && result && changedAt(href) > result.ts;
    let tone = 'idle';
    let label = type === 'folder' ? '▶ Run all' : '▶ Run';
    let title =
      type === 'folder'
        ? 'Run every spec in this folder (watch mode)'
        : 'Run the spec of this page (watch mode)';
    if (running) {
      tone =
        state.status === 'pass'
          ? 'pass'
          : state.status === 'fail'
          ? 'fail'
          : 'running';
      label =
        state.status === 'starting' || state.status === 'running'
          ? '◌ Running'
          : `${state.status === 'pass' ? '✓' : '✗'} watching · ■`;
      title = 'Watching: runs again when its files change. Click to stop.';
    } else if (result) {
      tone = result.status;
      label = `${result.status === 'pass' ? '✓' : '✗'} ${
        compact ? 'Run' : label.slice(2)
      }`;
      title = `${result.status === 'pass' ? 'Passed' : 'Failed'} ${ago(
        result.ts,
      )}${stale ? ', changed since' : ''}. ${title}`;
    }
    const button = h(
      'button',
      {
        type: 'button',
        className: `tpi-run tone-${tone}${stale ? ' is-stale' : ''}`,
        // in the tree: Space runs the active row (keyboard navigation)
        tabindex: inTree ? '-1' : undefined,
        title,
        onClick: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          runOrStop(href, type);
        },
      },
      label,
    );
    return button;
  }

  // --- rendering ----------------------------------------------------------

  function highlighted(text: string, q: string) {
    return highlightParts(text, q).map((part) =>
      part.match ? h('mark', { className: 'tpi-mark' }, part.text) : part.text,
    );
  }

  // --- keyboard navigation (a file explorer's: the tree is one tab stop) --

  /** the row the arrow keys move from (an href inside the app) */
  let activeHref: string | null = null;

  const visibleRows = () => [
    ...tree.querySelectorAll<HTMLElement>('.tpi-row[data-href]'),
  ];

  const rowOf = (href: string | null) =>
    href === null
      ? null
      : tree.querySelector<HTMLElement>(
          `.tpi-row[data-href="${CSS.escape(href)}"]`,
        );

  function setActive(href: string | null, focus = false) {
    if (href !== activeHref) {
      rowOf(activeHref)?.setAttribute('tabindex', '-1');
      rowOf(activeHref)?.classList.remove('is-active');
      activeHref = href;
    }
    const row = rowOf(href);
    if (!row) return;
    row.setAttribute('tabindex', '0');
    row.classList.add('is-active');
    if (focus) {
      row.focus();
      row.scrollIntoView({ block: 'nearest' });
    }
  }

  function setFolderOpen(href: string, open: boolean) {
    if (open === openFolders.has(href)) return;
    const next = new Set(openFolders);
    if (open) next.add(href);
    else next.delete(href);
    openFolders = next;
    writeOpenFolders(openFolders);
    renderTree();
  }

  /** the folder row a row is in (null at the top) */
  const parentRow = (row: HTMLElement) =>
    row.parentElement
      ?.closest('.tpi-list--nested')
      ?.parentElement?.querySelector<HTMLElement>(':scope > .tpi-row') ?? null;

  tree.addEventListener('keydown', (event) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>(
      '.tpi-row[data-href]',
    );
    if (!row || event.altKey || event.ctrlKey || event.metaKey) return;
    const rows = visibleRows();
    const index = rows.indexOf(row);
    const href = row.dataset.href!;
    const isFolder = row.dataset.type === 'folder';
    const expanded = row.getAttribute('aria-expanded') === 'true';
    const go = (target: HTMLElement | null | undefined) => {
      event.preventDefault();
      if (target) setActive(target.dataset.href!, true);
    };

    switch (event.key) {
      case 'ArrowDown':
        return go(rows[index + 1]);
      case 'ArrowUp':
        if (index === 0) {
          event.preventDefault();
          search.focus();
          return;
        }
        return go(rows[index - 1]);
      case 'Home':
        return go(rows[0]);
      case 'End':
        return go(rows[rows.length - 1]);
      case 'ArrowRight':
        event.preventDefault();
        if (!isFolder) return;
        if (!expanded) {
          // a search keeps every folder of the matches open
          if (!query.trim()) setFolderOpen(href, true);
          setActive(href, true);
        } else {
          go(
            rows[index + 1] && parentRow(rows[index + 1]) === row
              ? rows[index + 1]
              : null,
          );
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (isFolder && expanded && !query.trim()) {
          setFolderOpen(href, false);
          setActive(href, true);
        } else {
          go(parentRow(row));
        }
        return;
      case 'Enter': {
        event.preventDefault();
        const link = row.querySelector<HTMLAnchorElement>('a.tpi-link');
        if (link) {
          clearStoredQuery();
          window.location.assign(link.href);
        }
        return;
      }
      case ' ':
        event.preventDefault();
        if (!automation && runnerOnline) {
          runOrStop(href, isFolder ? 'folder' : 'page');
        }
        return;
    }
  });

  // the tree had the focus before it was rendered again: give it back
  let treeHasFocus = false;
  tree.addEventListener('focusin', () => {
    treeHasFocus = true;
  });
  tree.addEventListener('focusout', (event) => {
    if (!tree.contains(event.relatedTarget as Node | null))
      treeHasFocus = false;
  });

  function nodeList(
    nodes: IndexNode[],
    q: string,
    nested: boolean,
  ): HTMLElement {
    return h(
      'ul',
      {
        className: nested ? 'tpi-list tpi-list--nested' : 'tpi-list',
        role: nested ? 'group' : 'tree',
        'aria-label': nested ? undefined : 'Test pages',
      },
      ...nodes.map((node) => {
        const href = withBasePath(node.href);
        // one tab stop for the tree: the active row (arrow keys move it)
        const rowProps = {
          role: 'treeitem',
          tabindex: node.href === activeHref ? '0' : '-1',
          'data-href': node.href,
          'data-type': node.type,
          onClick: () => setActive(node.href),
        };
        if (node.type === 'page') {
          return h(
            'li',
            { className: 'tpi-item', role: 'none' },
            h(
              'div',
              {
                ...rowProps,
                className: `tpi-row${
                  node.href === activeHref ? ' is-active' : ''
                }`,
              },
              h('span', {
                className: 'tpi-toggle-space',
                'aria-hidden': 'true',
              }),
              h('span', {
                className: 'tpi-node-icon is-page',
                'aria-hidden': 'true',
              }),
              h(
                'a',
                {
                  className: 'tpi-link',
                  href,
                  tabindex: '-1',
                  onClick: clearStoredQuery,
                },
                ...highlighted(node.name, q),
              ),
              !automation && runnerOnline
                ? runButton('page', node.href, true, true)
                : null,
            ),
          );
        }
        const open = !!q || openFolders.has(node.href);
        const toggle = () =>
          setFolderOpen(node.href, !openFolders.has(node.href));
        return h(
          'li',
          { className: 'tpi-item', role: 'none' },
          h(
            'div',
            {
              ...rowProps,
              className: `tpi-row is-folder${
                node.href === activeHref ? ' is-active' : ''
              }`,
              'aria-expanded': String(open),
            },
            h(
              'button',
              {
                type: 'button',
                className: 'tpi-toggle',
                tabindex: '-1',
                'aria-hidden': 'true',
                onClick: toggle,
              },
              h('span', {
                className: open ? 'tpi-chevron is-open' : 'tpi-chevron',
              }),
            ),
            h('span', {
              className: open
                ? 'tpi-node-icon is-folder is-open'
                : 'tpi-node-icon is-folder',
              'aria-hidden': 'true',
              onClick: toggle,
            }),
            h(
              'a',
              {
                className: 'tpi-link is-folder',
                href,
                tabindex: '-1',
                onClick: clearStoredQuery,
              },
              ...highlighted(node.name, q),
            ),
            h(
              'span',
              { className: 'tpi-folder-count' },
              String(countNodes(node.children)),
            ),
            !automation && runnerOnline
              ? runButton('folder', node.href, true, true)
              : null,
          ),
          open ? nodeList(node.children, q, true) : null,
        );
      }),
    );
  }

  function renderTree() {
    const q = query.trim();
    const filtered = filterTree(entries, query);
    const total = countNodes(entries);
    count.textContent = q
      ? `${countNodes(filtered)} of ${total}`
      : `${total} ${total === 1 ? 'entry' : 'entries'}`;

    replaceChildren(
      runFolderSlot,
      !automation && runnerOnline && segments.length
        ? runButton('folder', folderHref, false)
        : null,
    );

    if (entries.length === 0) {
      replaceChildren(
        tree,
        h(
          'p',
          { className: 'tpi-empty' },
          `No ${FRAMEWORK_LABELS[framework]} test pages in this folder.`,
        ),
      );
      return;
    }
    if (filtered.length === 0) {
      replaceChildren(
        tree,
        h('p', { className: 'tpi-empty' }, `No matches for “${q}”.`),
      );
      return;
    }
    const hadFocus = treeHasFocus;
    replaceChildren(tree, nodeList(filtered, q, false));
    // the active row may be gone (collapsed, filtered out): the first one
    if (!rowOf(activeHref)) {
      activeHref = null;
      const first = visibleRows()[0];
      if (first) setActive(first.dataset.href!);
    }
    if (hadFocus) setActive(activeHref, true);
  }

  function renderRecent() {
    recentCard.hidden = automation || !runnerOnline || recent.length === 0;
    if (recentCard.hidden) return;
    replaceChildren(
      recentList,
      ...recent.slice(0, RECENT_LIMIT).map((change) => {
        const own = change.files[framework];
        const target = own
          ? withBasePath(change.pathname)
          : (() => {
              const other = EXAMPLES_FRAMEWORKS.find((fw) => change.files[fw]);
              return other ? frameworkHref(other, change.pathname) : null;
            })();
        const kinds = (['spec', 'react', 'vue', 'angular'] as const).filter(
          (kind) => change.kinds[kind],
        );
        return h(
          'li',
          { className: 'tpi-recent-item' },
          h(
            'div',
            { className: 'tpi-recent-main' },
            target
              ? h(
                  'a',
                  {
                    className: 'tpi-link',
                    href: target,
                    onClick: clearStoredQuery,
                  },
                  change.pathname.replace(/^\/tests\//, ''),
                )
              : h('span', null, change.pathname),
            h(
              'span',
              { className: 'tpi-chips' },
              ...kinds.map((kind) =>
                h(
                  'span',
                  {
                    className: `tpi-chip${
                      kind === framework ? ' is-current' : ''
                    }`,
                    title: `${KIND_LABELS[kind]} ${
                      kind === 'spec' ? '' : 'page '
                    }changed ${ago(change.kinds[kind]!)}`,
                  },
                  KIND_LABELS[kind],
                ),
              ),
              !own
                ? h(
                    'span',
                    {
                      className: 'tpi-chip is-missing',
                      title: `No ${FRAMEWORK_LABELS[framework]} page yet`,
                    },
                    `no ${FRAMEWORK_LABELS[framework]} page`,
                  )
                : null,
            ),
          ),
          h('span', { className: 'tpi-time' }, ago(change.ts)),
          change.files.spec && own ? runButton('page', change.pathname) : null,
        );
      }),
    );
  }

  function renderPanel() {
    const state: TestRunnerState = runner.state;
    panel.hidden = !state.showOutput;
    if (panel.hidden) return;
    const open = state.openStatus;
    const tone =
      state.status === 'pass'
        ? 'pass'
        : state.status === 'fail'
        ? 'fail'
        : state.active
        ? 'running'
        : 'idle';
    const body = h('div', { className: 'tpi-panel-body' });
    if (state.output) {
      for (const part of outputParts(state.output)) {
        if (part.kind === 'link') {
          body.append(
            h(
              'a',
              {
                href: '#',
                className: 'tpi-file-link',
                title: `Open ${part.file}:${part.line}${
                  part.col ? `:${part.col}` : ''
                } in the editor`,
                onClick: (event: MouseEvent) => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey)
                    return;
                  event.preventDefault();
                  runner.openInEditor(part.file, part.line, part.col);
                },
              },
              part.value,
            ),
          );
        } else {
          body.append(part.value);
        }
      }
    } else {
      body.append(state.active ? '(starting…)' : '(no output yet)');
    }
    replaceChildren(
      panel,
      h(
        'div',
        { className: 'tpi-panel-head' },
        h('span', { className: `tpi-dot tone-${tone}` }),
        h(
          'span',
          { className: 'tpi-panel-title' },
          state.pathname ?? '',
          h(
            'span',
            { className: 'tpi-muted' },
            ` · ${labelFor(state.status, state.mode, state.specCount).replace(
              /^▶ /,
              '',
            )}${
              state.active &&
              state.status !== 'running' &&
              state.status !== 'starting'
                ? ' · watching'
                : ''
            }`,
          ),
          open.kind !== 'idle'
            ? h(
                'span',
                { className: `tpi-open-status is-${open.kind}` },
                open.kind === 'opening'
                  ? ` · opening ${open.file}…`
                  : open.kind === 'ok'
                  ? ` · opened ${open.file}${
                      open.editor ? ` (${open.editor})` : ''
                    }`
                  : ` · open failed: ${open.error}`,
              )
            : null,
        ),
        h(
          'div',
          { className: 'tpi-panel-actions' },
          state.active
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'tpi-button',
                  title: 'Stop watching',
                  onClick: () => runner.stop(),
                },
                'Stop',
              )
            : null,
          h(
            'button',
            {
              type: 'button',
              className: 'tpi-button',
              title: 'Clear the output',
              onClick: () => runner.set({ output: '' }),
            },
            'Clear',
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'tpi-icon-button',
              title: 'Run again',
              'aria-label': 'Run again',
              onClick: () => void runner.rerun(),
            },
            '↻',
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'tpi-icon-button',
              title: 'Close',
              'aria-label': 'Close',
              onClick: () => runner.set({ showOutput: false }),
            },
            '×',
          ),
        ),
      ),
      body,
    );
    body.scrollTop = body.scrollHeight;
  }

  // the runner's state: the panel, and the Run buttons (their state)
  let lastActive: string | null = null;
  disposers.push(
    runner.subscribe((state) => {
      renderPanel();
      const key = `${state.active}:${state.pathname}:${state.status}`;
      if (key !== lastActive) {
        lastActive = key;
        renderTree();
        renderRecent();
      }
    }),
  );

  // --- the sidecar: results, recent changes, live events ---------------

  async function loadFromRunner() {
    try {
      const [resultsResponse, recentResponse] = await Promise.all([
        fetch(`${runnerBase()}/results?project=${framework}`),
        fetch(`${runnerBase()}/recent?limit=${RECENT_LIMIT * 2}`),
      ]);
      // an older sidecar (no /results yet): no results, no Run buttons
      if (!resultsResponse.ok || !recentResponse.ok)
        throw new Error('old sidecar');
      const loaded = await resultsResponse.json();
      results = { pages: loaded?.pages ?? {}, folders: loaded?.folders ?? {} };
      const changes = await recentResponse.json();
      recent = Array.isArray(changes) ? changes : [];
      runnerOnline = true;
    } catch {
      runnerOnline = false;
    }
    renderTree();
    renderRecent();
  }

  if (!automation) {
    void loadFromRunner();
    try {
      const events = new EventSource(`${runnerBase()}/events`);
      events.addEventListener('results', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        if (data.project !== framework) return;
        results = {
          pages: { ...results.pages, ...data.pages },
          folders: { ...results.folders, ...data.folders },
        };
        renderTree();
        renderRecent();
      });
      events.addEventListener('change', (event) => {
        const change = JSON.parse((event as MessageEvent).data) as RecentChange;
        recent = [
          change,
          ...recent.filter((item) => item.pathname !== change.pathname),
        ];
        renderRecent();
        renderTree();
      });
      // the sidecar restarted: everything again
      events.addEventListener('open', () => {
        if (!runnerOnline) void loadFromRunner();
      });
      events.addEventListener('error', () => {
        runnerOnline = false;
      });
      disposers.push(() => events.close());
    } catch {}
    // "2 min ago" stays right
    const timer = setInterval(renderRecent, 30_000);
    disposers.push(() => clearInterval(timer));
  }

  renderTree();
  renderRecent();

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isFocusSearchKey(event)) return;
    event.preventDefault();
    search.focus();
  };
  window.addEventListener('keydown', onKeyDown);
  disposers.push(() => window.removeEventListener('keydown', onKeyDown));

  return () => {
    for (const dispose of disposers) dispose();
    runner.dispose();
    container.replaceChildren();
  };
}

// --------------------------------------------------------------- styles

const INDEX_CSS = `
.tpi {
  box-sizing: border-box;
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 120px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: var(--ex-font);
  font-size: 14px;
  line-height: 1.45;
  color: var(--ex-fg);
}
.tpi *, .tpi *::before, .tpi *::after { box-sizing: border-box; }
.tpi a { color: inherit; text-decoration: none; }
.tpi-muted { color: var(--ex-muted); font-size: 12px; }

.tpi-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.tpi-heading { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.tpi-crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--ex-muted);
  font-size: 13px;
}
.tpi-crumbs a:hover { color: var(--ex-accent); }
.tpi-crumb-sep { opacity: 0.5; }
.tpi-crumb-current { color: var(--ex-fg); }
.tpi-title {
  margin: 0;
  font-size: 26px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--ex-fg-strong);
  display: flex;
  align-items: baseline;
  gap: 10px;
  word-break: break-word;
}
.tpi-title-framework {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ex-accent);
  background: var(--ex-accent-soft);
  padding: 2px 8px;
  border-radius: 999px;
}
.tpi-header-tools { display: flex; align-items: center; gap: 8px; }

.tpi-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: 10px;
  background: var(--ex-surface-2);
  border: 1px solid var(--ex-border);
}
.tpi-switch-item {
  padding: 5px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 550;
  color: var(--ex-muted);
  transition: color 120ms, background 120ms;
}
.tpi-switch-item:hover { color: var(--ex-fg); }
.tpi-switch-item.is-current {
  color: var(--ex-fg-strong);
  background: var(--ex-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18), 0 0 0 1px var(--ex-border);
}

.tpi-icon-button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1px solid var(--ex-border);
  background: var(--ex-surface);
  color: var(--ex-fg);
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  line-height: 1;
}
.tpi-icon-button:hover { border-color: var(--ex-border-strong); background: var(--ex-surface-2); }

.tpi-card {
  background: var(--ex-surface);
  border: 1px solid var(--ex-border);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
.tpi-card[hidden] { display: none; }
.tpi-card-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 16px 6px;
}
.tpi-card-head h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: var(--ex-fg-strong);
}

.tpi-recent-list { list-style: none; margin: 0; padding: 4px 8px 10px; }
.tpi-recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 8px;
  border-radius: 9px;
}
.tpi-recent-item:hover { background: var(--ex-hover); }
.tpi-recent-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.tpi-recent-main .tpi-link { font-family: var(--ex-mono); font-size: 12.5px; }
.tpi-chips { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.tpi-chip {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 999px;
  color: var(--ex-muted);
  border: 1px solid var(--ex-border);
}
.tpi-chip.is-current { color: var(--ex-accent); border-color: var(--ex-accent-soft); background: var(--ex-accent-soft); }
.tpi-chip.is-missing { color: var(--ex-warn); border-style: dashed; }
.tpi-time { color: var(--ex-muted); font-size: 12px; white-space: nowrap; }

.tpi-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  border-bottom: 1px solid var(--ex-border);
}
.tpi-search {
  flex: 1 1 260px;
  max-width: 420px;
  height: 34px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--ex-border);
  background: var(--ex-bg);
  color: var(--ex-fg);
  font: inherit;
  outline: none;
}
.tpi-search::placeholder { color: var(--ex-muted); }
.tpi-search:focus { border-color: var(--ex-accent); box-shadow: 0 0 0 3px var(--ex-accent-soft); }
.tpi-button {
  height: 32px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--ex-border);
  background: var(--ex-surface);
  color: var(--ex-fg);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.tpi-button:hover { border-color: var(--ex-border-strong); background: var(--ex-surface-2); }
.tpi-count { color: var(--ex-muted); font-size: 12px; margin-left: 4px; }
.tpi-spacer-flex { flex: 1; }

.tpi-tree { padding: 8px 8px 12px; }
.tpi-empty { margin: 8px; color: var(--ex-muted); }
.tpi-list { list-style: none; margin: 0; padding: 0; }
.tpi-list--nested { padding-left: 22px; position: relative; }
.tpi-list--nested::before {
  content: '';
  position: absolute;
  left: 13px;
  top: 0;
  bottom: 6px;
  border-left: 1px solid var(--ex-border);
}
.tpi-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 6px;
  border-radius: 8px;
}
.tpi-row:hover { background: var(--ex-hover); }
.tpi-row:focus { outline: none; }
.tpi-row.is-active:focus,
.tpi-row.is-active:focus-visible {
  background: var(--ex-accent-soft);
  box-shadow: inset 0 0 0 1px var(--ex-accent);
}
.tpi-row.is-active:focus .tpi-run { opacity: 1; }
.tpi-row .tpi-run { opacity: 0; }
.tpi-row:hover .tpi-run,
.tpi-row .tpi-run:focus-visible,
.tpi-row .tpi-run.tone-pass,
.tpi-row .tpi-run.tone-fail,
.tpi-row .tpi-run.tone-running { opacity: 1; }
.tpi-toggle,
.tpi-toggle-space {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ex-muted);
  cursor: pointer;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.tpi-toggle:hover { background: var(--ex-hover); color: var(--ex-fg); }
.tpi-chevron {
  width: 6px;
  height: 6px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 120ms;
}
.tpi-chevron.is-open { transform: rotate(45deg) translate(-1px, -1px); }
.tpi-node-icon {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  position: relative;
}
.tpi-node-icon.is-folder {
  cursor: pointer;
  background: linear-gradient(var(--ex-accent), var(--ex-accent)) 0 2px / 7px 3px no-repeat;
  opacity: 0.9;
}
.tpi-node-icon.is-folder::after {
  content: '';
  position: absolute;
  inset: 4px 0 1px 0;
  border-radius: 3px;
  background: var(--ex-accent);
  opacity: 0.55;
}
.tpi-node-icon.is-folder.is-open::after { opacity: 0.85; }
.tpi-node-icon.is-page::after {
  content: '';
  position: absolute;
  inset: 2px 3px;
  border-radius: 2px;
  border: 1.5px solid var(--ex-muted);
  opacity: 0.8;
}
.tpi-link {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpi-link:hover { color: var(--ex-accent); }
.tpi-link.is-folder { font-weight: 550; color: var(--ex-fg-strong); }
.tpi-folder-count {
  font-size: 11px;
  color: var(--ex-muted);
  background: var(--ex-surface-2);
  border-radius: 999px;
  padding: 0 7px;
}
.tpi-mark {
  background: var(--ex-accent-soft);
  color: var(--ex-accent);
  border-radius: 3px;
  padding: 0 1px;
}

.tpi-run {
  margin-left: auto;
  flex: 0 0 auto;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--ex-border);
  background: var(--ex-surface);
  color: var(--ex-fg);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 550;
  white-space: nowrap;
  transition: opacity 120ms, background 120ms, border-color 120ms;
}
.tpi-run:hover { border-color: var(--ex-border-strong); }
.tpi-run.tone-pass { color: var(--ex-pass); background: var(--ex-pass-soft); border-color: transparent; }
.tpi-run.tone-fail { color: var(--ex-fail); background: var(--ex-fail-soft); border-color: transparent; }
.tpi-run.tone-running { color: var(--ex-running); background: var(--ex-accent-soft); border-color: transparent; }
.tpi-run.is-stale { border: 1px dashed currentColor; }
.tpi-run[hidden] { display: none; }
.tpi-toolbar .tpi-run { height: 32px; padding: 0 14px; border-radius: 9px; }

.tpi-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ex-muted); flex: 0 0 8px; }
.tpi-dot.tone-pass { background: var(--ex-pass); }
.tpi-dot.tone-fail { background: var(--ex-fail); }
.tpi-dot.tone-running { background: var(--ex-running); animation: tpi-pulse 1s infinite alternate; }
@keyframes tpi-pulse { from { opacity: 1; } to { opacity: 0.35; } }

.tpi-panel {
  position: fixed;
  right: 12px;
  bottom: 46px;
  width: 620px;
  max-width: calc(100vw - 24px);
  max-height: 55vh;
  display: flex;
  flex-direction: column;
  background: var(--ex-surface);
  color: var(--ex-fg);
  border: 1px solid var(--ex-border-strong);
  border-radius: 12px;
  box-shadow: var(--ex-shadow);
  z-index: 10001;
  overflow: hidden;
}
.tpi-panel[hidden] { display: none; }
.tpi-panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  border-bottom: 1px solid var(--ex-border);
  font-size: 12.5px;
}
.tpi-panel-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--ex-mono); }
.tpi-panel-actions { display: flex; gap: 6px; }
.tpi-panel-actions .tpi-button { height: 28px; }
.tpi-panel-actions .tpi-icon-button { width: 28px; height: 28px; }
.tpi-panel-body {
  padding: 10px 12px;
  overflow: auto;
  white-space: pre-wrap;
  font: 11.5px/1.5 var(--ex-mono);
  background: var(--ex-bg);
}
.tpi-file-link { color: var(--ex-accent) !important; text-decoration: underline !important; }
.tpi-open-status.is-ok { color: var(--ex-pass); }
.tpi-open-status.is-err { color: var(--ex-fail); }
`;

const STYLE_ID = 'infinite-test-pages-index-css';

/** adds the index stylesheet to the document, once */
export const ensureIndexStyles = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = INDEX_CSS;
  document.head.appendChild(style);
};
