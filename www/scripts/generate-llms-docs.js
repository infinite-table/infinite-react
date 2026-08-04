// Generates LLM-friendly markdown versions of all docs pages and blog posts:
//   - public/docs/**/<page>.md    one markdown file per docs page
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
  'Snippet',
  'TerminalBlock',
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
function inlineCodeFence(fence, mdFileAbsolutePath) {
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
  if (fileRef.startsWith('$DOCS/')) {
    fileAbsolutePath = path.join(
      CONTENT_DIR,
      'docs',
      fileRef.replace('$DOCS/', ''),
    );
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

  const lang = header.trim().split(/\s/)[0] || 'ts';
  const code = fs.readFileSync(fileAbsolutePath, 'utf8').trim();
  return '```' + lang + '\n' + code + '\n```';
}

function transformProse(text) {
  let result = text;

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

  // <Sandpack title="..."> -> "Example: ..." (code fences inside are kept)
  result = result.replace(
    new RegExp(`<Sandpack\\b${ATTRS}>`, 'g'),
    (_all, attrs) => {
      const title = getAttr(attrs, 'title');
      return title ? `**Example: ${title}**` : '**Example**';
    },
  );
  result = result.replace(/<\/Sandpack>/g, '');

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
      const mdPath = pagePathToMd(pagePath);
      return mdPath
        ? `](${BASE_URL}/${mdPath}${suffix || ''})`
        : all;
    },
  );

  // collapse the blank lines left behind by removed tags
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

// set of valid docs/blog route paths (filled in run()), used to rewrite links
const mdRoutePathSet = new Set();

function pagePathToMd(pagePath) {
  const withoutSlash = pagePath.endsWith('/')
    ? pagePath.slice(0, -1)
    : pagePath;
  if (pagePath === '/blog' || pagePath === '/blog/') {
    return 'blog/index.md';
  }
  if (mdRoutePathSet.has(withoutSlash)) {
    return routeToMdPath(withoutSlash);
  }
  if (mdRoutePathSet.has(`${withoutSlash}/`)) {
    return routeToMdPath(`${withoutSlash}/`);
  }
  return null;
}

function transformContent(route) {
  const mdFileAbsolutePath = path.join(
    CONTENT_DIR,
    route.folderPath,
    route.fileName,
  );

  // split into code fences and prose so transforms never touch code
  const segments = route.content.split(/(```[\s\S]*?```)/);

  return segments
    .map((segment) =>
      segment.startsWith('```')
        ? inlineCodeFence(segment, mdFileAbsolutePath)
        : transformProse(segment),
    )
    .join('')
    .trim();
}

function routeToMdPath(routePath) {
  // '/docs/learn/filtering/' (index page) -> 'docs/learn/filtering/index.md'
  // '/docs/learn/sorting/overview'        -> 'docs/learn/sorting/overview.md'
  const normalized = routePath.endsWith('/')
    ? `${routePath}index`
    : routePath;
  return `${normalized.slice(1)}.md`;
}

function pageToMarkdown(route) {
  const { title, description, date, author, tags } = route.frontmatter || {};
  const body = transformContent(route);

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
  header.push('', `Canonical page: ${BASE_URL}${route.routePath}`);

  return `${header.join('\n')}\n\n${body}\n`;
}

function writePage(route) {
  const mdRelativePath = routeToMdPath(route.routePath);
  const outFile = path.join(PUBLIC_DIR, mdRelativePath);
  const markdown = pageToMarkdown(route);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, markdown);

  const { title, description } = route.frontmatter || {};
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

  [...docsRoutes, ...blogRoutes].forEach((route) =>
    mdRoutePathSet.add(route.routePath),
  );

  const docsEntries = docsRoutes.map(writePage);
  const blogEntries = blogRoutes.map(writePage);

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
    `generate-llms-docs: wrote ${docsEntries.length} docs + ${blogEntries.length} blog .md pages, blog/index.md, llms.txt and llms-full.txt`,
  );
}

run();
