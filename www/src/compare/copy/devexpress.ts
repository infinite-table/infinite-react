import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const devexpressCopy: CompareCopy = {
  id: 'devexpress',
  metaDescription:
    'Infinite Table vs DevExtreme DataGrid (DevExpress): features, pricing, bundle size, dependencies and migration, with sources for every claim.',
  tagline:
    'DevExtreme DataGrid is one component in a large commercial UI suite. Infinite Table is a single, zero-dependency data grid, free to use with a footer.',
  verdict: [
    'DevExtreme DataGrid is a mature, full-featured grid inside DevExpress\'s JavaScript UI suite: grouping with summaries, master-detail, five editing modes, many filter UIs, Excel and PDF export and remote operations, for React, Angular, Vue and jQuery. Pivoting and tree data live in separate components (PivotGrid and TreeList). It is sold as a subscription, $899.99 per developer per year for DevExtreme Complete, with no free tier.',
    'Infinite Table has grouping, pivoting and tree data in the grid itself, with **zero runtime dependencies**, and is free to use with a footer ($395 per developer per year without it). DevExtreme is ahead on export, accessibility, RTL and the breadth of its surrounding suite.',
  ],
  chooseThem: [
    'You want one vendor for a whole UI suite: grid, charts, scheduler, forms and more.',
    'You need Excel or PDF export, or documented accessibility and RTL.',
    'You also build with Angular, Vue, jQuery or ASP.NET.',
    'You want commercial support from a large vendor.',
  ],
  chooseInfinite: [
    'You want pivoting and tree data in the same grid, not in separate components.',
    'You want a grid you can use commercially for free, or a lower price per developer.',
    'Dependency count and bundle size matter to you.',
    'You want a declarative API where every piece of state is a prop.',
  ],
  migration: {
    intro:
      'DevExtreme configures columns with nested `<Column>` elements; Infinite Table uses a `columns` object. Data, sorting and grouping move to `<DataSource>`.',
    from: {
      label: 'DevExtreme DataGrid',
      code: `
import DataGrid, { Column } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';

${CARS_TYPE}

${CARS_DATA}

export function Cars() {
  return (
    <DataGrid dataSource={data} keyExpr="id" height={500}>
      <Column dataField="make" caption="Make" sortOrder="asc" />
      <Column dataField="model" caption="Model" width={200} />
      <Column
        dataField="price"
        caption="Price"
        cellRender={(cell) => <b>{cell.value}</b>}
      />
    </DataGrid>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`<Column dataField>`', '`columns` (an object keyed by column id) with `field`'],
      ['`caption`', '`header`'],
      ['`width`', '`defaultWidth`, or the `columnSizing` prop'],
      ['`cellRender`', '`renderValue` or `render`'],
      ['`keyExpr`', '`primaryKey` on `<DataSource>`'],
      ['`sortOrder`, `sortIndex`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`groupIndex`, `<Summary>`', '`groupBy` and `aggregationReducers` on `<DataSource>`'],
      ['`<MasterDetail>`', '`rowDetailRenderer`'],
      ['`CustomStore`, `remoteOperations`', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Is DevExtreme free?',
      a: "No. DevExpress sells DevExtreme as a per-developer subscription (DevExtreme Complete is $899.99 per developer per year) with a 30-day trial, and we found no free or non-commercial license. Infinite Table can be used commercially for free with a \"Powered by Infinite Table\" footer.",
    },
    {
      q: 'Does DevExtreme DataGrid support pivoting and tree data?',
      a: 'Not in the DataGrid itself: DevExtreme has separate PivotGrid and TreeList components. Infinite Table does grouping, pivoting and tree data in the grid.',
    },
    {
      q: 'What about the DevExtreme Reactive Grid?',
      a: 'The older DevExtreme Reactive React Grid (`@devexpress/dx-react-grid`) reached end-of-life in December 2025. This page compares the current DevExtreme React DataGrid (`devextreme-react`).',
    },
  ],
  demo: {
    title: 'Grouping with summaries in both grids',
    description: 'The same rows grouped with group summaries in DevExtreme DataGrid and in Infinite Table.',
  },
};
