/*
 * /angular - the home page of Infinite Table for Angular, for now a short
 * version of the Vue one (VueHomePage.tsx): the same sections and styles, but
 * no live demos and no benchmark numbers yet. Links into the docs go to the
 * Angular page where there is one, else to the React page.
 */
import Link from 'next/link';
import * as React from 'react';

import { resolveFrameworkLink } from '@thedatagrid/docs-kit/frameworks';

import { competitors } from '@www/compare/matrix';
import {
  docsHasPage,
  getDocsPage,
  getDocsPagePaths,
} from '@www/utils/docsFrameworkContent';
import { docsFrameworks } from '@www/utils/docsFrameworks';
import { docsFrameworksText } from '@www/utils/docsFrameworksRegistry';
import type { BlogPost } from '@www/utils/blogUtils';

import { BlogList, FEATURES, SectionBar } from './HomePage';
import { InstallCommand } from './InstallCommand';
import { Schematic } from './Schematic';

import './home.css';

/** A docs link for the Angular docs: its page, or the React one when it has none yet. */
const angular = (path: string) => {
  const link = resolveFrameworkLink(
    docsFrameworks,
    path,
    'angular',
    docsHasPage,
  );
  return link.kind === 'missing' ? path : link.href;
};

const PRINCIPLES = [
  {
    title: 'Declarative',
    text: 'Inputs, two-way bound models and outputs, with signals.',
  },
  {
    title: 'Typed',
    text: 'Written in TypeScript, generic over your data type, strict templates.',
  },
  { title: 'Zero dependencies', text: 'Nothing but Angular.' },
  { title: docsFrameworksText(), text: 'The same grid, the same docs.' },
];

export function AngularHomePage({ posts = [] }: { posts?: BlogPost[] }) {
  const guides = getDocsPagePaths('react').filter(
    (path) =>
      path.startsWith('/docs/learn') &&
      !getDocsPage(path)?.frontmatter.draft &&
      !getDocsPage(path)?.frontmatter.redirect_to,
  );
  const angularPages = new Set(getDocsPagePaths('angular'));
  const angularGuides = guides.filter((path) => angularPages.has(path));

  return (
    <div className="home">
      {/* ---- hero ---- */}
      <section className="home-hero">
        <div className="home-wrap">
          <Link className="home-announce" href={angular('/docs')}>
            <b>Angular docs</b>
            <span>
              {angularGuides.length} of {guides.length} guides have Angular
              examples →
            </span>
          </Link>

          <div className="home-hero__top">
            <div className="home-hero__copy">
              <p className="home-tagline">Infinite Table for Angular</p>
              <h1>
                The Angular DataGrid built for speed
                <span className="home-cursor" aria-hidden="true" />
              </h1>
              <p className="home-hero__sub">
                A million rows, zero dependencies, fully declarative. Grouping,
                pivoting, aggregations, lazy loading and live updates, in one
                Angular component, with signals and templates.
              </p>
              <div className="home-actions">
                <Link
                  className="site-key site-key--primary site-key--lg"
                  href={angular('/docs/learn/getting-started')}
                >
                  Get started →
                </Link>
                <InstallCommand framework="angular" />
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
                  <dd>0</dd>
                </div>
                <div>
                  <dt>Angular</dt>
                  <dd>22</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 01 features ---- */}
      <section className="home-sec" id="features">
        <SectionBar
          no="01"
          name="Features"
          aside="Everything in one component"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>The enterprise feature set, built in.</h2>
            <p>
              No plugins to wire up and no modules to register. Every feature is
              an input of the same two components.
            </p>
          </div>
          <div className="home-features">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.title}
                className="home-feature"
                href={angular(feature.href)}
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

      {/* ---- 02 compare ---- */}
      <section className="home-sec" id="compare">
        <SectionBar
          no="02"
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

      {/* ---- 03 get started ---- */}
      <section className="home-sec" id="editions">
        <SectionBar no="03" name="Get started" aside="Angular 22" />
        <div className="home-wrap">
          <div className="home-editions">
            <div className="home-edition">
              <div className="home-edition__top">
                <span className="home-label">Free</span>
              </div>
              <h3>Start building now.</h3>
              <p>
                Install the package and follow the Angular guide: a grid on the
                page takes a DataSource, an InfiniteTable and your columns.
              </p>
              <div className="home-edition__installs">
                <InstallCommand framework="angular" />
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
                  href={angular('/docs/learn/getting-started')}
                >
                  Read the Angular docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 04 blog ---- */}
      {posts.length ? (
        <section className="home-sec" id="blog">
          <SectionBar
            no="04"
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
