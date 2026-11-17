/*
 * /vue - the home page of Infinite Table for Vue. The same sections and
 * styles as the React home page (HomePage.tsx), in the same order, with demos
 * that run the Vue grid: the hero and the section demos are the Vue ports of
 * the React ones (content/home/vue-*.demo.vue), and the numbers are those of
 * the Vue benchmark.
 */
import fs from 'node:fs';

import Link from 'next/link';
import * as React from 'react';

import { competitors } from '@www/compare/matrix';
import { CodeBlock } from '@www/components/CodeBlock';
import { VueHeroShowcase } from '@www/components/hero/VueHeroShowcase';
import { getStats } from '@www/compare/matrixUtils';
import { getDocsPage, getDocsPagePaths } from '@www/utils/docsFrameworkContent';
import { docsFrameworks } from '@www/utils/docsFrameworks';
import { DOCS_DEMO_MANIFEST_VUE } from '@www/utils/docsKit';
import type { BlogPost } from '@www/utils/blogUtils';

import { getVueBenchmarkReadouts } from './benchmarkReadouts';
import {
  BlogList,
  FEATURES,
  PRINCIPLES,
  ReadoutCard,
  SectionBar,
} from './HomePage';
import { InstallCommand } from './InstallCommand';
import { Schematic } from './Schematic';
import { VueFrameDemo } from './VueFrameDemo';

import './home.css';

const vue = (path: string) => docsFrameworks.pathFor(path, 'vue');

const PIVOT_CODE = `<DataSource
  :data="trades"
  primaryKey="id"
  :groupBy="[{ field: 'sector' }]"
  :pivotBy="[{ field: 'region' }]"
  :aggregationReducers="{
    pnl: {
      field: 'pnl',
      initialValue: 0,
      reducer: (a, b) => a + b,
    },
  }"
>
  <template #default="{ pivotColumns, pivotColumnGroups }">
    <InfiniteTable
      :pivotColumns="pivotColumns"
      :pivotColumnGroups="pivotColumnGroups"
    />
  </template>
</DataSource>`;

/**
 * The page the docs-kit Vue build made of a demo in content/home: the hero
 * (vue-hero.demo.vue) and the section demos (vue-home-*.demo.vue).
 */
function vueDemoPage(name: string): string {
  const manifest = JSON.parse(fs.readFileSync(DOCS_DEMO_MANIFEST_VUE, 'utf8'));
  const page = manifest.demos?.[`home/${name}`]?.html;
  if (!page) {
    throw new Error(
      `The Vue demo "home/${name}" is not in ${DOCS_DEMO_MANIFEST_VUE}: run \`npm run build-demos\`.`,
    );
  }
  return page;
}

export function VueHomePage({ posts = [] }: { posts?: BlogPost[] }) {
  const stats = getStats('infinite-vue');
  const gzipKB = Math.round(stats.bundle.jsGzip / 1000);
  const dependencies = stats.transitiveDependencyCount;

  const guides = getDocsPagePaths('react').filter(
    (path) =>
      path.startsWith('/docs/learn') &&
      !getDocsPage(path)?.frontmatter.draft &&
      !getDocsPage(path)?.frontmatter.redirect_to,
  );
  const vuePages = new Set(getDocsPagePaths('vue'));
  const vueGuides = guides.filter((path) => vuePages.has(path));
  const heroPage = vueDemoPage('vue-hero');
  const bench = getVueBenchmarkReadouts();

  return (
    <div className="home">
      {/* ---- hero ---- */}
      <section className="home-hero">
        <div className="home-wrap">
          <Link className="home-announce" href={vue('/docs')}>
            <b>Vue docs</b>
            <span>
              {vueGuides.length} of {guides.length} guides have Vue examples →
            </span>
          </Link>

          <div className="home-hero__top">
            <div className="home-hero__copy">
              <p className="home-tagline">Infinite Table for Vue</p>
              <h1>
                The Vue DataGrid built for speed
                <span className="home-cursor" aria-hidden="true" />
              </h1>
              <p className="home-hero__sub">
                A million rows, zero dependencies, fully declarative. Grouping,
                pivoting, aggregations, lazy loading and live updates, in one
                Vue component.
              </p>
              <div className="home-actions">
                <Link
                  className="site-key site-key--primary site-key--lg"
                  href={vue('/docs/learn/getting-started')}
                >
                  Get started →
                </Link>
                <InstallCommand framework="vue" />
              </div>
              <p className="home-hero__vue">
                Using React? <Link href="/">Infinite Table for React →</Link>
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
                  <dt>Vue</dt>
                  <dd>3</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="home-frame">
            <div className="home-frame__bar">
              <span className="home-live">Live</span>
              <span className="home-frame__hint">
                Live demo, built with Vue · click the grid to take over
              </span>
              <span className="home-grow" />
              <a href={heroPage} target="_blank" rel="noreferrer">
                Open full-page demo ↗
              </a>
            </div>
            <VueHeroShowcase src={heroPage} />
          </div>
        </div>
      </section>

      {/* ---- 01 performance ---- */}
      <section className="home-sec" id="performance">
        <SectionBar
          no="01"
          name="Performance"
          aside={`${bench.readouts[0].bars.length} Vue grids, one benchmark`}
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Measured, not claimed.</h2>
            <p>
              The same data, the same machine, the same gestures, seven runs
              each, with the Vue build of every grid. The benchmark is open:
              read the method, then run it yourself.
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
                Nothing but Vue.
                <br />
                <b>{gzipKB} kB</b> of gzipped JavaScript.
              </p>
            </div>
          </div>
          <div className="home-footnote">
            <span>
              {bench.footnote} Scrolling and the other scenarios
              are in the benchmark's repository.
            </span>
            <a href={bench.href} target="_blank" rel="noreferrer">
              Read the method and all the results →
            </a>
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
          <VueFrameDemo
            name="million"
            src={vueDemoPage('vue-home-million')}
            title="Infinite Table for Vue: a million rows"
          />
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
              class, and every value is a CSS variable you can override.
            </p>
          </div>
          <VueFrameDemo
            name="themes"
            src={vueDemoPage('vue-home-themes')}
            title="Infinite Table for Vue: themes, modes and densities"
          />
        </div>
      </section>

      {/* ---- 04 pivot ---- */}
      <section className="home-sec" id="pivot">
        <SectionBar
          no="04"
          name="Pivot"
          aside={
            <Link
              href={vue('/docs/learn/grouping-and-pivoting/pivoting/overview')}
            >
              Pivoting docs →
            </Link>
          }
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Pivot in a few lines.</h2>
            <p>
              Group by one field, pivot by another, add an aggregation. The
              pivot columns are generated for you, and arrive in the default
              slot of the DataSource.
            </p>
          </div>
          <div className="home-split">
            <div className="home-split__code">
              <CodeBlock lang="vue" title="Pivot.vue" highlight="4-5">
                {PIVOT_CODE}
              </CodeBlock>
            </div>
            <VueFrameDemo
              name="pivot"
              src={vueDemoPage('vue-home-pivot')}
              title="Infinite Table for Vue: pivoting"
              fill
            />
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
              a prop on the same two components, and each of these guides has
              Vue examples.
            </p>
          </div>
          <div className="home-features">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.title}
                className="home-feature"
                href={vue(feature.href)}
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
        <SectionBar no="07" name="Get started" aside="Vue 3" />
        <div className="home-wrap">
          <div className="home-editions">
            <div className="home-edition">
              <div className="home-edition__top">
                <span className="home-label">Free</span>
              </div>
              <h3>Start building now.</h3>
              <p>
                Install the package and follow the Vue guide: a grid on the page
                takes a DataSource, an InfiniteTable and your columns.
              </p>
              <div className="home-edition__installs">
                <InstallCommand framework="vue" />
              </div>
            </div>
            <div className="home-edition home-edition--license">
              <div className="home-edition__top">
                <span className="home-label home-label--accent">License</span>
                <span className="home-label">Per developer / year</span>
              </div>
              <h3>Licensing and premium support.</h3>
              <p>
                Infinite Table is licensed per front-end developer. The pricing
                page has the terms.
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
                  href={vue('/docs/learn/getting-started')}
                >
                  Read the Vue docs
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
