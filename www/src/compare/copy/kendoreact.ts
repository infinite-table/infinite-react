import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const kendoReactCopy: CompareCopy = {
  id: 'kendoreact',
  metaDescription:
    'Infinite Table vs KendoReact Grid: free vs Premium features, pricing, bundle size, dependencies and migration, with sources for every claim.',
  tagline:
    'KendoReact has a free Grid and a Premium one with more features. Infinite Table has every feature in one zero-dependency package, free to use with a footer.',
  verdict: [
    'The KendoReact Grid comes in two flavors. KendoReact Free includes the Grid with column resizing and reordering, a filter row, in-cell editing, CSV export and paging, free in production. Premium (from $649 per developer per year) adds multi-column sorting, grouping, column pinning, column groups, master-detail, row virtualization, clipboard, Excel export and the Chart Wizard. Pivoting and tree data are separate Premium components.',
    'Infinite Table has grouping, pivoting, tree data, master-detail and pinning in the free package, with **zero runtime dependencies**. KendoReact is ahead on export, clipboard, charts, accessibility (WCAG 2.2 AA) and RTL.',
  ],
  chooseThem: [
    'The free KendoReact Grid covers what you need.',
    'You need Excel or PDF export, clipboard, the Chart Wizard, or documented WCAG 2.2 AA compliance.',
    'You use other KendoReact components and want one design system.',
    'You want commercial support from a large vendor.',
  ],
  chooseInfinite: [
    'You need grouping, pivoting, tree data or master-detail without a Premium license.',
    'You want pivoting and tree data in the grid itself, not in separate components.',
    'Dependency count matters to you.',
    'You use Vue as well as React.',
  ],
  migration: {
    intro:
      'KendoReact uses `<GridColumn>` children; Infinite Table uses a `columns` object, and data operations move to `<DataSource>`.',
    from: {
      label: 'KendoReact Grid',
      code: `
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import '@progress/kendo-theme-default/dist/all.css';

${CARS_TYPE}

${CARS_DATA}

export function Cars() {
  return (
    <Grid
      data={data}
      dataItemKey="id"
      sortable={true}
      defaultSort={[{ field: 'make', dir: 'asc' }]}
      style={{ height: 500 }}
    >
      <GridColumn field="make" title="Make" />
      <GridColumn field="model" title="Model" width="200px" />
      <GridColumn field="price" title="Price" />
    </Grid>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`<GridColumn field>`', '`columns` (an object keyed by column id) with `field`'],
      ['`title`', '`header`'],
      ['`width`', '`defaultWidth`, or the `columnSizing` prop'],
      ['`cells` (custom cells)', '`renderValue` or `render`'],
      ['`dataItemKey`', '`primaryKey` on `<DataSource>`'],
      ['`defaultSort`, `sort`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`defaultGroup`, `group` (Premium)', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`detail` (Premium)', '`rowDetailRenderer`'],
      ['`onDataStateChange` + your fetch', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Is the KendoReact Grid free?',
      a: 'Partly. KendoReact Free includes the Grid with a subset of its features, free in production with no license key. Features marked Premium in the KendoReact docs, such as grouping, multi-column sorting, column pinning and Excel export, need a paid license. Every Infinite Table feature is free to use with the footer.',
    },
    {
      q: 'Does the KendoReact Grid support pivoting?',
      a: 'Through the separate KendoReact PivotGrid component, which is Premium. Infinite Table pivots in the grid itself.',
    },
  ],
  demo: {
    title: 'Grouping and pinning in both grids',
    description: 'Group rows and pin columns in KendoReact (Premium) and in Infinite Table.',
  },
};
