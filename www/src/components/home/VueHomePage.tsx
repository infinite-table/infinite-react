/*
 * /vue - the home page of Infinite Table for Vue. The same sections and
 * styles as the React home page (HomePage.tsx), with demos that run the Vue
 * grid: the docs' own Vue demos, with their code and the editor.
 */
import Link from 'next/link';
import * as React from 'react';
import { createDemoComponents } from '@thedatagrid/docs-kit/react';

import { competitors } from '@www/compare/matrix';
import { getStats } from '@www/compare/matrixUtils';
import { getDocsPage, getDocsPagePaths } from '@www/utils/docsFrameworkContent';
import { docsFrameworks } from '@www/utils/docsFrameworks';
import {
  DOCS_CODE_THEMES,
  DOCS_CONTENT_DIR,
  DOCS_DEMO_ANCHOR_PREFIX,
  DOCS_DEMO_HEIGHTS,
  DOCS_DEMO_MANIFEST_VUE,
} from '@www/utils/docsKit';

import { FEATURES, SectionBar } from './HomePage';
import { InstallCommand } from './InstallCommand';
import { Schematic } from './Schematic';

import './home.css';

const vue = (path: string) => docsFrameworks.pathFor(path, 'vue');

/** the Vue demos of a docs folder, as on the Vue docs pages */
const demosOf = (folder: string) =>
  createDemoComponents({
    contentDir: DOCS_CONTENT_DIR,
    folder,
    manifest: DOCS_DEMO_MANIFEST_VUE,
    heights: DOCS_DEMO_HEIGHTS,
    themes: DOCS_CODE_THEMES,
    anchorPrefix: DOCS_DEMO_ANCHOR_PREFIX,
  }).Demo;

const GettingStartedDemo = demosOf('docs/learn/getting-started');
const PivotDemo = demosOf('docs/learn/grouping-and-pivoting/pivoting');
const ThemingDemo = demosOf('docs/learn/theming');

const PRINCIPLES = [
  {
    title: 'Vue components',
    text: 'DataSource and InfiniteTable are Vue 3 components: bind props in the template.',
  },
  {
    title: 'Refs and composables',
    text: 'Controlled state lives in refs. Cells and headers read theirs from composables.',
  },
  {
    title: 'One grid, two frameworks',
    text: 'Built from the same source as the React package, released with the same version.',
  },
  {
    title: 'The same tests',
    text: 'The end-to-end specs run against both the React and the Vue grid.',
  },
];

export function VueHomePage() {
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
        </div>
      </section>

      {/* ---- 01 a component ---- */}
      <section className="home-sec" id="component">
        <SectionBar
          no="01"
          name="A single-file component"
          aside="Live · the Vue grid"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>The whole grid, in one component.</h2>
            <p>
              This is a real Vue grid, not a screenshot. Open the <b>Code</b>{' '}
              tab to read the component, <b>edit</b> it and watch the grid
              update, or <b>fork</b> it.
            </p>
          </div>
          <div className="home-vue-demo">
            <GettingStartedDemo
              name="meet-the-code"
              height="small"
              title="Infinite Table in Vue"
            />
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

      {/* ---- 02 pivot ---- */}
      <section className="home-sec" id="pivot">
        <SectionBar
          no="02"
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
          <div className="home-vue-demo">
            <PivotDemo
              name="pivoting-example"
              title="Pivoting with an average aggregation"
            />
          </div>
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
              Pick a theme and a mode. Each one is a CSS file and a className,
              and every value is a CSS variable you can override.
            </p>
          </div>
          <div className="home-vue-demo">
            <ThemingDemo
              name="theme-switching-minimalist-theme-default-example"
              title="Switching the theme and the mode"
            />
          </div>
        </div>
      </section>

      {/* ---- 04 features ---- */}
      <section className="home-sec" id="features">
        <SectionBar
          no="04"
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
        </div>
      </section>

      {/* ---- 05 compare ---- */}
      <section className="home-sec" id="compare">
        <SectionBar
          no="05"
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

      {/* ---- 06 get started ---- */}
      <section className="home-sec" id="editions">
        <SectionBar no="06" name="Get started" aside="Vue 3" />
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
    </div>
  );
}
