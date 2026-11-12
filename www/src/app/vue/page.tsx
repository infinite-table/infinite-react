// /vue - the landing page of Infinite Table for Vue. The Vue docs live under
// /vue/docs/...; this page is their front door and shows which docs pages
// already have a Vue version.
import Link from 'next/link';
import { createDemoComponents } from '@thedatagrid/docs-kit/react';

import { AccentButton } from '@www/components/AccentButton';
import TerminalBlock from '@www/components/MDX/TerminalBlock';
import { asMeta } from '@www/utils/asMeta';
import {
  getDocsPage,
  getDocsPageMeta,
  getDocsPagePaths,
} from '@www/utils/docsFrameworkContent';
import {
  docsFrameworks,
  DOCS_FRAMEWORK_PACKAGE,
} from '@www/utils/docsFrameworks';
import {
  DOCS_CODE_THEMES,
  DOCS_CONTENT_DIR,
  DOCS_DEMO_ANCHOR_PREFIX,
  DOCS_DEMO_HEIGHTS,
  DOCS_DEMO_MANIFEST_VUE,
} from '@www/utils/docsKit';

export const metadata = asMeta({
  title: 'Infinite Table for Vue — the Vue DataGrid for huge datasets',
  description:
    'Infinite Table for Vue 3: a virtualized Vue DataGrid with sorting, row grouping, pivoting, aggregations, filtering and lazy loading. Install @infinite-table/infinite-vue and get started.',
  alternates: { canonical: 'https://infinite-table.com/vue' },
});

const GETTING_STARTED = '/docs/learn/getting-started';

// the editable demo of the Vue "Getting Started" page
const { Demo } = createDemoComponents({
  contentDir: DOCS_CONTENT_DIR,
  folder: 'docs/learn/getting-started',
  manifest: DOCS_DEMO_MANIFEST_VUE,
  heights: DOCS_DEMO_HEIGHTS,
  themes: DOCS_CODE_THEMES,
  anchorPrefix: DOCS_DEMO_ANCHOR_PREFIX,
});

const HIGHLIGHTS = [
  {
    title: 'Vue components and composables',
    text: 'DataSource and InfiniteTable are Vue 3 components. Bind props in the template, keep controlled state in refs, and render cells with h().',
  },
  {
    title: 'One grid, two frameworks',
    text: 'The Vue and React packages are built from the same source and released together, with the same version number.',
  },
  {
    title: 'Tested in a real browser',
    text: 'The React and the Vue build share their end-to-end specs: the same test runs against both grids.',
  },
];

export default function VueLandingPage() {
  const vuePages = getDocsPagePaths('vue');
  const reactPages = getDocsPagePaths('react').filter(
    (path) =>
      path.startsWith('/docs/learn') && !getDocsPage(path)?.frontmatter.draft,
  );
  const vueLearnPages = vuePages.filter((path) => reactPages.includes(path));

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-12 pb-24 text-content-color">
      <p className="text-base uppercase tracking-widest text-glow font-bold">
        Infinite Table for Vue
      </p>
      <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-white">
        The Vue DataGrid for huge datasets
      </h1>
      <p className="mt-6 text-xl leading-relaxed max-w-3xl">
        <code className="text-code">{DOCS_FRAMEWORK_PACKAGE.vue}</code> brings
        Infinite Table to Vue 3: a virtualized DataGrid with sorting, row
        grouping, pivoting, aggregations, filtering and lazy loading.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <AccentButton
          glow
          href={docsFrameworks.pathFor(GETTING_STARTED, 'vue')}
        >
          Get started with Vue
        </AccentButton>
        <Link
          className="text-link hover:underline underline-offset-4 text-lg"
          href={docsFrameworks.pathFor('/docs', 'vue')}
        >
          Read the Vue docs
        </Link>
      </div>

      <div className="mt-10 max-w-xl">
        <TerminalBlock>{`npm i ${DOCS_FRAMEWORK_PACKAGE.vue}`}</TerminalBlock>
      </div>

      <h2 className="mt-16 text-3xl font-bold text-white">
        A grid in a single-file component
      </h2>
      <p className="mt-4 text-lg max-w-3xl">
        This is the whole component. Click <b>edit</b> to change the code and
        see the grid update, or <b>fork</b> to open it in CodeSandbox.
      </p>
      <div className="mt-6">
        <Demo
          name="meet-the-code"
          height="small"
          title="Infinite Table in Vue"
        />
      </div>

      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="bg-darkcustom shadow-inner rounded-lg p-6"
          >
            <h3 className="font-bold text-xl text-white">{item.title}</h3>
            <p className="mt-3 text-base leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-16 text-3xl font-bold text-white">
        The Vue docs are growing
      </h2>
      <p className="mt-4 text-lg max-w-3xl">
        We are writing the Vue version of the documentation page by page:{' '}
        <b>
          {vueLearnPages.length} of {reactPages.length}
        </b>{' '}
        guides have Vue examples so far. The rest are marked{' '}
        <span className="docs-framework-marker" style={{ marginLeft: 0 }}>
          React
        </span>{' '}
        in the sidebar of the Vue docs and open the React page - the concepts
        and the props are the same.
      </p>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg">
        {vuePages.map((path) => (
          <li key={path}>
            <Link
              className="text-link hover:underline underline-offset-4"
              href={docsFrameworks.pathFor(path, 'vue')}
            >
              {getDocsPageMeta(getDocsPage(path), 'vue').title ?? path}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-16 text-lg">
        Using React?{' '}
        <Link
          className="text-link hover:underline underline-offset-4"
          href="/docs"
        >
          The React docs are here
        </Link>
        .
      </p>
    </main>
  );
}
