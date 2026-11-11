import Link from 'next/link';
import { notFound } from 'next/navigation';

import { COPY } from '@www/compare/copy';
import { ProductFeatureMatrix, SupportLegend } from '@www/compare/components/FeatureMatrix';
import { Inline, Paragraphs } from '@www/compare/components/Inline';
import styles from '@www/compare/components/compare.module.css';
import {
  breadcrumbJsonLd,
  ChooseCards,
  DemoPlaceholder,
  Faq,
  faqJsonLd,
  FrameworkNotes,
  FrameworkTable,
  JsonLd,
  Migration,
  PackageStatsTable,
  PricingTable,
  Section,
  SourcesAndCorrections,
  Strengths,
  Verdict,
} from '@www/compare/components/sections';
import { competitors, getCompetitor, infinite } from '@www/compare/matrix';
import {
  countFeatures,
  formatDate,
  formatKB,
  getStats,
  matrixEditions,
} from '@www/compare/matrixUtils';
import type { CompareCopy, Product } from '@www/compare/types';
import { asMeta } from '@www/utils/asMeta';

export const dynamicParams = false;

export function generateStaticParams() {
  return competitors.map((product) => ({ competitor: product.id }));
}

type Params = { params: Promise<{ competitor: string }> };

export async function generateMetadata({ params }: Params) {
  const { competitor } = await params;
  const product = getCompetitor(competitor);
  const copy = COPY[competitor];
  if (!product || !copy) {
    return {};
  }
  return asMeta({
    title: `Infinite Table vs ${product.name}: features, pricing and bundle size compared`,
    description: copy.metaDescription,
  });
}

/** FAQ entries every page gets, built from the data so they never go stale */
function commonFaq(product: Product): CompareCopy['faq'] {
  const [infiniteStats] = infinite.measurements.map((m) => getStats(m.statsId));
  const theirs = product.measurements
    .map((m) => ({ label: m.label, stats: getStats(m.statsId) }))
    .filter((m) => m.stats);
  const deps = theirs
    .map(
      ({ label, stats }) =>
        `${label} adds ${stats.transitiveDependencyCount} (${stats.thirdPartyDependencyCount} from other publishers)`,
    )
    .join('; ');
  const sizes = theirs
    .map(({ label, stats }) => `${label} ${formatKB(stats.bundle.jsGzip)}`)
    .join(', ');

  return [
    {
      q: 'Is Infinite Table free to use?',
      a: 'Yes. Every feature is free to use, in any product and in production, as long as the "Powered by Infinite Table" footer stays visible. A license removes the footer and adds email support: $395 per developer per year, with volume discounts and no deployment or application licenses. See [pricing](/pricing).',
    },
    {
      q: `How many dependencies does ${product.name} have, compared to Infinite Table?`,
      a: `Infinite Table has ${infiniteStats.transitiveDependencyCount} runtime dependencies: installing it adds one package. ${deps}, counting required peer dependencies but not React. Measured on ${formatDate(
        infiniteStats.measuredAt,
      )} with the latest versions on npm.`,
    },
    {
      q: `How big is ${product.name} compared to Infinite Table?`,
      a: `Bundling the minimal getting-started usage with esbuild, minified and gzipped, without React: Infinite Table ${formatKB(
        infiniteStats.bundle.jsGzip,
      )} of JavaScript, ${sizes}. CSS is measured separately; the table above has both.`,
    },
  ];
}

export default async function ComparePage({ params }: Params) {
  const { competitor } = await params;
  const product = getCompetitor(competitor);
  const copy = COPY[competitor];
  if (!product || !copy) {
    notFound();
  }

  const faq = [...copy.faq, ...commonFaq(product)];
  const editions = matrixEditions(product);
  const lastEdition = editions[editions.length - 1];
  const theirCount = countFeatures(product, lastEdition.id);
  const ourCount = countFeatures(infinite, infinite.editions[0].id);
  const others = competitors.filter((p) => p.id !== product.id);
  const path = `/compare/${product.id}`;

  return (
    <div className={styles.page}>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Compare', path: '/compare' },
          { name: `Infinite Table vs ${product.name}`, path },
        ])}
      />

      <header className={styles.hero}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/compare">Compare</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
        <h1 className={styles.heroTitle}>
          <span>Infinite Table</span> vs {product.name}
        </h1>
        <p className={styles.heroTagline}>{copy.tagline}</p>
        <p className={styles.heroMeta}>
          Facts last verified on {formatDate(product.lastVerified)}, with a
          source link for each one.
        </p>
        <ul className={styles.toc} aria-label="On this page">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <a href="#size">Bundle size</a>
          </li>
          <li>
            <a href="#frameworks">Frameworks</a>
          </li>
          <li>
            <a href="#migration">Migration</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
      </header>

      <Verdict paragraphs={copy.verdict} />

      <Section id="choose" title={`When to choose which`}>
        <ChooseCards
          product={product}
          chooseThem={copy.chooseThem}
          chooseInfinite={copy.chooseInfinite}
        />
      </Section>

      <Section
        id="features"
        title="Features"
        lead={
          <p>
            {ourCount.full} of the {ourCount.total} features below are built
            into Infinite Table, every one in the free package.{' '}
            {product.name} has {theirCount.full} built in
            {theirCount.partial
              ? `, and ${theirCount.partial} more partly or as headless logic`
              : ''}
            , counting its most complete edition ({lastEdition.name}). Each{' '}
            {product.name} entry links to its documentation.
          </p>
        }
      >
        <SupportLegend />
        <ProductFeatureMatrix infinite={infinite} product={product} />
      </Section>

      <Section id="demo" title="Side by side">
        <DemoPlaceholder demo={copy.demo} product={product} />
      </Section>

      <Section
        id="pricing"
        title="Licensing and pricing"
        lead={
          <p>
            List prices as published by each vendor, in US dollars. Follow the
            source links for the full terms.
          </p>
        }
      >
        <PricingTable products={[infinite, product]} />
      </Section>

      <Section
        id="size"
        title="Bundle size and dependencies"
        lead={
          <p>
            Every dependency is code you ship and a package you have to trust
            and keep updated. Infinite Table has none.
          </p>
        }
      >
        <PackageStatsTable products={[infinite, product]} />
      </Section>

      <Section id="frameworks" title="Framework support">
        <FrameworkTable products={[infinite, product]} />
        <FrameworkNotes products={[infinite, product]} />
      </Section>

      {copy.sections?.length ? (
        <Section id="differences" title="Key differences">
          <div className={styles.grid2}>
            {copy.sections.map((section) => (
              <div className={styles.card} key={section.title}>
                <h3 className={styles.cardTitle}>{section.title}</h3>
                <Paragraphs items={section.paragraphs} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="migration" title={`Migrating from ${product.name}`}>
        <Migration migration={copy.migration} product={product} />
      </Section>

      <Section id="strengths" title={`What ${product.name} does well`}>
        <div className={styles.card}>
          <Strengths product={product} />
          {product.notes?.length ? (
            <p className={styles.muted} style={{ marginBottom: 0 }}>
              {product.notes.map((note, i) => (
                <span key={i}>
                  {note.text}{' '}
                  <a href={note.source} target="_blank" rel="noopener noreferrer">
                    source
                  </a>{' '}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </Section>

      <Section id="faq" title="FAQ">
        <Faq faq={faq} />
      </Section>

      <Section id="get-started" title="Try Infinite Table">
        <div className={styles.card}>
          <p style={{ marginTop: 0 }}>
            <code>npm i @infinite-table/infinite-react</code> for React, or{' '}
            <code>npm i @infinite-table/infinite-vue</code> for Vue. Every
            feature is in the package.
          </p>
          <div className={styles.actions} style={{ justifyContent: 'flex-start' }}>
            <Link
              className={`${styles.button} ${styles.buttonPrimary}`}
              href="/docs/learn/getting-started"
            >
              Get started
            </Link>
            <Link className={styles.button} href="/benchmark">
              See the benchmark
            </Link>
            <Link className={styles.button} href="/pricing">
              Pricing
            </Link>
          </div>
        </div>
      </Section>

      <Section id="other" title="Other comparisons">
        <ul className={styles.chips}>
          {others.map((p) => (
            <li key={p.id}>
              <Link className={styles.chip} href={`/compare/${p.id}`}>
                vs {p.name}
              </Link>
            </li>
          ))}
          <li>
            <Link className={styles.chip} href="/compare">
              All comparisons
            </Link>
          </li>
        </ul>
      </Section>

      <Section id="sources" title="Sources">
        <SourcesAndCorrections products={[product]} />
        <p className={styles.muted}>
          <Inline
            text={`Official links for ${product.name}: [website](${product.homepage}), [docs](${product.docs})${
              product.pricingUrl ? `, [pricing](${product.pricingUrl})` : ''
            }${product.licenseUrl ? `, [license](${product.licenseUrl})` : ''}${
              product.repo ? `, [repository](${product.repo})` : ''
            }.`}
          />
        </p>
      </Section>
    </div>
  );
}
