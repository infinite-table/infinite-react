// Generates LLM-friendly markdown versions of all docs pages and blog posts:
//   - public/docs/**/<page>.md    one markdown file per docs page
//   - public/vue/docs/**/<page>.md the Vue version of each page that has one
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

const PACKAGE = {
  react: '@infinite-table/infinite-react',
  vue: '@infinite-table/infinite-vue',
};

/** Where each framework's .md pages go: Vue pages live under /vue/docs (see src/utils/docsFrameworks.ts). */
const FRAMEWORK_PREFIX = { react: '', vue: '/vue' };

/** A Vue page shows the `x.demo.vue` / `x.snippet.vue(.ts)` sibling of a React file (DOCS_VUE_SIBLINGS in src/utils/docsKit.ts). */
const VUE_SIBLINGS = {
  '.demo.tsx': ['.demo.vue'],
  '.snippet.tsx': ['.snippet.vue', '.snippet.vue.ts'],
  '.snippet.ts': ['.snippet.vue', '.snippet.vue.ts'],
};

function frameworkSibling(fileAbsolutePath, framework) {
  if (framework !== 'vue') {
    return fileAbsolutePath;
  }
  const ext = Object.keys(VUE_SIBLINGS).find((e) =>
    fileAbsolutePath.endsWith(e),
  );
  if (!ext) {
    return fileAbsolutePath;
  }
  const base = fileAbsolutePath.slice(0, -ext.length);
  const sibling = VUE_SIBLINGS[ext]
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
    notice = '_React only for now:_\n\n';
  } else if (siblingPath !== fileAbsolutePath) {
    fileAbsolutePath = siblingPath;
    lang = siblingPath.endsWith('.vue') ? 'vue' : 'ts';
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
    /\.(demo|snippet)\.(?:[cm]?[jt]sx?|vue|vue\.ts)$/.test(fileAbsolutePath)
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

  if (framework !== 'react') {
    result = result.split(PACKAGE.react).join(PACKAGE[framework]);
  }

  // <PropLink name="x" /> | <PropLink name="x">label</PropLink> | <PropLink>x</PropLink>
  //   -> [`x`](https://infinite-table.com/docs/reference/...#x)
  Object.entries(LINK_COMPONENTS).forEach(([cmp, refPath]) => {
    const url = `${BASE_URL}${refPath}`;

    result = result.replace(
      new RegExp(`<${cmp}\\b${ATTRS}/>`, 'g'),
      (_all, attrs) => {
        const name = getAttr(attrs, 'name');
        return name ? `[\`${name}\`](${url}#${name})` : '';
      },
    );

    result = result.replace(
      new RegExp(`<${cmp}\\b${ATTRS}>([\\s\\S]*?)</${cmp}>`, 'g'),
      (_all, attrs, children) => {
        const name = getAttr(attrs, 'name') || children.trim();
        const label = children.trim() || name;
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
const mdRoutePathSets = { react: new Set(), vue: new Set() };

/**
 * The .md file a link to `/docs/...` points at on a page of `framework`: its
 * page in that framework, or the React page where it has none yet.
 */
function pagePathToMd(pagePath, framework = 'react') {
  const withoutSlash = pagePath.endsWith('/')
    ? pagePath.slice(0, -1)
    : pagePath;
  if (pagePath === '/blog' || pagePath === '/blog/') {
    return 'blog/index.md';
  }
  const frameworks = framework === 'react' ? ['react'] : [framework, 'react'];
  for (const fw of frameworks) {
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

function routeToMdPath(routePath, framework = 'react') {
  // '/docs/learn/filtering/' (index page) -> 'docs/learn/filtering/index.md'
  // '/docs/learn/sorting/overview'        -> 'docs/learn/sorting/overview.md'
  // Vue: 'vue/docs/learn/sorting/overview.md'
  const normalized = routePath.endsWith('/')
    ? `${routePath}index`
    : routePath;
  return `${FRAMEWORK_PREFIX[framework]}${normalized}.md`.slice(1);
}

/** Title and description of a page for a framework (getDocsPageMeta in src/utils/docsFrameworkContent.ts). */
function pageMeta(route, framework) {
  const frontmatter = route.frontmatter || {};
  if (framework === 'react') {
    return { title: frontmatter.title, description: frontmatter.description };
  }
  const own =
    typeof frontmatter[framework] === 'object' ? frontmatter[framework] : {};
  let description = own.description ?? frontmatter.description;
  if (description && !own.description) {
    description = description
      .split(PACKAGE.react)
      .join(PACKAGE[framework])
      .replace(/\bReact\b/g, 'Vue');
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
    `Canonical page: ${BASE_URL}${FRAMEWORK_PREFIX[framework]}${route.routePath}`,
  );

  return `${header.join('\n')}\n\n${body}\n`;
}

function writePage(route, framework = 'react') {
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

  const vueDocsRoutes = docsRoutes.filter((route) =>
    frontmatterHasFramework(route.frontmatter, 'vue'),
  );
  const reactDocsRoutes = docsRoutes.filter((route) =>
    frontmatterHasFramework(route.frontmatter, 'react'),
  );

  [...reactDocsRoutes, ...blogRoutes].forEach((route) =>
    mdRoutePathSets.react.add(route.routePath),
  );
  vueDocsRoutes.forEach((route) => mdRoutePathSets.vue.add(route.routePath));

  // no stale Vue pages from an earlier run
  fs.rmSync(path.join(PUBLIC_DIR, 'vue', 'docs'), {
    recursive: true,
    force: true,
  });

  const docsEntries = reactDocsRoutes.map((route) => writePage(route));
  const vueDocsEntries = vueDocsRoutes.map((route) => writePage(route, 'vue'));
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
    '## Vue Docs',
    '',
    `The same docs for the Vue DataGrid (${PACKAGE.vue}), for the pages that have a Vue version:`,
    '',
    ...vueDocsEntries.map(entryLine),
    '',
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

  console.log(
    `generate-llms-docs: wrote ${docsEntries.length} docs + ${vueDocsEntries.length} Vue docs + ${blogEntries.length} blog .md pages, blog/index.md, llms.txt and llms-full.txt`,
  );
}

Promise.all([
  import('./docs-kit-import.mjs').then(({ importDocsKit }) =>
    importDocsKit('code'),
  ),
  import('../src/utils/docsFrameworkPages.ts'),
])
  .then(([code, frameworkPages]) => {
    docsKitCode = code;
    contentForFramework = frameworkPages.contentForFramework;
    frontmatterHasFramework = frameworkPages.frontmatterHasFramework;
    run();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
