import Link from 'next/link';

import {
  benchmark,
  BENCHMARK_RUN_PATH,
  formatMetric,
  metric,
  MetricSummary,
  summarize,
} from '@www/benchmark/stats';
import styles from '@www/compare/components/compare.module.css';
import { JsonLd, Section, breadcrumbJsonLd } from '@www/compare/components/sections';
import { CodeBlock } from '@www/components/CodeBlock';
import { BenchmarkChart } from '@www/components/MDX/BenchmarkChart';
import { siteContent } from '@www/content';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title:
    'Infinite Table vs AG Grid benchmark: 300,000 and 1,000,000 rows',
  description:
    'An open, reproducible benchmark of Infinite Table and AG Grid Community at 300,000 and 1,000,000 rows: mount time, memory, sorting and scrolling, with the method, the machine and the steps to run it yourself.',
});

const REPO = 'https://github.com/infinite-table/infinite-react';
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

function rows(scenario: string, key: string, labelFor = (size: string) => size) {
  return SIZES.map((size) => {
    const m = metric(size.id, scenario, key);
    return {
      label: labelFor(size.label),
      ag: round(m.ag),
      infinite: round(m.infinite),
      note: m.winner === 'tie' ? 'no significant difference' : undefined,
    };
  });
}

function round(value: number) {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function Comparison({ m }: { m: MetricSummary }) {
  const unit = m.metric.unit;
  if (m.ratio !== undefined && Number.isFinite(m.ratio)) {
    return (
      <>
        {m.ratio.toFixed(2)}×
        <span className={styles.featureDescription}>
          95% CI {m.ci[0].toFixed(2)}–{m.ci[1].toFixed(2)}
        </span>
      </>
    );
  }
  return (
    <>
      {m.diff && m.diff > 0 ? '+' : ''}
      {formatMetric(m.diff ?? NaN, unit)}
      <span className={styles.featureDescription}>
        95% CI {formatMetric(m.ci[0], unit)} to {formatMetric(m.ci[1], unit)}
      </span>
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
              <th scope="col" className={styles.num}>
                AG Grid
              </th>
              <th scope="col" className={`${styles.num} ${styles.infiniteCol}`}>
                Infinite Table
              </th>
              <th scope="col" className={styles.num}>
                Infinite / AG
              </th>
              <th scope="col">Better</th>
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
                <td className={styles.num}>{formatMetric(m.ag, m.metric.unit)}</td>
                <td className={`${styles.num} ${styles.infiniteCol}`}>
                  {formatMetric(m.infinite, m.metric.unit)}
                </td>
                <td className={styles.num}>
                  <Comparison m={m} />
                </td>
                <td>
                  {m.winner === 'tie' ? (
                    <span className={styles.muted}>no significant difference</span>
                  ) : (
                    <strong>{m.winner}</strong>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function BenchmarkPage() {
  const env = benchmark.environment;
  const mount1m = metric('1m', 'mount', 'visibleMs');
  const heap1m = metric('1m', 'mount', 'heapMB');
  const sortRatios = SIZES.flatMap((size) =>
    ['sort-string', 'sort-number'].flatMap((scenario) =>
      ['ascVisibleMs', 'descVisibleMs'].map((key) => {
        const m = metric(size.id, scenario, key);
        return m.ag / m.infinite;
      }),
    ),
  );
  const sortMin = Math.min(...sortRatios).toFixed(1);
  const sortMax = Math.max(...sortRatios).toFixed(1);
  const fps = metric('300k', 'scroll-vertical', 'rafFps');
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
          <span>Infinite Table</span> vs AG Grid, benchmarked
        </h1>
        <p className={styles.heroTagline}>
          300,000 and 1,000,000 rows, the same data and the same interactions
          in both grids, measured in Chrome. Open source and reproducible: run
          it on your own machine.
        </p>
        <p className={styles.heroMeta}>
          Run <code>{env.runId}</code> on {runDate} · AG Grid Community{' '}
          {env.versions['ag-grid']} · Infinite Table {env.versions.infinite}
        </p>
        <ul className={styles.toc} aria-label="On this page">
          <li>
            <a href="#results">Results</a>
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
            {formatMetric(mount1m.infinite, 'ms')}
          </span>
          <span className={styles.statLabel}>
            to show 1M rows, vs {formatMetric(mount1m.ag, 'ms')} for AG Grid
          </span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>
            {formatMetric(heap1m.infinite, 'MB')}
          </span>
          <span className={styles.statLabel}>
            of memory for 1M rows, vs {formatMetric(heap1m.ag, 'MB')}
          </span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>
            {sortMin}–{sortMax}×
          </span>
          <span className={styles.statLabel}>faster sorting, 300k and 1M rows</span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statValue}>{Math.round(fps.infinite)} fps</span>
          <span className={styles.statLabel}>
            scrolling 300k rows, for both grids: a tie
          </span>
        </div>
      </div>

      <Section
        id="results"
        title="Results"
        lead={
          <p>
            Medians of {env.runs} runs per grid and scenario. Where the 95%
            confidence interval includes &quot;no difference&quot;, we call it a
            tie. Every chart has a table view, and every scenario has a table
            with all its metrics.
          </p>
        }
      >
        <h3 className={styles.cardTitle}>Mount</h3>
        <p>
          From <code>setState</code> with all rows already in memory to the first
          frame that shows the whole viewport correctly, and until the grid stops
          changing the DOM.
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
          with every visible row sorted.
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
          scrollbar thumb.
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
          4,000 px/s. At 300k rows both grids hold 60 fps, with no dropped
          frames and no long animation frames; at 1M rows both stay at 59-60
          fps, with no significant difference. Where they differ is how much
          main-thread work it takes:
        </p>
        <BenchmarkChart
          title="Vertical scrolling, 300k rows: main-thread work"
          subtitle={`total over the gesture, median of ${env.runs} runs`}
          unit="ms"
          rows={['scriptMs', 'layoutMs', 'styleMs', 'taskMs'].map((key) => {
            const m = metric('300k', 'scroll-vertical', key);
            return {
              label: m.metric.label.replace('Main thread: ', ''),
              ag: round(m.ag),
              infinite: round(m.infinite),
              note: m.winner === 'tie' ? 'no significant difference' : undefined,
            };
          })}
        />
        <BenchmarkChart
          title="Horizontal scrolling, 300k rows: main-thread work"
          subtitle={`total over 4 sweeps, median of ${env.runs} runs`}
          unit="ms"
          rows={['scriptMs', 'layoutMs', 'styleMs', 'taskMs'].map((key) => {
            const m = metric('300k', 'scroll-horizontal', key);
            return {
              label: m.metric.label.replace('Main thread: ', ''),
              ag: round(m.ag),
              infinite: round(m.infinite),
              note: m.winner === 'tie' ? 'no significant difference' : undefined,
            };
          })}
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
            Grid shows empty space until the right content is rendered. Infinite
            Table moves the existing rows into place immediately and updates
            their content on the next render, so strong inertial scrolling never
            reveals blank areas, but for a frame or two some rows can show the
            content they held before. For horizontal scrolling it waits for the
            render.
          </p>
          <p>
            The benchmark measures both effects during a 20,000 px/s flick. Those
            numbers are in the <a href={`${BENCHMARK_RUN_PATH}/report.md`}>full report</a>.
          </p>
        </div>
      </Section>

      <Section id="method" title="Method">
        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Setup</h3>
            <ul className={styles.list}>
              <li>
                The same deterministic data in both grids: 20 columns, at 300,000
                and 1,000,000 rows, with a checksum verified before every run.
              </li>
              <li>
                Same row height, header height and column widths. Otherwise each
                grid runs on its defaults. AG Grid uses the Quartz theme,{' '}
                <code>animateRows=&#123;false&#125;</code> and a{' '}
                <code>getRowId</code>.
              </li>
              <li>Production builds only.</li>
              <li>
                {env.runs} measured runs per grid and scenario, plus {env.warmup}{' '}
                discarded warmup, interleaved A/B, a fresh browser context for
                every run.
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
                both grids get the same real wheel input. Frame outcomes come from
                Chrome&apos;s compositor.
              </li>
              <li>
                Medians, with a seeded 95% bootstrap confidence interval of the
                ratio between the grids. We only call a winner when the interval
                excludes &quot;no difference&quot;.
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
                  `Chrome ${env.chrome}, ${env.headless ? 'headless' : 'headed'}, sandboxed, display scale 1`,
                ],
                ['CPU throttling', `${env.cpuThrottle}× (none)`],
                ['Viewport', env.viewport],
                ['Runs', `${env.runs} measured + ${env.warmup} warmup per grid and scenario`],
                [
                  'Versions',
                  `AG Grid Community ${env.versions['ag-grid']}, Infinite Table ${env.versions.infinite} (built from source)`,
                ],
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
              <strong>One machine, one browser.</strong> A fast laptop without CPU
              throttling. Compare the ratios between the grids, not the absolute
              numbers.
            </li>
            <li>
              <strong>Headless Chrome.</strong> It runs the same rendering code as
              headed Chrome, but frame pacing can differ with a real display.
            </li>
            <li>
              <strong>Defaults only.</strong> Both grids have options that could
              change these results. We didn&apos;t tune either.
            </li>
            <li>
              <strong>One dataset shape.</strong> Plain text and numbers: no
              custom cell renderers, grouping, filtering or live updates.
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
            The benchmark lives in{' '}
            <a
              href={`${REPO}/tree/master/examples/src/benchmark`}
              target="_blank"
              rel="noopener noreferrer"
            >
              examples/src/benchmark
            </a>{' '}
            in the Infinite Table repository. You need git, Node.js (we used 22)
            and about 2.5 GB of disk space, on macOS or Linux. Playwright
            downloads its own Chromium.
          </p>
        }
      >
        <CodeBlock lang="sh">{`git clone ${REPO}.git
cd infinite-react

# three installs: shared tooling, the grid's source, the examples app
npm ci
npm ci --prefix source
npm ci --prefix examples

cd examples
npx playwright install chromium

# production build, then every scenario at 300k and 1M rows (about 25 minutes)
BENCH_HEADLESS=1 npm run benchmark

# or a one-minute taste: mount and string sorting, 300k rows, 3 runs
BENCH_HEADLESS=1 BENCH_SIZES=300k BENCH_SCENARIOS=mount,sort-string BENCH_RUNS=3 npm run benchmark:run`}</CodeBlock>
        <p>
          Each run writes <code>report.md</code> (medians, ratios, confidence
          intervals) and <code>results.json</code> (every raw sample) to{' '}
          <code>examples/benchmark-results/&lt;run id&gt;/</code>. The{' '}
          <a
            href={`${REPO}/tree/master/examples/src/benchmark#readme`}
            target="_blank"
            rel="noopener noreferrer"
          >
            README
          </a>{' '}
          documents every option and scenario.
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
          <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/compare/ag-grid">
            Infinite Table vs AG Grid
          </Link>
        </div>
      </Section>

      <Section id="fairer" title="Help us make it fairer">
        <div className={styles.card}>
          <p>
            If you know a setting that makes either grid faster, or a scenario we
            should add, please{' '}
            <a href={`${REPO}/issues/new`} target="_blank" rel="noopener noreferrer">
              open an issue
            </a>{' '}
            or a pull request. We want the benchmark to be fair to both grids.
          </p>
        </div>
      </Section>
    </div>
  );
}
