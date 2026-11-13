import Link from 'next/link';

import { COPY } from '@www/compare/copy';
import {
  AllProductsMatrix,
  SupportLegend,
} from '@www/compare/components/FeatureMatrix';
import styles from '@www/compare/components/compare.module.css';
import {
  breadcrumbJsonLd,
  JsonLd,
  PackageStatsTable,
  Section,
  SourcesAndCorrections,
} from '@www/compare/components/sections';
import { competitors, infinite, products } from '@www/compare/matrix';
import { formatKB, getStats, tierLabel } from '@www/compare/matrixUtils';
import type { FeatureKey, Product } from '@www/compare/types';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title:
    'Compare React data grids: Infinite Table vs AG Grid, MUI X, TanStack Table and more',
  description:
    'Side-by-side comparison of Infinite Table and popular data grids: features by edition, licensing and pricing, bundle size, dependencies and framework support, with a source for every claim.',
});

const ANALYTICS: FeatureKey[] = ['rowGrouping', 'pivoting', 'treeData'];

/** "Free", "Enterprise", "No"... - where a product has a feature */
function availability(product: Product, key: FeatureKey) {
  const cell = product.features[key];
  if (cell.support === 'none') {
    return 'No';
  }
  const kind =
    cell.support === 'headless'
      ? 'Logic only'
      : cell.support === 'partial'
      ? 'Partial'
      : 'Yes';
  const tier = tierLabel(product, cell.edition);
  return tier ? `${kind} (${tier})` : kind;
}

function cheapestPaid(product: Product) {
  return product.editions.find((edition) => edition.price !== 'Free')?.price;
}

/** "MIT", "Free tier + paid editions", "Commercial"... */
function licenseSummary(product: Product) {
  const [first, ...rest] = product.editions;
  if (first.free) {
    if (!rest.length) return first.license;
    return first.license === 'MIT' ? 'MIT core + paid editions' : 'Free tier + paid editions';
  }
  return first.price === 'Free' ? 'Commercial, free for non-commercial use' : 'Commercial';
}

function AtAGlance() {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          Every data grid at a glance
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.stickyCol}>
              Data grid
            </th>
            <th scope="col">Free for commercial use</th>
            <th scope="col">Paid editions from</th>
            <th scope="col">Grouping</th>
            <th scope="col">Pivoting</th>
            <th scope="col">Tree data</th>
            <th scope="col" className={styles.num}>
              Dependencies
            </th>
            <th scope="col" className={styles.num}>
              JS, gzip
            </th>
            <th scope="col">Frameworks</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const stats = getStats(product.measurements[0].statsId);
            const first = product.editions[0];
            return (
              <tr
                key={product.id}
                className={index === 0 ? styles.infiniteCol : undefined}
              >
                <th scope="row" className={styles.stickyCol}>
                  {index === 0 ? (
                    product.name
                  ) : (
                    <Link href={`/compare/${product.id}`}>{product.name}</Link>
                  )}
                  <span className={styles.featureDescription}>
                    {product.rendering.text}
                  </span>
                </th>
                <td>
                  {first.free ? (
                    <>
                      Yes
                      <span className={styles.featureDescription}>
                        {index === 0
                          ? 'with a "Powered by" footer'
                          : first.license === 'MIT'
                          ? 'MIT'
                          : first.name}
                      </span>
                    </>
                  ) : (
                    <>
                      No
                      {first.price === 'Free' ? (
                        <span className={styles.featureDescription}>
                          free for non-commercial use
                        </span>
                      ) : null}
                    </>
                  )}
                </td>
                <td>{cheapestPaid(product) ?? '–'}</td>
                {ANALYTICS.map((key) => (
                  <td key={key}>{availability(product, key)}</td>
                ))}
                <td className={styles.num}>
                  {stats ? stats.transitiveDependencyCount : '–'}
                </td>
                <td className={styles.num}>
                  {stats ? formatKB(stats.bundle.jsGzip) : '–'}
                </td>
                <td>{product.frameworks.list.join(', ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CompareIndex() {
  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Compare', path: '/compare' }])} />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          How <span>Infinite Table</span> compares
        </h1>
        <p className={styles.heroTagline}>
          An honest look at Infinite Table next to {competitors.length} popular
          data grids: what each one includes, what it costs, how much code it
          adds to your app, and when it is the better choice.
        </p>
        <p className={styles.heroMeta}>
          Every claim about another product links to its official docs or
          pricing page, with the date we last checked it.
        </p>
      </header>

      <Section id="comparisons" title="Pick a comparison">
        <div className={styles.grid3}>
          {competitors.map((product) => {
            const copy = COPY[product.id];
            return (
              <Link
                key={product.id}
                href={`/compare/${product.id}`}
                className={`${styles.card} ${styles.productCard}`}
              >
                <h3 className={styles.productCardTitle}>
                  Infinite Table vs {product.name}
                </h3>
                <span className={styles.productCardMeta}>
                  {product.vendor} · {licenseSummary(product)}
                </span>
                {copy ? <span>{copy.tagline}</span> : null}
                <span className={styles.productCardMore}>
                  Read the comparison →
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        id="glance"
        title="At a glance"
        lead={
          <p>
            Dependencies count the packages <code>npm install</code> adds
            besides the grid itself and the framework. Sizes are for the
            minimal getting-started usage. Details on each comparison page.
          </p>
        }
      >
        <AtAGlance />
      </Section>

      <Section
        id="features"
        title="Every feature, every grid"
        lead={
          <p>
            Where a feature needs a paid edition, the edition is named. Hover a
            cell for notes, click it for the vendor&apos;s documentation.
          </p>
        }
      >
        <SupportLegend />
        <AllProductsMatrix products={products} />
      </Section>

      <Section id="size" title="Bundle size and dependencies">
        <PackageStatsTable products={products} />
      </Section>

      <Section id="performance" title="Performance">
        <div className={styles.card}>
          <p style={{ marginTop: 0 }}>
            We benchmarked Infinite Table against MUI X Data Grid, AG Grid
            Community and TanStack Table with 300,000 and 1,000,000 rows: mount
            time, memory, sorting and scrolling, in a reproducible setup you
            can run on your own machine. Infinite Table sorts the fastest of
            the four and keeps the least memory; it is not the fastest at
            everything, and the page says where.
          </p>
          <div className={styles.actions} style={{ justifyContent: 'flex-start' }}>
            <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/benchmark">
              See the benchmark
            </Link>
          </div>
        </div>
      </Section>

      <Section id="fair" title="How we keep this fair">
        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Honest about our gaps</h3>
            <p style={{ margin: 0 }}>
              Infinite Table doesn&apos;t have integrated charts, Excel or CSV
              export, clipboard support, row drag and drop, a pager, right-to-left
              layouts or documented screen reader support. The tables say so,
              and every comparison page says when the other grid is the better
              choice.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>One source of truth</h3>
            <p style={{ margin: 0 }}>
              Every table on these pages is built from one data file, also
              published as{' '}
              <a href="/compare/matrix.json">/compare/matrix.json</a>. Bundle
              sizes and dependency counts come from a script anyone can run.
            </p>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <SourcesAndCorrections products={[infinite, ...competitors]} />
        </div>
      </Section>
    </div>
  );
}
