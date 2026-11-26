/*
 * /vue - the home page of Infinite Table for Vue (FrameworkHomePage.tsx: the
 * sections of the React home page with the Vue ports of its demos), with the
 * numbers of the Vue benchmark.
 */
import * as React from 'react';

import { getStats } from '@www/compare/matrixUtils';
import { docsFrameworks } from '@www/utils/docsFrameworks';
import type { BlogPost } from '@www/utils/blogUtils';

import { getVueBenchmarkReadouts } from './benchmarkReadouts';
import { FrameworkHomePage } from './FrameworkHomePage';
import { PRINCIPLES, ReadoutCard, SectionBar } from './HomePage';

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

export function VueHomePage({ posts = [] }: { posts?: BlogPost[] }) {
  const stats = getStats('infinite-vue');
  const gzipKB = Math.round(stats.bundle.jsGzip / 1000);
  const dependencies = stats.transitiveDependencyCount;
  const bench = getVueBenchmarkReadouts();

  return (
    <FrameworkHomePage
      posts={posts}
      home={{
        framework: 'vue',
        name: 'Vue',
        docsLink: vue,
        heroSub:
          'A million rows, zero dependencies, fully declarative. Grouping, pivoting, aggregations, lazy loading and live updates, in one Vue component.',
        specs: [
          { label: 'Rows', value: '1,000,000' },
          { label: 'Dependencies', value: dependencies },
          { label: 'Gzip', value: <>{gzipKB} kB</> },
          { label: 'Vue', value: '3' },
        ],
        performance: (no) => (
          <section className="home-sec" id="performance">
            <SectionBar
              no={no}
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
                  {bench.footnote} Scrolling and the other scenarios are in the
                  benchmark's repository.
                </span>
                <a href={bench.href} target="_blank" rel="noreferrer">
                  Read the method and all the results →
                </a>
              </div>
            </div>
          </section>
        ),
        pivot: {
          code: PIVOT_CODE,
          lang: 'vue',
          title: 'Pivot.vue',
          highlight: '4-5',
          text: 'Group by one field, pivot by another, add an aggregation. The pivot columns are generated for you, and arrive in the default slot of the DataSource.',
        },
        featuresText:
          'No plugins to wire up and no modules to register. Every feature is a prop on the same two components, and each of these guides has Vue examples.',
        principles: PRINCIPLES,
        versions: 'Vue 3',
      }}
    />
  );
}
