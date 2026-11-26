/*
 * The home page of Infinite Table for a framework the site doesn't bundle:
 * /vue (VueHomePage.tsx) and /angular (AngularHomePage.tsx). The same
 * sections and styles as the React home page (HomePage.tsx), in the same
 * order, with demos that run that framework's grid: the hero and the section
 * demos are its ports of the React ones (content/home/<framework>-*.demo.*),
 * each in an iframe. What differs per framework (copy, links, the pivot
 * code, the benchmark section) comes in a `FrameworkHome`.
 */
import fs from 'node:fs';

import Link from 'next/link';
import * as React from 'react';

import { competitors } from '@www/compare/matrix';
import { CodeBlock } from '@www/components/CodeBlock';
import { HeroFrameShowcase } from '@www/components/hero/HeroFrameShowcase';
import { getDocsPage, getDocsPagePaths } from '@www/utils/docsFrameworkContent';
import { DOCS_DEMO_MANIFESTS } from '@www/utils/docsKit';
import type { BlogPost } from '@www/utils/blogUtils';

import { FrameDemo } from './FrameDemo';
import { BlogList, FEATURES, SectionBar } from './HomePage';
import { InstallCommand } from './InstallCommand';
import { OtherFrameworks } from './OtherFrameworks';
import { Schematic } from './Schematic';

import './home.css';

export type FrameworkHome = {
  framework: 'vue' | 'angular';
  /** The framework's name in the copy: "Vue", "Angular". */
  name: string;
  /** The link of a docs page (`/docs/...`) for this framework. */
  docsLink: (path: string) => string;
  /** The paragraph under the title. */
  heroSub: string;
  /** The specs under the schematic. */
  specs: { label: string; value: React.ReactNode }[];
  /** The benchmark section (before the demos), given its number. */
  performance?: (no: string) => React.ReactNode;
  /** The code next to the pivot demo, and the text above it. */
  pivot: {
    code: string;
    lang: string;
    title: string;
    highlight: string;
    text: string;
  };
  /** The text above the features. */
  featuresText: string;
  principles: { title: string; text: string }[];
  /** The framework versions: "Vue 3". */
  versions: string;
};

/**
 * The page the docs-kit build of a framework made of a demo in content/home:
 * the hero (<framework>-hero) and the section demos (<framework>-home-*).
 */
function demoPages(framework: FrameworkHome['framework']) {
  const file = DOCS_DEMO_MANIFESTS[framework];
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  return (name: string): string => {
    const page = manifest.demos?.[`home/${name}`]?.html;
    if (!page) {
      throw new Error(
        `The ${framework} demo "home/${name}" is not in ${file}: run \`npm run build-demos\`.`,
      );
    }
    return page;
  };
}

export function FrameworkHomePage({
  home,
  posts = [],
}: {
  home: FrameworkHome;
  posts?: BlogPost[];
}) {
  const { framework, name, docsLink: link } = home;

  const guides = getDocsPagePaths('react').filter(
    (path) =>
      path.startsWith('/docs/learn') &&
      !getDocsPage(path)?.frontmatter.draft &&
      !getDocsPage(path)?.frontmatter.redirect_to,
  );
  const frameworkPages = new Set(getDocsPagePaths(framework));
  const frameworkGuides = guides.filter((path) => frameworkPages.has(path));

  const demoPage = demoPages(framework);
  const heroPage = demoPage(`${framework}-hero`);

  // the sections are numbered in order; the benchmark one is optional
  const sections = [
    home.performance ? 'performance' : null,
    'scale',
    'themes',
    'pivot',
    'features',
    'compare',
    'editions',
    posts.length ? 'blog' : null,
  ].filter(Boolean);
  const no = (section: string) =>
    String(sections.indexOf(section) + 1).padStart(2, '0');

  return (
    <div className="home">
      {/* ---- hero ---- */}
      <section className="home-hero">
        <div className="home-wrap">
          <Link className="home-announce" href={link('/docs')}>
            <b>{`${name} docs`}</b>
            <span>
              {frameworkGuides.length} of {guides.length}
              {` guides have ${name} examples →`}
            </span>
          </Link>

          <div className="home-hero__top">
            <div className="home-hero__copy">
              <p className="home-tagline">{`Infinite Table for ${name}`}</p>
              <h1>
                The <span className="home-accent">{name}</span> DataGrid built
                for speed
                <span className="home-cursor" aria-hidden="true" />
              </h1>
              <p className="home-hero__sub">{home.heroSub}</p>
              <div className="home-actions">
                <Link
                  className="site-key site-key--primary site-key--lg"
                  href={link('/docs/learn/getting-started')}
                >
                  Get started →
                </Link>
                <InstallCommand framework={framework} />
              </div>
              <OtherFrameworks current={framework} />
            </div>
            <div className="home-hero__schema">
              <Schematic />
              <dl className="home-specs">
                {home.specs.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="home-frame">
            <div className="home-frame__bar">
              <span className="home-live">Live</span>
              <span className="home-frame__hint">
                {`Live demo, built with ${name} · click the grid to take over`}
              </span>
              <span className="home-grow" />
              <a href={heroPage} target="_blank" rel="noreferrer">
                Open full-page demo ↗
              </a>
            </div>
            <HeroFrameShowcase
              src={heroPage}
              title={`Infinite Table for ${name}: live trading blotter`}
            />
          </div>
        </div>
      </section>

      {home.performance?.(no('performance'))}

      {/* ---- scale ---- */}
      <section className="home-sec" id="scale">
        <SectionBar
          no={no('scale')}
          name="Scale"
          aside="Live · rows and columns virtualized"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>A million rows. Go on, scroll.</h2>
            <div>
              <p>
                The grid scrolls its header and body on the same frame. The
                header never trails the cells, and a fast fling never shows
                blank rows.
              </p>
              <p>
                Rows and columns are both virtualized: only what is on screen is
                ever rendered.
              </p>
            </div>
          </div>
          <FrameDemo
            name="million"
            src={demoPage(`${framework}-home-million`)}
            title={`Infinite Table for ${name}: a million rows`}
          />
        </div>
      </section>

      {/* ---- themes ---- */}
      <section className="home-sec" id="themes">
        <SectionBar
          no={no('themes')}
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
          <FrameDemo
            name="themes"
            src={demoPage(`${framework}-home-themes`)}
            title={`Infinite Table for ${name}: themes, modes and densities`}
          />
        </div>
      </section>

      {/* ---- pivot ---- */}
      <section className="home-sec" id="pivot">
        <SectionBar
          no={no('pivot')}
          name="Pivot"
          aside={
            <Link
              href={link('/docs/learn/grouping-and-pivoting/pivoting/overview')}
            >
              Pivoting docs →
            </Link>
          }
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Pivot in a few lines.</h2>
            <p>{home.pivot.text}</p>
          </div>
          <div className="home-split">
            <div className="home-split__code">
              <CodeBlock
                lang={home.pivot.lang}
                title={home.pivot.title}
                highlight={home.pivot.highlight}
              >
                {home.pivot.code}
              </CodeBlock>
            </div>
            <FrameDemo
              name="pivot"
              src={demoPage(`${framework}-home-pivot`)}
              title={`Infinite Table for ${name}: pivoting`}
              fill
            />
          </div>
        </div>
      </section>

      {/* ---- features ---- */}
      <section className="home-sec" id="features">
        <SectionBar
          no={no('features')}
          name="Features"
          aside="Everything in one component"
        />
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>The enterprise feature set, built in.</h2>
            <p>{home.featuresText}</p>
          </div>
          <div className="home-features">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.title}
                className="home-feature"
                href={link(feature.href)}
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
            {home.principles.map((principle) => (
              <div key={principle.title} className="home-principle">
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- compare ---- */}
      <section className="home-sec" id="compare">
        <SectionBar
          no={no('compare')}
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

      {/* ---- get started ---- */}
      <section className="home-sec" id="editions">
        <SectionBar
          no={no('editions')}
          name="Get started"
          aside={home.versions}
        />
        <div className="home-wrap">
          <div className="home-editions">
            <div className="home-edition">
              <div className="home-edition__top">
                <span className="home-label">Free</span>
              </div>
              <h3>Start building now.</h3>
              <p>
                {`Install the package and follow the ${name} guide: a grid on the page takes a DataSource, an InfiniteTable and your columns.`}
              </p>
              <div className="home-edition__installs">
                <InstallCommand framework={framework} />
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
                  href={link('/docs/learn/getting-started')}
                >
                  {`Read the ${name} docs`}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- blog ---- */}
      {posts.length ? (
        <section className="home-sec" id="blog">
          <SectionBar
            no={no('blog')}
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
