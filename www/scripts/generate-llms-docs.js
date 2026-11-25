// Generates LLM-friendly markdown versions of all docs pages and blog posts:
//   - public/docs/**/<page>.md    one markdown file per docs page
//   - public/vue/docs/**/<page>.md the Vue version of each page that has one
//                                 (and so on for every framework of
//                                 www/frameworks.json, under its prefix)
//   - public/blog/**/<post>.md    one markdown file per blog post
//   - public/blog/index.md        blog index (all posts, recent first)
//   - public/llms.txt             index file (llmstxt.org convention)
//   - public/llms-full.txt        all docs + blog content concatenated
//
// Runs after `index-content` (needs src/.gen/index.json). The generated
// files are gitignored and copied into `out/` by the static export.

const fs = require('fs');
const path = require('path');

const WWW_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(WWW_DIR, 'content');
const PUBLIC_DIR = path.join(WWW_DIR, 'public');
const BASE_URL = 'https://infinite-table.com';

const siteContent = require(path.join(WWW_DIR, 'src/.gen/index.json'));

/** @thedatagrid/docs-kit/code - regions and highlight markers (loaded in `main`). */
let docsKitCode = null;

/**
 * src/utils/docsFrameworkPages.ts (loaded in `main`): each framework's .md
 * page leaves out the `<FrameworkContent>` blocks of the other frameworks.
 */
let contentForFramework = (content) => content;
let frontmatterHasFramework = () => true;

/**
 * src/utils/docsFrameworksRegistry.ts (loaded in `main`): the frameworks of
 * www/frameworks.json - their ids (the default one, React, first), URL
 * prefixes (Vue pages live under /vue/docs), packages and sibling files.
 */
let frameworks = null;
let DEFAULT_FRAMEWORK = null;

/**
 * src/utils/docsReferenceNames.ts (loaded in `main`): how a page of a
 * framework spells a prop or a hook of the reference (`[(sortInfo)]` on an
 * Angular page), as the links on the docs page show it.
 */
let referenceNames = null;

const packageOf = (framework) => frameworks.docsFramework(framework).package;
const prefixOf = (framework) => frameworks.docsFramework(framework).prefix;
const labelOf = (framework) => frameworks.docsFramework(framework).label;

/**
 * A Vue page shows the `x.demo.vue` / `x.snippet.vue(.ts)` sibling of a React
 * file (`docsFrameworkSiblings`, as remarkDemoFences does on the docs page);
 * `null` when it has none.
 */
function frameworkSibling(fileAbsolutePath, framework) {
  const siblings = frameworks.docsFrameworkSiblings(framework);
  if (!siblings) {
    return fileAbsolutePath;
  }
  const ext = Object.keys(siblings).find((e) => fileAbsolutePath.endsWith(e));
  if (!ext) {
    return fileAbsolutePath;
  }
  const base = fileAbsolutePath.slice(0, -ext.length);
  const sibling = siblings[ext]
    .map((e) => base + e)
    .find((file) => fs.existsSync(file));
  return sibling || null;
}

// maps MDX link components to the reference page they link into
const LINK_COMPONENTS = {
  PropLink: '/docs/reference/infinite-table-props',
  DataSourcePropLink: '/docs/reference/datasource-props',
  DPropLink: '/docs/reference/datasource-props',
  ApiLink: '/docs/reference/api',
  DApiLink: '/docs/reference/datasource-api',
  TreeApiLink: '/docs/reference/tree-api',
  ColumnApiLink: '/docs/reference/column-api',
  CellApiLink: '/docs/reference/cell-selection-api',
  RowDetailApiLink: '/docs/reference/row-detail-api',
  KeyNavApiLink: '/docs/reference/keyboard-navigation-api',
  HookLink: '/docs/reference/hooks',
  TypeLink: '/docs/reference/type-definitions',
};

// the link components whose name a page of another framework may spell
// differently (src/utils/docsReferenceNames.ts)
const FRAMEWORK_NAMES = {
  PropLink: (framework, name) =>
    referenceNames.docsPropName(framework, 'InfiniteTable', name),
  DataSourcePropLink: (framework, name) =>
    referenceNames.docsPropName(framework, 'DataSource', name),
  DPropLink: (framework, name) =>
    referenceNames.docsPropName(framework, 'DataSource', name),
  HookLink: (framework, name) => referenceNames.docsHookName(framework, name),
};

/** The name of a link component's entry as a page of `framework` shows it. */
function linkLabel(cmp, name, framework) {
  const framed = FRAMEWORK_NAMES[cmp]?.(framework, name);
  return framed ? framed.label : name;
}

// wrapper components whose tags we drop but whose inner content we keep
const STRIP_WRAPPERS = [
  'Note',
  'Description',
  'PropTable',
  'YouWillLearnCard',
  'HeroCards',
  'TerminalBlock',
  // docs-kit demo cards (<DemoTitle> becomes an "Example" heading below)
  'Demo',
  'DemoDescription',
];

// components removed entirely (interactive/visual only, no text value)
const REMOVE_TAGS = ['HomepageHero'];

// matches JSX attributes, allowing `>` inside quoted strings and `{...}` expressions
const ATTRS = '((?:"[^"]*"|\\{[^}]*\\}|[^>"{])*?)';

function getAttr(attrsString, attrName) {
  const match = attrsString.match(
    new RegExp(`${attrName}\\s*=\\s*"([^"]*)"`),
  );
  return match ? match[1] : null;
}

// inline `file="..."` code fences by reading the referenced sibling file
function inlineCodeFence(fence, mdFileAbsolutePath, framework) {
  const headerMatch = fence.match(/^```([^\n]*)\n?/);
  if (!headerMatch) {
    return fence;
  }
  const header = headerMatch[1];
  const fileRef = getAttr(header, 'file');
  if (!fileRef) {
    return fence;
  }

  let fileAbsolutePath;
  if (fileRef.startsWith('/')) {
    // docs-kit fences: `/docs/...` is relative to the content folder
    fileAbsolutePath = path.join(CONTENT_DIR, fileRef);
  } else {
    fileAbsolutePath = path.resolve(
      path.dirname(mdFileAbsolutePath),
      fileRef,
    );
  }

  if (!fs.existsSync(fileAbsolutePath)) {
    console.warn(`  warning: missing snippet file ${fileAbsolutePath}`);
    return fence;
  }

  let lang = header.trim().split(/\s/)[0] || 'ts';
  let notice = '';
  // `neutral` fences show the same file in every framework
  const siblingPath = /\bneutral\b/.test(header)
    ? fileAbsolutePath
    : frameworkSibling(fileAbsolutePath, framework);
  if (siblingPath === null) {
    notice = `_${frameworks.DOCS_FALLBACK_NOTICE}:_\n\n`;
  } else if (siblingPath !== fileAbsolutePath) {
    fileAbsolutePath = siblingPath;
    // `x.demo.vue` → vue, `x.snippet.vue.ts` and `x.demo.angular.ts` → ts,
    // `x.snippet.angular.html` → html
    lang = path.extname(siblingPath).slice(1);
  }
  let code = fs.readFileSync(fileAbsolutePath, 'utf8').trim();
  // docs-kit snippets/demos: show the `region`, without `#region` /
  // `#highlight` marker comments - the same code the docs page shows
  const region = getAttr(header, 'region');
  const context = `${fileRef} (in ${mdFileAbsolutePath})`;
  if (region && docsKitCode) {
    code = docsKitCode.sliceRegion(code, region, context).source;
  }
  if (
    docsKitCode &&
    /\.(demo|snippet)\.(?:[cm]?[jt]sx?|vue|vue\.ts|angular\.ts|angular\.html)$/.test(
      fileAbsolutePath,
    )
  ) {
    code = docsKitCode.extractCodeMarkers(code, context).source;
  }
  // a titled docs-kit live demo gets an "Example" heading.
  // Demo fences are live unless they say `live=false` (DOCS_FENCE_DEFAULTS
  // in src/utils/docsKit.ts).
  const live = /\.demo\.[cm]?[jt]sx?$/.test(fileRef)
    ? !/\blive=false\b/.test(header)
    : /\blive\b/.test(header);
  const title = live ? getAttr(header, 'title') : null;
  const heading = title ? `**Example: ${title}**\n\n` : '';
  return heading + notice + '```' + lang + '\n' + code + '\n```';
}

function transformProse(text, framework) {
  let result = text;

  if (framework !== DEFAULT_FRAMEWORK) {
    result = result
      .split(packageOf(DEFAULT_FRAMEWORK))
      .join(packageOf(framework));
  }

  // <PropLink name="x" /> | <PropLink name="x">label</PropLink> | <PropLink>x</PropLink>
  //   -> [`x`](https://infinite-table.com/docs/reference/...#x)
  Object.entries(LINK_COMPONENTS).forEach(([cmp, refPath]) => {
    const url = `${BASE_URL}${refPath}`;

    result = result.replace(
      new RegExp(`<${cmp}\\b${ATTRS}/>`, 'g'),
      (_all, attrs) => {
        const name = getAttr(attrs, 'name');
        return name
          ? `[\`${linkLabel(cmp, name, framework)}\`](${url}#${name})`
          : '';
      },
    );

    result = result.replace(
      new RegExp(`<${cmp}\\b${ATTRS}>([\\s\\S]*?)</${cmp}>`, 'g'),
      (_all, attrs, children) => {
        const name = getAttr(attrs, 'name') || children.trim();
        let label = children.trim() || name;
        const framed = linkLabel(cmp, name, framework);
        if (label === name && framed !== name) {
          label = `\`${framed}\``;
        }
        return name ? `[${label}](${url}#${name})` : label;
      },
    );
  });

  // <Prop name="x" type="T"> -> heading (used in reference pages)
  result = result.replace(
    new RegExp(`<Prop\\b${ATTRS}/?>`, 'g'),
    (_all, attrs) => {
      const name = getAttr(attrs, 'name');
      const type = getAttr(attrs, 'type');
      if (!name) {
        return '';
      }
      return type ? `### ${name} (\`${type}\`)` : `### ${name}`;
    },
  );
  result = result.replace(/<\/Prop>/g, '');

  // CodeSandbox / YouTube embeds -> plain links
  result = result.replace(
    new RegExp(`<CSEmbed\\b${ATTRS}(?:/>|>[\\s\\S]*?</CSEmbed>)`, 'g'),
    (_all, attrs) => {
      const id = getAttr(attrs, 'id');
      const title = getAttr(attrs, 'title') || 'CodeSandbox demo';
      return id ? `[${title}](https://codesandbox.io/s/${id})` : '';
    },
  );
  result = result.replace(
    new RegExp(`<CodeSandboxEmbed\\b${ATTRS}/?>`, 'g'),
    (_all, attrs) => {
      const src = getAttr(attrs, 'src');
      return src ? `[CodeSandbox demo](${src})` : '';
    },
  );
  result = result.replace(
    new RegExp(`<YTEmbed\\b${ATTRS}/?>`, 'g'),
    (_all, attrs) => {
      const code = getAttr(attrs, 'code');
      const url = getAttr(attrs, 'url');
      const videoUrl = code
        ? `https://www.youtube.com/watch?v=${code}`
        : url;
      return videoUrl ? `[Watch video](${videoUrl})` : '';
    },
  );

  // <DemoTitle>...</DemoTitle> (docs-kit card header) -> "Example: ..."
  result = result.replace(
    /<DemoTitle>\s*([\s\S]*?)\s*<\/DemoTitle>/g,
    (_all, title) => `**Example: ${title}**`,
  );

  STRIP_WRAPPERS.forEach((cmp) => {
    result = result.replace(
      new RegExp(`</?${cmp}(\\s[^>]*)?/?>`, 'g'),
      '',
    );
  });

  REMOVE_TAGS.forEach((cmp) => {
    result = result.replace(
      new RegExp(`<${cmp}\\b[^>]*?/>|<${cmp}\\b[^>]*?>[\\s\\S]*?</${cmp}>`, 'g'),
      '',
    );
  });

  // make site-relative markdown links absolute
  result = result.replace(/\]\(\//g, `](${BASE_URL}/`);

  // point links to other docs/blog pages at their .md siblings, so the
  // markdown files link between themselves and LLMs/crawlers stay in markdown
  result = result.replace(
    new RegExp(
      `\\]\\(${BASE_URL}(/(?:docs|blog)[^)#?\\s]*)([#?][^)\\s]*)?\\)`,
      'g',
    ),
    (all, pagePath, suffix) => {
      const mdPath = pagePathToMd(pagePath, framework);
      return mdPath
        ? `](${BASE_URL}/${mdPath}${suffix || ''})`
        : all;
    },
  );

  // collapse the blank lines left behind by removed tags
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

// valid docs/blog route paths per framework (filled in run()), used to rewrite links
const mdRoutePathSets = {};

/**
 * The .md file a link to `/docs/...` points at on a page of `framework`: its
 * page in that framework, or the React page where it has none yet (or, for a
 * page without a React version, that of another framework).
 */
function pagePathToMd(pagePath, framework = DEFAULT_FRAMEWORK) {
  const withoutSlash = pagePath.endsWith('/')
    ? pagePath.slice(0, -1)
    : pagePath;
  if (pagePath === '/blog' || pagePath === '/blog/') {
    return 'blog/index.md';
  }
  const lookIn = [
    ...new Set([framework, DEFAULT_FRAMEWORK, ...frameworks.DOCS_FRAMEWORK_IDS]),
  ];
  for (const fw of lookIn) {
    const set = mdRoutePathSets[fw];
    if (set.has(withoutSlash)) {
      return routeToMdPath(withoutSlash, fw);
    }
    if (set.has(`${withoutSlash}/`)) {
      return routeToMdPath(`${withoutSlash}/`, fw);
    }
  }
  return null;
}

function transformContent(route, framework) {
  const mdFileAbsolutePath = path.join(
    CONTENT_DIR,
    route.folderPath,
    route.fileName,
  );

  // split into code fences and prose so transforms never touch code
  const segments = contentForFramework(route.content, framework).split(
    /(```[\s\S]*?```)/,
  );

  return segments
    .map((segment) =>
      segment.startsWith('```')
        ? inlineCodeFence(segment, mdFileAbsolutePath, framework)
        : transformProse(segment, framework),
    )
    .join('')
    .trim();
}

function routeToMdPath(routePath, framework = DEFAULT_FRAMEWORK) {
  // '/docs/learn/filtering/' (index page) -> 'docs/learn/filtering/index.md'
  // '/docs/learn/sorting/overview'        -> 'docs/learn/sorting/overview.md'
  // Vue: 'vue/docs/learn/sorting/overview.md'
  const normalized = routePath.endsWith('/')
    ? `${routePath}index`
    : routePath;
  return `${prefixOf(framework)}${normalized}.md`.slice(1);
}

/** Title and description of a page for a framework (getDocsPageMeta in src/utils/docsFrameworkContent.ts). */
function pageMeta(route, framework) {
  const frontmatter = route.frontmatter || {};
  if (framework === DEFAULT_FRAMEWORK) {
    return { title: frontmatter.title, description: frontmatter.description };
  }
  const own =
    typeof frontmatter[framework] === 'object' ? frontmatter[framework] : {};
  let description = own.description ?? frontmatter.description;
  if (description && !own.description) {
    description = description
      .split(packageOf(DEFAULT_FRAMEWORK))
      .join(packageOf(framework))
      .replace(
        new RegExp(`\\b${labelOf(DEFAULT_FRAMEWORK)}\\b`, 'g'),
        labelOf(framework),
      );
  }
  return { title: own.title ?? frontmatter.title, description };
}

function pageToMarkdown(route, framework) {
  const { date, author, tags } = route.frontmatter || {};
  const { title, description } = pageMeta(route, framework);
  const body = transformContent(route, framework);

  const header = [`# ${title || route.routePath}`];
  if (description) {
    header.push('', `> ${description}`);
  }
  const metaLines = [];
  if (date) {
    metaLines.push(`Published: ${formatDate(date)}`);
  }
  if (author) {
    metaLines.push(`Author: ${author}`);
  }
  if (tags) {
    const tagList = Array.isArray(tags) ? tags.join(', ') : tags;
    metaLines.push(`Tags: ${tagList}`);
  }
  if (metaLines.length) {
    header.push('', metaLines.join('  \n'));
  }
  header.push(
    '',
    `Canonical page: ${BASE_URL}${prefixOf(framework)}${route.routePath}`,
  );

  return `${header.join('\n')}\n\n${body}\n`;
}

function writePage(route, framework = DEFAULT_FRAMEWORK) {
  const mdRelativePath = routeToMdPath(route.routePath, framework);
  const outFile = path.join(PUBLIC_DIR, mdRelativePath);
  const markdown = pageToMarkdown(route, framework);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, markdown);

  const { title, description } = pageMeta(route, framework);
  return {
    title: title || route.routePath,
    description: description || '',
    date: route.frontmatter?.date,
    url: `${BASE_URL}/${mdRelativePath}`,
    routePath: route.routePath,
    markdown,
  };
}

function formatDate(date) {
  // frontmatter dates come through as ISO timestamps - keep just the date part
  return String(date).slice(0, 10);
}

function isPublished(route) {
  return (
    !route.frontmatter?.redirect_to && route.frontmatter?.draft !== true
  );
}

function run() {
  const docsRoutes = siteContent.routes
    .filter(
      (route) => route.routePath.startsWith('/docs') && isPublished(route),
    )
    .sort((a, b) => a.routePath.localeCompare(b.routePath));

  const blogRoutes = siteContent.routes
    .filter(
      (route) =>
        route.routePath.startsWith('/blog/') &&
        route.routePath !== '/blog/' &&
        isPublished(route),
    )
    // most recent first
    .sort((a, b) =>
      String(b.frontmatter?.date || '').localeCompare(
        String(a.frontmatter?.date || ''),
      ),
    );

  // the frameworks with a prefix (Vue: /vue/docs)
  const otherFrameworks = frameworks.DOCS_FRAMEWORK_IDS.filter(
    (framework) => framework !== DEFAULT_FRAMEWORK,
  );

  const docsRoutesOf = (framework) =>
    docsRoutes.filter((route) =>
      frontmatterHasFramework(route.frontmatter, framework),
    );

  for (const framework of frameworks.DOCS_FRAMEWORK_IDS) {
    mdRoutePathSets[framework] = new Set(
      docsRoutesOf(framework).map((route) => route.routePath),
    );
  }
  blogRoutes.forEach((route) =>
    mdRoutePathSets[DEFAULT_FRAMEWORK].add(route.routePath),
  );

  // no stale Vue pages from an earlier run
  for (const framework of otherFrameworks) {
    fs.rmSync(path.join(PUBLIC_DIR, prefixOf(framework), 'docs'), {
      recursive: true,
      force: true,
    });
  }

  const docsEntries = docsRoutesOf(DEFAULT_FRAMEWORK).map((route) =>
    writePage(route),
  );
  const otherDocsEntries = otherFrameworks.map((framework) => ({
    framework,
    entries: docsRoutesOf(framework).map((route) => writePage(route, framework)),
  }));
  const blogEntries = blogRoutes.map((route) => writePage(route));

  const learnEntries = docsEntries.filter(
    (e) => !e.routePath.startsWith('/docs/reference'),
  );
  const referenceEntries = docsEntries.filter((e) =>
    e.routePath.startsWith('/docs/reference'),
  );

  const entryLine = (e) =>
    `- [${e.title}](${e.url})${e.description ? `: ${e.description}` : ''}`;

  const blogEntryLine = (e) =>
    `- [${e.title}](${e.url})${e.date ? ` (${formatDate(e.date)})` : ''}${
      e.description ? `: ${e.description}` : ''
    }`;

  // blog index markdown - the /blog page has no markdown source, so generate a listing
  const blogIndexMd = [
    '# Infinite Table Blog',
    '',
    '> Official Infinite Table React news, announcements, guides and release notes.',
    '',
    `Canonical page: ${BASE_URL}/blog`,
    '',
    ...blogEntries.map(blogEntryLine),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'blog', 'index.md'), blogIndexMd);

  const llmsTxt = [
    '# Infinite Table',
    '',
    '> Infinite Table is the modern React DataGrid for building enterprise applications. It features sorting, grouping, filtering, pivoting, aggregations, live pagination, lazy loading, keyboard navigation, row/cell selection, editing, theming and much more — with no dependencies besides React.',
    '',
    `Full docs & blog content in a single file: ${BASE_URL}/llms-full.txt`,
    '',
    '## Docs',
    '',
    ...learnEntries.map(entryLine),
    '',
    '## API Reference',
    '',
    ...referenceEntries.map(entryLine),
    '',
    ...otherDocsEntries.flatMap(({ framework, entries }) => [
      `## ${labelOf(framework)} Docs`,
      '',
      `The same docs for the ${labelOf(framework)} DataGrid (${packageOf(framework)}), for the pages that have ${/^[AEIOU]/.test(labelOf(framework)) ? 'an' : 'a'} ${labelOf(framework)} version:`,
      '',
      ...entries.map(entryLine),
      '',
    ]),
    '## Blog',
    '',
    `- [Blog index](${BASE_URL}/blog/index.md): all blog posts, most recent first`,
    ...blogEntries.map(blogEntryLine),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsTxt);
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'llms-full.txt'),
    [...docsEntries, ...blogEntries]
      .map((e) => e.markdown)
      .join('\n\n---\n\n'),
  );

  const otherDocsCounts = otherDocsEntries
    .map(({ framework, entries }) => ` + ${entries.length} ${labelOf(framework)} docs`)
    .join('');
  console.log(
    `generate-llms-docs: wrote ${docsEntries.length} docs${otherDocsCounts} + ${blogEntries.length} blog .md pages, blog/index.md, llms.txt and llms-full.txt`,
  );
}

Promise.all([
  import('./docs-kit-import.mjs').then(({ importDocsKit }) =>
    importDocsKit('code'),
  ),
  import('../src/utils/docsFrameworkPages.ts'),
  import('../src/utils/docsFrameworksRegistry.ts'),
  import('../src/utils/docsReferenceNames.ts'),
])
  .then(([code, frameworkPages, registry, names]) => {
    referenceNames = names;
    docsKitCode = code;
    contentForFramework = frameworkPages.contentForFramework;
    frontmatterHasFramework = frameworkPages.frontmatterHasFramework;
    frameworks = registry;
    DEFAULT_FRAMEWORK = registry.DOCS_DEFAULT_FRAMEWORK;
    run();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
