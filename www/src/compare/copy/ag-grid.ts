import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const agGridCopy: CompareCopy = {
  id: 'ag-grid',
  metaDescription:
    'Infinite Table vs AG Grid: features by edition, pricing and licensing, bundle size, dependencies, framework support and benchmark results, with sources for every claim.',
  tagline:
    'AG Grid has the widest feature set and four frameworks. Infinite Table includes grouping, pivoting and tree data in one zero-dependency package, free to use with a footer.',
  verdict: [
    'AG Grid is the most complete grid in this comparison. Integrated charts, Excel and PDF export, clipboard paste, formulas, tool panels and a server-side row model, for React, Angular, Vue and plain JavaScript. If you need those, it is hard to beat, and its MIT Community edition is generous.',
    'Infinite Table covers most of what teams usually buy AG Grid Enterprise for: row grouping, aggregations, pivoting, tree data, master-detail, cell selection and context menus. They come in one package with **zero runtime dependencies**, free to use with a "Powered by Infinite Table" footer. A license that removes the footer is $395 per developer per year; AG Grid Enterprise is $999 per developer, perpetual, with a year of updates.',
    'In our [open benchmark](/benchmark) against AG Grid Community with 300,000 and 1,000,000 rows, Infinite Table mounted faster, used about half the memory and sorted 2.3 to 2.7 times faster, with equally smooth scrolling.',
  ],
  chooseThem: [
    'You need integrated charts, Excel or PDF export, clipboard paste, formulas or tool panels. Infinite Table has none of these.',
    'You standardize on one grid across Angular, React, Vue and plain JavaScript projects.',
    'You need documented screen reader support or right-to-left layouts.',
    'The MIT Community edition covers what you need and you want no footer, free.',
    'Your team already knows AG Grid well.',
  ],
  chooseInfinite: [
    'You want grouping, aggregations, pivoting, tree data and master-detail without an enterprise license for every developer up front.',
    'Supply-chain risk matters to you: Infinite Table has zero runtime dependencies.',
    'You want every piece of grid state (sorting, filtering, grouping, column order and sizes, selection) available as a controlled or uncontrolled prop.',
    'You work with large client-side datasets: see the [benchmark](/benchmark) for mount time, memory and sorting.',
    'You use React and Vue and want the same grid in both.',
  ],
  sections: [
    {
      title: 'Licensing: one package vs Community and Enterprise',
      paragraphs: [
        'AG Grid ships two products. AG Grid Community is MIT-licensed and free in production. AG Grid Enterprise adds the analytical features (grouping, pivoting, tree data, master-detail and more) and needs a license for every front-end developer on the project. Without a key, Enterprise shows a watermark.',
        'Infinite Table is one package with every feature in it. Using it for free means keeping the "Powered by Infinite Table" footer visible. A license removes the footer and adds email support, priced per developer per year, with no deployment, application or SaaS licenses.',
      ],
    },
    {
      title: 'Configuration style',
      paragraphs: [
        'AG Grid is configured through grid options and column definitions, and grid state is changed through events and its grid API (for example `api.applyColumnState()`), with `initialState` to restore it.',
        'Infinite Table splits the work in two components. `<DataSource>` owns the data and the data operations: sorting, filtering, grouping, pivoting and lazy loading, locally or on the server. `<InfiniteTable>` renders it. Each piece of state is a prop with a controlled form (`sortInfo`, `groupBy`, `columnOrder`...) and an uncontrolled one (`defaultSortInfo`, `defaultGroupBy`, `defaultColumnOrder`...), like `value` and `defaultValue` on a React input.',
      ],
    },
  ],
  migration: {
    intro:
      'Both are React components, so you can move one grid at a time. Column definitions map closely. The main changes: columns are an object keyed by column id, and data operations such as sorting and grouping move to `<DataSource>`.',
    from: {
      label: 'AG Grid',
      code: `
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

${CARS_TYPE}

${CARS_DATA}

const columnDefs: ColDef<Car>[] = [
  { field: 'make', headerName: 'Make', sort: 'asc' },
  { field: 'model', headerName: 'Model', width: 200 },
  {
    field: 'price',
    headerName: 'Price',
    cellRenderer: (params: { value: number }) => <b>{params.value}</b>,
  },
];

export function Cars() {
  return (
    <div style={{ height: 500 }}>
      <AgGridReact<Car>
        rowData={data}
        columnDefs={columnDefs}
        getRowId={(params) => String(params.data.id)}
      />
    </div>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`columnDefs` (an array)', '`columns` (an object keyed by column id)'],
      ['`field`, `headerName`', '`field`, `header`'],
      ['`width`, `flex`', '`defaultWidth`, `defaultFlex`, or the `columnSizing` prop'],
      ['`cellRenderer`', '`renderValue` or `render`'],
      ['`getRowId`', '`primaryKey` on `<DataSource>`'],
      ['`sort` on a column', '`defaultSortInfo` or `sortInfo` on `<DataSource>`'],
      ['`rowGroup: true` (Enterprise)', '`defaultGroupBy` or `groupBy` on `<DataSource>`'],
      ['`pivot: true`, `aggFunc` (Enterprise)', '`pivotBy` and `aggregationReducers` on `<DataSource>`'],
      ['`api.applyColumnState()`', '`columnOrder`, `columnVisibility` and `columnSizing` props'],
      ['Infinite / Server-Side Row Model datasource', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Which AG Grid features need AG Grid Enterprise?',
      a: "According to AG Grid's documentation, row grouping, aggregation, pivoting, tree data, master-detail, cell range selection, the context menu, the column menu, clipboard, Excel export and integrated charts are Enterprise features. AG Grid Community (MIT) includes sorting, filtering, editing, row selection, pagination, CSV export, row dragging and the Infinite Row Model.",
    },
    {
      q: 'Does Infinite Table have everything AG Grid Enterprise has?',
      a: "No. Infinite Table doesn't have integrated charts, Excel or CSV export, clipboard copy and paste, row drag and drop, a pager, right-to-left layouts or documented screen reader support. It does include row grouping, aggregations, pivoting, tree data, master-detail, cell selection, context menus, column menus and server-side data loading.",
    },
    {
      q: 'Is Infinite Table faster than AG Grid?',
      a: 'In our open benchmark against AG Grid Community 36.3 at 300,000 and 1,000,000 rows, Infinite Table mounted faster, used about half the memory and sorted 2.3 to 2.7 times faster. Scrolling was equally smooth, with no significant difference in frame rate. The [benchmark page](/benchmark) has the method, every metric and how to run it yourself.',
    },
    {
      q: 'Can I migrate from AG Grid to Infinite Table one grid at a time?',
      a: 'Yes. Both are regular React components, so they can live in the same app. Column definitions map closely (see the table above). The main changes are that columns are an object keyed by id, and that sorting, filtering, grouping and pivoting are configured on the `<DataSource>` component.',
    },
    {
      q: 'Does Infinite Table support Angular or plain JavaScript?',
      a: 'No. Infinite Table supports React and Vue 3. AG Grid supports React, Angular, Vue and plain JavaScript.',
    },
  ],
  demo: {
    title: 'Grouping and pivoting the same dataset in both grids',
    description:
      'The same rows grouped, aggregated and pivoted in AG Grid Enterprise and in Infinite Table, with the source code for both.',
  },
};
