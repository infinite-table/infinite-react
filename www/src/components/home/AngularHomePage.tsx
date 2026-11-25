/*
 * /angular - the home page of Infinite Table for Angular (FrameworkHomePage.tsx:
 * the sections of the React home page with the Angular ports of its demos).
 * No benchmark section: there is no Angular run of the benchmark yet. Links
 * into the docs go to the Angular page where there is one, else to the React
 * page.
 */
import * as React from 'react';

import { resolveFrameworkLink } from '@thedatagrid/docs-kit/frameworks';

import { docsHasPage } from '@www/utils/docsFrameworkContent';
import { docsFrameworks } from '@www/utils/docsFrameworks';
import { docsFrameworksText } from '@www/utils/docsFrameworksRegistry';
import type { BlogPost } from '@www/utils/blogUtils';

import { FrameworkHomePage } from './FrameworkHomePage';

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

// the same grid as the demo next to it (angular-home-pivot.demo.angular.ts)
const PIVOT_CODE = `@Component({
  imports: [DataSource, InfiniteTable],
  template: \`
    <infinite-data-source
      #ds="infiniteDataSource"
      [data]="trades"
      primaryKey="id"
      [groupBy]="[{ field: 'sector' }]"
      [pivotBy]="[{ field: 'region' }]"
      [aggregationReducers]="{
        pnl: { field: 'pnl', initialValue: 0, reducer: sum }
      }"
    >
      <infinite-table
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
  \`,
})
export class Pivot {
  trades = trades;
  sum = (a: number, b: number) => a + b;
}`;

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
  return (
    <FrameworkHomePage
      posts={posts}
      home={{
        framework: 'angular',
        name: 'Angular',
        docsLink: angular,
        heroSub:
          'A million rows, zero dependencies, fully declarative. Grouping, pivoting, aggregations, lazy loading and live updates, in one Angular component, with signals and templates.',
        specs: [
          { label: 'Rows', value: '1,000,000' },
          { label: 'Dependencies', value: '0' },
          { label: 'Angular', value: '22' },
        ],
        pivot: {
          code: PIVOT_CODE,
          lang: 'angular-ts',
          title: 'pivot.ts',
          highlight: '8-9',
          text: 'Group by one field, pivot by another, add an aggregation. The pivot columns are generated for you, and the DataSource gives them to the grid as signals.',
        },
        featuresText:
          'No plugins to wire up and no modules to register. Every feature is an input of the same two components, and each of these guides has Angular examples.',
        principles: PRINCIPLES,
        versions: 'Angular 22',
      }}
    />
  );
}
