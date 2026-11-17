import Link from 'next/link';
import * as React from 'react';

import { competitors } from '@www/compare/matrix';
import { getStats } from '@www/compare/matrixUtils';
import { CodeBlock } from '@www/components/CodeBlock';
import { HeroShowcase } from '@www/components/hero/HeroShowcase';
import type { BlogPost } from '@www/utils/blogUtils';

import { getBenchmarkReadouts, type Readout } from './benchmarkReadouts';
import { InstallCommand } from './InstallCommand';
import { LazyDemo } from './LazyDemo';
import { Schematic } from './Schematic';

import './home.css';

const PIVOT_CODE = `<DataSource
  data={trades}
  primaryKey="id"
  groupBy={[{ field: 'sector' }]}
  pivotBy={[{ field: 'region' }]}
  aggregationReducers={{
    pnl: {
      field: 'pnl',
      initialValue: 0,
      reducer: (a, b) => a + b,
    },
  }}
>
  {({ pivotColumns, pivotColumnGroups }) => (
    <InfiniteTable
      pivotColumns={pivotColumns}
      pivotColumnGroups={pivotColumnGroups}
    />
  )}
</DataSource>`;

export const FEATURES = [
  {
    title: 'Sorting',
    text: 'Single and multi-column, local or remote.',
    href: '/docs/learn/sorting/overview',
  },
  {
    title: 'Row grouping',
    text: 'By one or many fields, with lazy data too.',
    href: '/docs/learn/grouping-and-pivoting/grouping-rows',
  },
  {
    title: 'Pivoting',
    text: 'Generated columns, totals, custom headers.',
    href: '/docs/learn/grouping-and-pivoting/pivoting/overview',
  },
  {
    title: 'Aggregations',
    text: 'Built-in and custom reducers, client or server.',
    href: '/docs/learn/grouping-and-pivoting/group-aggregations',
  },
  {
    title: 'Column grouping',
    text: 'Nested headers that resize and reorder together.',
    href: '/docs/learn/columns/column-grouping',
  },
  {
    title: 'Lazy loading',
    text: 'Load batches as you scroll, per group if needed.',
    href: '/docs/learn/working-with-data/lazy-loading',
  },
  {
    title: 'Keyboard navigation',
    text: 'Cells or rows, selection, shortcuts.',
    href: '/docs/learn/keyboard-navigation/navigating-cells',
  },
  {
    title: 'Theming',
    text: 'CSS variables, ready-made themes, three densities.',
    href: '/docs/learn/theming',
  },
];

const PRINCIPLES = [
  {
    title: 'Declarative',
    text: 'Every prop has a controlled and an uncontrolled form.',
  },
  {
    title: 'Typed',
    text: 'Written in TypeScript, generic over your data type.',
  },
  { title: 'Zero dependencies', text: 'Nothing but your framework.' },
  { title: 'React and Vue', text: 'The same grid, the same docs.' },
];

export function SectionBar({
  no,
  name,
  aside,
}: {
  no: string;
  name: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="home-sec__bar">
      <div className="home-wrap home-sec__bar-in">
        <span className="home-sec__no">
          <b>{no}</b> / {name}
        </span>
        {aside ? <span className="home-sec__no">{aside}</span> : null}
      </div>
    </div>
  );
}

function ReadoutCard({ readout }: { readout: Readout }) {
  const max = Math.max(...readout.bars.map((bar) => bar.value));
  return (
    <div className="home-readout">
      <div className="home-readout__top">
        <span className="home-label">{readout.label}</span>
        {readout.badge ? (
          <span className="home-readout__badge">{readout.badge}</span>
        ) : null}
      </div>
      <div className="home-readout__num">
        {readout.text}
        <small>{readout.unit}</small>
      </div>
      <div className="home-bars">
        {readout.bars.map((bar) => (
          <div
            key={bar.name}
            className={`home-bar${bar.us ? ' home-bar--us' : ''}`}
          >
            <span>{bar.name}</span>
            <span className="home-bar__track">
              <i style={{ width: `${(bar.value / max) * 100}%` }} />
            </span>
            <span className="home-bar__val">{bar.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="home-posts">
      {posts.map((post) => (
        <li key={post.href}>
          <Link href={post.href}>
            {post.date ? (
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
            ) : null}
            <b>{post.title}</b>
            {post.readingTime ? <span>{post.readingTime}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomePage({ posts = [] }: { posts?: BlogPost[] }) {
  const bench = getBenchmarkReadouts();
  const stats = getStats('infinite-react');
  const gzipKB = Math.round(stats.bundle.jsGzip / 1000);
  const dependencies = stats.transitiveDependencyCount;

  return (
    <div className="home">
      {/* ---- hero ---- */}
      <section className="home-hero">
        <div className="home-wrap">
          <Link
            className="home-announce"
            href="/docs/learn/theming#available-themes"
          >
            <b>New in 10.1.5</b>
            <span>
              Terminal, Sheet and Paper themes, plus a density setting →
            </span>
          </Link>

          <div className="home-hero__top">
            <div className="home-hero__copy">
              <p className="home-tagline">One Table — Infinite Applications</p>
              <h1>
                The DataGrid for React and Vue, built for speed.
                <span className="home-cursor" aria-hidden="true" />
              </h1>
              <p className="home-hero__sub">
                A million rows, zero dependencies, fully declarative. Grouping,
                pivoting, aggregations, lazy loading and live updates, in one
                component.
              </p>
              <div className="home-actions">
                <Link
                  className="site-key site-key--primary site-key--lg"
                  href="/docs/learn/getting-started"
                >
                  Get started →
                </Link>
                <InstallCommand />
              </div>
              <p className="home-hero__vue">
                Using Vue? <Link href="/vue">Infinite Table for Vue →</Link>
              </p>
            </div>
            <div className="home-hero__schema">
              <Schematic />
              <dl className="home-specs">
                <div>
                  <dt>Rows</dt>
                  <dd>1,000,000</dd>
                </div>
                <div>
                  <dt>Dependencies</dt>
                  <dd>{dependencies}</dd>
                </div>
                <div>
                  <dt>Gzip</dt>
                  <dd>{gzipKB} kB</dd>
                </div>
                <div>
                  <dt>Frameworks</dt>
                  <dd>React / Vue</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="home-frame">
            <div className="home-frame__bar">
              <span className="home-live">Live</span>
              <span className="home-frame__hint">
                Live demo · click the grid to take over
              </span>
              <span className="home-grow" />
              <Link href="/demo">Open full-page demo ↗</Link>
            </div>
            <HeroShowcase />
          </div>
        </div>
      </section>

      {/* ---- 01 performance ---- */}
      <section className="home-sec" id="performance">
        <SectionBar
          no="01"
          name="Performance"
          aside="Four grids, one benchmark"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Measured, not claimed.</h2>
            <p>
              The same data, the same machine, the same gestures, seven runs
              each. The benchmark is open: read the method, then run it
              yourself.
            </p>
          </div>
          <div className="home-readouts">
            {bench.readouts.map((readout) => (
              <ReadoutCard key={readout.label} readout={readout} />
            ))}
            <div className="home-readout">
              <div className="home-readout__top">
                <span className="home-label">Dependencies</span>
              </div>
              <div className="home-readout__num">{dependencies}</div>
              <p className="home-readout__note">
                Nothing but your framework.
                <br />
                <b>{gzipKB} kB</b> of gzipped JavaScript.
              </p>
            </div>
          </div>
          <div className="home-footnote">
            <span>
              {bench.footnote} Scrolling and the other scenarios are on the
              benchmark page.
            </span>
            <Link href={bench.href}>Read the method and all the results →</Link>
          </div>
        </div>
      </section>

      {/* ---- 02 scale ---- */}
      <section className="home-sec" id="scale">
        <SectionBar
          no="02"
          name="Scale"
          aside="Live · rows and columns virtualized"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>A million rows. Go on, scroll.</h2>
            <div>
              <p>
                You scroll an empty container sized like the content; the grid
                moves its header and body itself, on the same frame. The header
                never trails the cells, and a fast fling never shows blank rows.
              </p>
              <p>
                Rows and columns are both virtualized: only what is on screen is
                ever rendered.
              </p>
            </div>
          </div>
          <LazyDemo name="million" />
        </div>
      </section>

      {/* ---- 03 themes ---- */}
      <section className="home-sec" id="themes">
        <SectionBar
          no="03"
          name="Themes"
          aside={<Link href="/themes">The theme gallery →</Link>}
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Themes that change more than color.</h2>
            <p>
              Pick a theme, a mode and a density. Each one is a CSS file and a
              className, and every value is a CSS variable you can override.
            </p>
          </div>
          <LazyDemo name="themes" />
        </div>
      </section>

      {/* ---- 04 pivot ---- */}
      <section className="home-sec" id="pivot">
        <SectionBar
          no="04"
          name="Pivot"
          aside={
            <Link href="/docs/learn/grouping-and-pivoting/pivoting/overview">
              Pivoting docs →
            </Link>
          }
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Pivot in a few lines.</h2>
            <p>
              Group by one field, pivot by another, add an aggregation. The
              pivot columns are generated for you.
            </p>
          </div>
          <div className="home-split">
            <div className="home-split__code">
              <CodeBlock lang="tsx" title="pivot.tsx" highlight="4-5">
                {PIVOT_CODE}
              </CodeBlock>
            </div>
            <LazyDemo name="pivot" />
          </div>
        </div>
      </section>

      {/* ---- 05 features ---- */}
      <section className="home-sec" id="features">
        <SectionBar
          no="05"
          name="Features"
          aside="Everything in one component"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>The enterprise feature set, built in.</h2>
            <p>
              No plugins to wire up and no modules to register. Every feature is
              a prop on the same two components.
            </p>
          </div>
          <div className="home-features">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.title}
                className="home-feature"
                href={feature.href}
              >
                <span className="home-feature__no">F{i + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <span className="home-feature__go" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
          <div className="home-principles">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="home-principle">
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- 06 compare ---- */}
      <section className="home-sec" id="compare">
        <SectionBar
          no="06"
          name="Compare"
          aside={`${competitors.length} grids, one matrix`}
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>How it compares.</h2>
            <p>Feature by feature, with sources, and the things we don't do.</p>
          </div>
          <div className="home-versus">
            {competitors.map((product) => (
              <Link key={product.id} href={`/compare/${product.id}`}>
                <span className="home-versus__what">Infinite Table vs</span>
                <b>{product.name}</b>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
            <Link className="home-versus__all" href="/compare">
              <span>The full matrix</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---- 07 get started ---- */}
      <section className="home-sec" id="editions">
        <SectionBar no="07" name="Get started" aside="React and Vue" />
        <div className="home-wrap">
          <div className="home-editions">
            <div className="home-edition">
              <div className="home-edition__top">
                <span className="home-label">Free</span>
              </div>
              <h3>Start building now.</h3>
              <p>
                Without a license key, Infinite Table shows a license footer
                with a link back to our website. Everything else works.
              </p>
              <div className="home-edition__installs">
                <InstallCommand framework="react" />
                <InstallCommand framework="vue" />
              </div>
            </div>
            <div className="home-edition home-edition--license">
              <div className="home-edition__top">
                <span className="home-label home-label--accent">License</span>
                <span className="home-label">Per developer / year</span>
              </div>
              <h3>Remove the footer, get premium support.</h3>
              <p>
                One seat per front-end developer. Versions released while the
                license is active stay yours, with no warnings.
              </p>
              <div className="home-actions">
                <Link
                  className="site-key site-key--primary site-key--lg"
                  href="/pricing"
                >
                  See pricing →
                </Link>
                <Link
                  className="site-key site-key--lg"
                  href="/docs/learn/getting-started"
                >
                  Read the docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 08 blog ---- */}
      {posts.length ? (
        <section className="home-sec" id="blog">
          <SectionBar
            no="08"
            name="Blog"
            aside={<Link href="/blog">All posts →</Link>}
          />
          <div className="home-wrap">
            <BlogList posts={posts} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
