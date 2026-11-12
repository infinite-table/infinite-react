import Link from 'next/link';

import {
  benchmark,
  BENCHMARK_RUN_PATH,
  Comparison as GridComparison,
  formatMetric,
  Grid,
  gridName,
  GRIDS,
  gridsOf,
  metric,
  MetricSummary,
  OTHER_GRIDS,
  summarize,
} from '@www/benchmark/stats';
import styles from '@www/compare/components/compare.module.css';
import { JsonLd, Section, breadcrumbJsonLd } from '@www/compare/components/sections';
import { CodeBlock } from '@www/components/CodeBlock';
import {
  BenchmarkChart,
  BenchmarkChartRow,
} from '@www/components/MDX/BenchmarkChart';
import { siteContent } from '@www/content';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title:
    'Infinite Table vs MUI X Data Grid, AG Grid and TanStack Table: benchmark with 300,000 and 1,000,000 rows',
  description:
    'An open, reproducible benchmark of Infinite Table, MUI X Data Grid, AG Grid Community and TanStack Table at 300,000 and 1,000,000 rows: mount time, memory, sorting and scrolling, with the method, the machine and the steps to run it yourself.',
});

const REPO =
  'https://github.com/infinite-table/datagrid-performance-comparison';
const BLOG_POST =
  '/blog/2026/11/11/benchmarking-infinite-table-and-ag-grid-with-a-million-rows';

const SIZES = [
  { id: '300k', label: '300k rows' },
  { id: '1m', label: '1M rows' },
];

/** link the blog post only once it's published */
function blogPostIsPublished() {
  const post = siteContent.paths[BLOG_POST];
  return !!post && post.frontmatter?.draft !== true;
}

/** a chart row with the median of every grid that was measured */
function chartRow(label: string, m: MetricSummary): BenchmarkChartRow {
  const row: BenchmarkChartRow = { label };
  for (const grid of GRIDS) {
    const value = m.values[grid.id];
    if (value != null) {
      row[grid.key] = round(value);
    }
  }
  return row;
}

function rows(scenario: string, key: string) {
  return SIZES.map((size) =>
    chartRow(size.label, metric(size.id, scenario, key)),
  );
}

/** "AG Grid 498 ms, MUI X Data Grid 144 ms, ..." - the grids other than Infinite Table */
function others(m: MetricSummary, unit: string) {
  return OTHER_GRIDS.filter((grid) => m.values[grid.id] != null)
    .map((grid) => `${grid.name} ${formatMetric(m.values[grid.id]!, unit)}`)
    .join(', ');
}

function round(value: number) {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function Comparison({ c, unit }: { c: GridComparison | undefined; unit: string }) {
  if (!c) {
    return <>–</>;
  }
  const better =
    c.winner === 'tie' ? (
      <span className={styles.featureDescription}>no significant difference</span>
    ) : (
      <span className={styles.featureDescription}>
        <strong>{gridName(c.winner)}</strong> is better
      </span>
    );
  if (c.ratio !== undefined && Number.isFinite(c.ratio)) {
    return (
      <>
        {c.ratio.toFixed(2)}×
        <span className={styles.featureDescription}>
          95% CI {c.ci[0].toFixed(2)}–{c.ci[1].toFixed(2)}
        </span>
        {better}
      </>
    );
  }
  return (
    <>
      {c.diff && c.diff > 0 ? '+' : ''}
      {formatMetric(c.diff ?? NaN, unit)}
      <span className={styles.featureDescription}>
        95% CI {formatMetric(c.ci[0], unit)} to {formatMetric(c.ci[1], unit)}
      </span>
      {better}
    </>
  );
}

const SCENARIOS = [
  { id: 'mount', title: 'Mount' },
  { id: 'sort-string', title: 'Sort a string column' },
  { id: 'sort-number', title: 'Sort a number column' },
  { id: 'scroll-jump', title: 'Jump through the dataset' },
  { id: 'scroll-vertical', title: 'Scroll vertically' },
  { id: 'scroll-horizontal', title: 'Scroll horizontally' },
];

function ScenarioTable({ size, scenario }: { size: string; scenario: string }) {
  const summary = summarize(size, scenario);
  const description = benchmark.sizes[size].results[scenario].description;
  const grids = gridsOf(size, scenario);
  const compared = OTHER_GRIDS.filter((grid) =>
    grids.some((g) => g.id === grid.id),
  );
  return (
    <details className={styles.card} style={{ marginTop: '0.75rem' }}>
      <summary style={{ cursor: 'pointer', color: 'var(--cmp-text)', fontWeight: 700 }}>
        {SCENARIOS.find((s) => s.id === scenario)?.title},{' '}
        {SIZES.find((s) => s.id === size)?.label}: every metric
      </summary>
      <p className={styles.muted} style={{ marginTop: '0.75rem' }}>
        {description}
      </p>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              {grids.map((grid) => (
                <th
                  key={grid.id}
                  scope="col"
                  className={`${styles.num} ${
                    grid.id === 'infinite' ? styles.infiniteCol : ''
                  }`}
                >
                  {grid.name}
                </th>
              ))}
              {compared.map((grid) => (
                <th key={grid.id} scope="col" className={styles.num}>
                  Infinite / {grid.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.map((m) => (
              <tr key={m.metric.key}>
                <th scope="row">
                  {m.metric.label}
                  <span className={styles.featureDescription}>
                    {m.metric.better} is better
                  </span>
                </th>
                {grids.map((grid) => (
                  <td
                    key={grid.id}
                    className={`${styles.num} ${
                      grid.id === 'infinite' ? styles.infiniteCol : ''
                    }`}
                  >
                    {formatMetric(m.values[grid.id] ?? NaN, m.metric.unit)}
                  </td>
                ))}
                {compared.map((grid) => (
                  <td key={grid.id} className={styles.num}>
                    <Comparison c={m.vs[grid.id]} unit={m.metric.unit} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

const workRows = (scenario: string) =>
  ['scriptMs', 'layoutMs', 'styleMs', 'taskMs'].map((key) => {
    const m = metric('300k', scenario, key);
    return chartRow(m.metric.label.replace('Main thread: ', ''), m);
  });

/** the versions of the grids, e.g. "AG Grid Community 36.3.0 · ..." */
function versions(separator: string) {
  const env = benchmark.environment;
  const label: Record<Grid, string> = {
    mui: 'MUI X Data Grid (the free DataGrid)',
    'ag-grid': 'AG Grid Community',
    tanstack: 'TanStack Table',
    infinite: 'Infinite Table',
  };
  return GRIDS.map((grid) => `${label[grid.id]} ${env.versions[grid.id]}`).join(
    separator,
  );
}

export default function BenchmarkPage() {
  const env = benchmark.environment;
  const mount1m = metric('1m', 'mount', 'visibleMs');
  const heap1m = metric('1m', 'mount', 'heapMB');
  // how many times faster Infinite Table sorts than each other grid
  const sortRatios = SIZES.flatMap((size) =>
    ['sort-string', 'sort-number'].flatMap((scenario) =>
      ['ascVisibleMs', 'descVisibleMs'].flatMap((key) => {
        const m = metric(size.id, scenario, key);
        return OTHER_GRIDS.map((grid) => m.values[grid.id]! / m.values.infinite!);
      }),
    ),
  );
  const sortMin = Math.min(...sortRatios).toFixed(1);
  const sortMax = Math.max(...sortRatios).toFixed(1);
  const fps = metric('300k', 'scroll-vertical', 'rafFps');
  const jump1m = metric('1m', 'scroll-jump', 'visibleMs');
  const presented1m = metric('1m', 'scroll-vertical', 'presentedAllPct');
  const worstFrame1m = metric('1m', 'scroll-vertical', 'maxFrameMs');
  const fps1m = metric('1m', 'scroll-vertical', 'rafFps');
  // the grids that can't scroll to their last row at 1M rows
  const scroll1m = benchmark.sizes['1m'].scroll ?? {};
  const truncated = GRIDS.filter((grid) => {
    const info = scroll1m[grid.id];
    return info && info.lastVisibleRow < info.rowCount;
  });
  const lastReachable = truncated.length
    ? scroll1m[truncated[0].id]!.lastVisibleRow
    : 0;
  const runDate = new Date(env.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const showBlogLink = blogPostIsPublished();

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Benchmark', path: '/benchmark' }])} />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <span>Infinite Table</span> vs MUI X Data Grid, AG Grid and TanStack
          Table, benchmarked
        </h1>
        <p className={styles.heroTagline}>
          300,000 and 1,000,000 rows, the same data and the same interactions
          in every grid, measured in Chrome. Open source and reproducible: run
          it on your own machine.
        </p>
        <p className={styles.heroMeta}>
          Run <code>{env.runId}</code> on {runDate} · {versions(' · ')}
        </p>
        <ul className={styles.toc} aria-label="On this page">
          <li>
            <a href="#results">Results</a>
          </li>
          <li>
            <a href="#grids">The four grids</a>
          </li>
          <li>
            <a href="#method">Method</a>
          </li>
          <li>
            <a href="#machine">Machine</a>
          </li>
          <li>
            <a href="#limitations">Limitations</a>
          </li>
          <li>
            <a href="#run-it-yourself">Run it yourself</a>
          </li>
        </ul>
      </header>

      <div className={styles.stats}>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>
            {sortMin}–{sortMax}×
          </span>
          <span className={styles.statLabel}>
            faster sorting than each of the other three, at 300k and 1M rows
          </span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>
            {formatMetric(mount1m.values.infinite!, 'ms')}
          </span>
          <span className={styles.statLabel}>
            to show 1M rows. {others(mount1m, 'ms')}
          </span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>
            {formatMetric(heap1m.values.infinite!, 'MB')}
          </span>
          <span className={styles.statLabel}>
            of memory for 1M rows. {others(heap1m, 'MB')}
          </span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>
            {Math.round(fps.values.infinite!)} fps
          </span>
          <span className={styles.statLabel}>
            scrolling 300k rows; the other three hold 60 fps
          </span>
        </div>
      </div>

      <Section
        id="results"
        title="Results"
        lead={
          <>
            <p>
              Medians of {env.runs} runs per grid and scenario. Infinite Table is
              compared with each of the other grids, and where the 95%
              confidence interval includes &quot;no difference&quot; we say so.
              Every chart has a table view, and every scenario has a table with
              all its metrics.
            </p>
            <p>
              Infinite Table is not ahead everywhere, and TanStack Table is not
              like the others: it is a headless library, which we rendered with
              its official virtualization example. Read{' '}
              <a href="#grids">the four grids</a> before comparing the numbers.
            </p>
          </>
        }
      >
        <h3 className={styles.cardTitle}>Mount</h3>
        <p>
          From <code>setState</code> with all rows already in memory to the first
          frame that shows the whole viewport correctly, and until the grid stops
          changing the DOM. With a million rows Infinite Table is the first to
          show them; with 300k rows TanStack Table is a little ahead of it, and
          both are ahead of MUI X Data Grid and AG Grid. Infinite Table keeps
          the least memory at both sizes.
        </p>
        <BenchmarkChart
          title="Mount: first rows painted"
          subtitle={`median of ${env.runs} runs`}
          unit="ms"
          rows={rows('mount', 'visibleMs')}
        />
        <BenchmarkChart
          title="Mount: until settled"
          subtitle={`median of ${env.runs} runs`}
          unit="ms"
          rows={rows('mount', 'settledMs')}
        />
        <BenchmarkChart
          title="JS heap retained by the grid"
          subtitle="after garbage collection"
          unit="MB"
          rows={rows('mount', 'heapMB')}
        />
        {SIZES.map((size) => (
          <ScenarioTable key={size.id} size={size.id} scenario="mount" />
        ))}

        <h3 className={styles.cardTitle} style={{ marginTop: '2.5rem' }}>
          Sorting
        </h3>
        <p>
          Click a column header, from <code>pointerdown</code> to the first frame
          with every visible row sorted. Infinite Table is the fastest in every
          case we measured: {sortMin} to {sortMax} times faster than the other
          three. The string column is lowercase a-z text sorted in an{' '}
          <code>en-US</code> browser.
        </p>
        <BenchmarkChart
          title="Sort a string column (ascending)"
          subtitle={`median of ${env.runs} runs`}
          unit="ms"
          rows={rows('sort-string', 'ascVisibleMs')}
        />
        <BenchmarkChart
          title="Sort a number column (ascending)"
          subtitle={`median of ${env.runs} runs`}
          unit="ms"
          rows={rows('sort-number', 'ascVisibleMs')}
        />
        {SIZES.flatMap((size) =>
          ['sort-string', 'sort-number'].map((scenario) => (
            <ScenarioTable key={size.id + scenario} size={size.id} scenario={scenario} />
          )),
        )}

        <h3 className={styles.cardTitle} style={{ marginTop: '2.5rem' }}>
          Jumping through the dataset
        </h3>
        <p>
          Ten programmatic jumps to far-away positions, like dragging the
          scrollbar thumb. TanStack Table shows the rows{' '}
          {formatMetric(jump1m.values.tanstack!, 'ms')} after a jump at 1M rows
          and MUI X Data Grid {formatMetric(jump1m.values.mui!, 'ms')}; AG Grid
          and Infinite Table take{' '}
          {formatMetric(jump1m.values['ag-grid']!, 'ms')} and{' '}
          {formatMetric(jump1m.values.infinite!, 'ms')}.
        </p>
        <BenchmarkChart
          title="Jump to rows painted"
          subtitle="median of 10 jumps per run"
          unit="ms"
          rows={rows('scroll-jump', 'visibleMs')}
        />
        {SIZES.map((size) => (
          <ScenarioTable key={size.id} size={size.id} scenario="scroll-jump" />
        ))}

        <h3 className={styles.cardTitle} style={{ marginTop: '2.5rem' }}>
          Scrolling
        </h3>
        <p>
          A wheel gesture through Chrome&apos;s real input pipeline: 24,000 px
          down at 8,000 px/s, and four horizontal sweeps across all columns at
          4,000 px/s. Scrolling horizontally, all four grids hold 60 fps.
          Scrolling vertically, the other three hold 59-60 fps and Infinite
          Table {formatMetric(fps.values.infinite!, 'fps')} at 300k rows and{' '}
          {formatMetric(fps1m.values.infinite!, 'fps')} at 1M, with the longest
          single frame of the four ({formatMetric(worstFrame1m.values.infinite!, 'ms')}{' '}
          at 1M rows, on a machine without a GPU). Infinite Table has more of
          its frames fully presented ({formatMetric(presented1m.values.infinite!, '%')}{' '}
          at 1M rows, against about 50% for the others). TanStack Table does
          the least main-thread work scrolling vertically, and Infinite Table
          the least scrolling horizontally at 300k rows.
        </p>
        <BenchmarkChart
          title="Vertical scrolling: frames fully presented"
          subtitle="share of frames that include the grid's latest update"
          unit="%"
          better="higher"
          rows={rows('scroll-vertical', 'presentedAllPct')}
        />
        <BenchmarkChart
          title="Vertical scrolling, 300k rows: main-thread work"
          subtitle={`total over the gesture, median of ${env.runs} runs`}
          unit="ms"
          rows={workRows('scroll-vertical')}
        />
        <BenchmarkChart
          title="Horizontal scrolling, 300k rows: main-thread work"
          subtitle={`total over 4 sweeps, median of ${env.runs} runs`}
          unit="ms"
          rows={workRows('scroll-horizontal')}
        />
        {SIZES.flatMap((size) =>
          ['scroll-vertical', 'scroll-horizontal'].map((scenario) => (
            <ScenarioTable key={size.id + scenario} size={size.id} scenario={scenario} />
          )),
        )}

        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h3 className={styles.cardTitle}>What you see during a very fast scroll</h3>
          <p>
            When you flick the wheel faster than any grid can re-render, a grid
            has to show something for the rows it hasn&apos;t caught up with. AG
            Grid and TanStack Table show empty space until the right content is
            rendered; MUI X Data Grid kept up in this run, with neither blank
            nor stale rows. Infinite Table moves the existing rows into place
            immediately and updates their content on the next render, so strong
            inertial scrolling never reveals blank areas, but for a frame or two
            some rows can show the content they held before. For horizontal
            scrolling it waits for the render.
          </p>
          <p>
            The benchmark measures both effects during a 20,000 px/s flick. Those
            numbers are in the <a href={`${BENCHMARK_RUN_PATH}/report.md`}>full report</a>.
          </p>
        </div>
      </Section>

      <Section
        id="grids"
        title="The four grids"
        lead={
          <p>
            Each grid is on its defaults, installed from npm. Two of them are a
            different kind of thing, which matters when you read their numbers.
          </p>
        }
      >
        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              MUI X Data Grid: all the rows on one page
            </h3>
            <p>
              We used the free, MIT-licensed <code>DataGrid</code>. It always
              paginates, and by default a page has 100 rows.
            </p>
            <p style={{ marginBottom: 0 }}>
              To make it show what the other grids show, it has a page size of{' '}
              <code>-1</code>, the value its{' '}
              <a
                href="https://mui.com/x/react-data-grid/pagination/"
                target="_blank"
                rel="noopener noreferrer"
              >
                documentation
              </a>{' '}
              gives for &quot;all results&quot;. Every row is then on one page,
              which the grid virtualizes and scrolls through like the others do.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>TanStack Table: headless, with our markup</h3>
            <p>
              TanStack Table has the row model and the sorting, and renders
              nothing. We measured what its documentation recommends for large
              tables: TanStack Table with TanStack Virtual for rows and columns
              and plain <code>&lt;table&gt;</code> markup, following the official{' '}
              <a
                href="https://github.com/TanStack/table/tree/main/examples/react/virtualized-columns"
                target="_blank"
                rel="noopener noreferrer"
              >
                virtualized-columns example
              </a>
              .
            </p>
            <p style={{ marginBottom: 0 }}>
              That page has no keyboard navigation, cell selection, column menus,
              resizing or pinned columns, and renders about 40% fewer DOM
              elements than the other grids. Less to do on every frame is part
              of why it scrolls with less work.
            </p>
          </div>
        </div>
        {truncated.length ? (
          <div className={styles.card} style={{ marginTop: '1rem' }}>
            <h3 className={styles.cardTitle}>The last of a million rows</h3>
            <p style={{ marginBottom: 0 }}>
              1,000,000 rows of 40 px are taller than browsers allow an element
              to be. Infinite Table and AG Grid map the scrollbar onto the rows
              and reach the last one.{' '}
              {truncated.map((grid) => grid.name).join(' and ')} don&apos;t:
              the last row they can scroll to is{' '}
              {lastReachable.toLocaleString('en-US')}. Their 1M scrolling numbers
              are for the rows they can reach.
            </p>
          </div>
        ) : null}
      </Section>

      <Section id="method" title="Method">
        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Setup</h3>
            <ul className={styles.list}>
              <li>
                The same deterministic data in every grid: 20 columns, at 300,000
                and 1,000,000 rows, with a checksum verified before every run.
              </li>
              <li>
                Same row height, header height and column widths, and a body of
                the same height. Otherwise each grid runs on its defaults. AG
                Grid uses the Quartz theme,{' '}
                <code>animateRows=&#123;false&#125;</code> and a{' '}
                <code>getRowId</code>. MUI X Data Grid has all its rows on one
                page and shows numbers as they are, without formatting.
                TanStack Table has{' '}
                <code>sortDescFirst: false</code>, so the first click sorts
                ascending, as in the other grids.
              </li>
              <li>Production builds only.</li>
              <li>
                {env.runs} measured runs per grid and scenario, plus {env.warmup}{' '}
                discarded warmup, interleaved, a fresh browser context for every
                run.
              </li>
            </ul>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>How we measure</h3>
            <ul className={styles.list}>
              <li>
                Latency comes from Chrome performance traces, as in{' '}
                <a
                  href="https://github.com/krausest/js-framework-benchmark"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  js-framework-benchmark
                </a>
                : from the input event to the end of the first frame where the DOM
                shows the expected rows and columns.
              </li>
              <li>
                Scrolling uses <code>Input.synthesizeScrollGesture</code>, so
                every grid gets the same real wheel input. Frame outcomes come
                from Chrome&apos;s compositor.
              </li>
              <li>
                Medians, with a seeded 95% bootstrap confidence interval of the
                ratio between Infinite Table and each other grid. We only say
                one is better when the interval excludes &quot;no
                difference&quot;.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="machine" title="Machine and browser">
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <tbody>
              {[
                ['Machine', `${env.cpu}, ${env.os}`],
                [
                  'Browser',
                  `Chrome ${env.chrome}, ${env.headless ? 'headless' : 'headed'}, sandboxed, display scale 1, en-US`,
                ],
                ['CPU throttling', `${env.cpuThrottle}× (none)`],
                ['Viewport', env.viewport],
                ['Runs', `${env.runs} measured + ${env.warmup} warmup per grid and scenario`],
                ['Versions', `${versions(', ')}, all installed from npm`],
                ['Run', `${env.runId}, ${runDate}`],
              ].map(([label, value]) => (
                <tr key={label}>
                  <th scope="row" className={styles.stickyCol}>
                    {label}
                  </th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="limitations" title="Limitations">
        <div className={styles.card}>
          <ul className={styles.list}>
            <li>
              <strong>One machine, one browser.</strong> A shared cloud machine
              with 4 cores and no GPU. Compare the ratios between the grids, not
              the absolute numbers.
            </li>
            <li>
              <strong>Headless Chrome.</strong> It runs the same rendering code as
              headed Chrome, but frame pacing can differ with a real display.
            </li>
            <li>
              <strong>Defaults only.</strong> Every grid has options that could
              change these results. We didn&apos;t tune any of them.
            </li>
            <li>
              <strong>Not four of the same thing.</strong> The TanStack Table
              page is an example, not a full grid, and MUI X Data Grid is on
              one page that holds every row, which is not its default. See{' '}
              <a href="#grids">the four grids</a>.
            </li>
            <li>
              <strong>One dataset shape.</strong> Plain text and numbers: no
              custom cell renderers, grouping, filtering or live updates.
            </li>
            <li>
              <strong>One browser locale.</strong> Strings are sorted in an{' '}
              <code>en-US</code> browser, and the grids don&apos;t all compare
              strings the same way.
            </li>
            <li>
              <strong>We have an interest.</strong> We make Infinite Table. That
              is why everything here is open, and why you can run it yourself.
            </li>
          </ul>
        </div>
      </Section>

      <Section
        id="run-it-yourself"
        title="Run it yourself"
        lead={
          <p>
            The benchmark has{' '}
            <a href={REPO} target="_blank" rel="noopener noreferrer">
              its own repository
            </a>
            , with all four grids installed from npm. You need git and Node.js 20
            or newer (we used 22), on macOS or Linux. Playwright downloads its
            own Chromium.
          </p>
        }
      >
        <CodeBlock lang="sh">{`git clone ${REPO}.git
cd datagrid-performance-comparison
npm install
npx playwright install chromium

# production build, then every scenario at 300k and 1M rows (about an hour)
BENCH_HEADLESS=1 npm run benchmark

# or a taste of it: mount and string sorting, 300k rows, 3 runs
npm run benchmark:build
BENCH_HEADLESS=1 BENCH_SIZES=300k BENCH_SCENARIOS=mount,sort-string BENCH_RUNS=3 npm run benchmark:run`}</CodeBlock>
        <p>
          Each run writes <code>report.md</code> (medians, ratios, confidence
          intervals) and <code>results.json</code> (every raw sample) to{' '}
          <code>benchmark-results/&lt;run id&gt;/</code>. The{' '}
          <a href={`${REPO}#readme`} target="_blank" rel="noopener noreferrer">
            README
          </a>{' '}
          documents every option and scenario, and has the results for the
          latest versions, measured again on GitHub Actions for every new
          release.
        </p>
        <div className={styles.actions} style={{ justifyContent: 'flex-start' }}>
          <a className={styles.button} href={`${BENCHMARK_RUN_PATH}/report.md`}>
            Full report (Markdown)
          </a>
          <a className={styles.button} href={`${BENCHMARK_RUN_PATH}/results.json`}>
            Raw results (JSON)
          </a>
          {showBlogLink ? (
            <Link className={styles.button} href={BLOG_POST}>
              Read the blog post
            </Link>
          ) : null}
          <Link
            className={`${styles.button} ${styles.buttonPrimary}`}
            href="/compare/mui-x-data-grid"
          >
            Infinite Table vs MUI X Data Grid
          </Link>
          <Link className={styles.button} href="/compare/ag-grid">
            vs AG Grid
          </Link>
          <Link className={styles.button} href="/compare/tanstack-table">
            vs TanStack Table
          </Link>
        </div>
      </Section>

      <Section id="fairer" title="Help us make it fairer">
        <div className={styles.card}>
          <p>
            If you know a setting that makes any of the grids faster, a better
            way to render TanStack Table, or a scenario we should add, please{' '}
            <a href={`${REPO}/issues/new`} target="_blank" rel="noopener noreferrer">
              open an issue
            </a>{' '}
            or a pull request. We want the benchmark to be fair to every grid.
          </p>
        </div>
      </Section>
    </div>
  );
}
