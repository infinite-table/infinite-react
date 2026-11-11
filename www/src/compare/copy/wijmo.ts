import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const wijmoCopy: CompareCopy = {
  id: 'wijmo',
  metaDescription:
    'Infinite Table vs Wijmo FlexGrid (MESCIUS): features, developer and deployment licensing, bundle size and migration, with sources for every claim.',
  tagline:
    'Wijmo FlexGrid is a long-standing commercial grid licensed per developer and per deployment hostname. Infinite Table has development licenses only, and is free with a footer.',
  verdict: [
    'Wijmo FlexGrid is a capable, Excel-like grid: grouping with aggregates, a tree grid, master-detail, column groups, Excel export and clipboard, with pivoting through the separate OLAP module, for JavaScript, Angular, React, Vue and Web Components. A developer license is $799 (perpetual, a year of updates included), and commercial deployments need a hostname license: $499 per hostname, or an annual SaaS license.',
    'Infinite Table has grouping, pivoting, tree data and master-detail in one package with **zero runtime dependencies**, and needs no deployment licenses: free to use with a footer, $395 per developer per year without it.',
  ],
  chooseThem: [
    'You want an Excel-like grid with clipboard, Excel export, accessibility and RTL.',
    'You use several frameworks, or plain JavaScript.',
    'You prefer a perpetual license, and deployment licensing suits your setup.',
  ],
  chooseInfinite: [
    'You deploy to many hostnames or run a SaaS product, and want no deployment licensing.',
    'You want a free option for commercial use.',
    'You want a declarative API instead of a CollectionView object model.',
  ],
  migration: {
    intro:
      'Wijmo binds the grid to a `CollectionView`, which sorts and groups; in Infinite Table that is the job of `<DataSource>`.',
    from: {
      label: 'Wijmo FlexGrid',
      code: `
import { CollectionView, SortDescription } from '@mescius/wijmo';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import '@mescius/wijmo.styles/wijmo.css';

${CARS_TYPE}

${CARS_DATA}

const view = new CollectionView(data, {
  sortDescriptions: [new SortDescription('make', true)],
});

export function Cars() {
  return (
    <FlexGrid itemsSource={view} style={{ height: 500 }}>
      <FlexGridColumn binding="make" header="Make" />
      <FlexGridColumn binding="model" header="Model" width={200} />
      <FlexGridColumn binding="price" header="Price" />
    </FlexGrid>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`<FlexGridColumn binding>`', '`columns` (an object keyed by column id) with `field`'],
      ['`header`', '`header`'],
      ['`width`', '`defaultWidth`, or the `columnSizing` prop'],
      ['cell templates', '`renderValue` or `render`'],
      ['`CollectionView.sortDescriptions`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`CollectionView.groupDescriptions`', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`PivotEngine` (OLAP module)', '`pivotBy` on `<DataSource>`'],
      ['`FlexGridDetailProvider`', '`rowDetailRenderer`'],
    ],
  },
  faq: [
    {
      q: 'Does Wijmo need deployment licenses?',
      a: 'According to MESCIUS, Wijmo is licensed per developer and per deployment hostname. Each developer license includes 5 hostnames for non-commercial deployment; commercial deployment needs a hostname license ($499 each, one-time) and SaaS needs an annual SaaS license. Infinite Table has development licenses only.',
    },
  ],
  demo: {
    title: 'Grouping and pivoting in both grids',
    description: 'The same rows grouped and pivoted in Wijmo FlexGrid (with the OLAP module) and in Infinite Table.',
  },
};
