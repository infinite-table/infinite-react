import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const muiXDataGridCopy: CompareCopy = {
  id: 'mui-x-data-grid',
  metaDescription:
    'Infinite Table vs MUI X Data Grid: features across Community, Pro and Premium, pricing, bundle size, dependencies and migration, with sources for every claim.',
  tagline:
    'Both are declarative React grids. MUI X fits a Material UI app; Infinite Table has grouping, pivoting and tree data without a paid tier and without a design-system dependency.',
  verdict: [
    'MUI X Data Grid and Infinite Table are close in spirit: declarative React components with controlled and uncontrolled state. The difference is packaging. MUI X spreads its features over Community (MIT), Pro ($299 per developer per year), Premium ($599) and Enterprise ($1,399). Tree data, master-detail and column pinning need Pro; row grouping, aggregation, pivoting and cell selection need Premium.',
    'Infinite Table has all of those in one package, free to use with a footer, or $395 per developer per year without it. It has **zero runtime dependencies**, while MUI X needs Material UI and Emotion: free if your app already uses MUI, a lot of extra code if it doesn\'t.',
    'MUI X is ahead on export (CSV in Community, Excel in Premium), clipboard paste, its charts integration, documented accessibility and right-to-left support.',
  ],
  chooseThem: [
    'Your app is built on Material UI: the grid picks up your theme with no extra work.',
    'You need Excel export, clipboard paste, the charts integration or the AI assistant (Premium).',
    'You need documented accessibility (MUI targets WCAG 2.2 AA) or right-to-left layouts.',
    'The free Community edition is enough: sorting by one column, one filter at a time and pages of up to 100 rows.',
    'You also use other MUI X components, such as the date pickers or charts, under the same license.',
  ],
  chooseInfinite: [
    'You need row grouping, aggregations or pivoting without a Premium license.',
    "Your app doesn't use Material UI, and you'd rather not add Material UI and Emotion.",
    'You want multi-column sorting, column pinning, tree data and master-detail without Pro.',
    'You show large datasets without pagination.',
    'You want a context menu, which MUI X leaves to you to build.',
    'You use Vue as well as React.',
  ],
  sections: [
    {
      title: 'Design system',
      paragraphs: [
        'MUI X Data Grid is built on Material UI. It needs `@mui/material` as a peer dependency, MUI\'s install guide adds Emotion, and you style it through the MUI theme, `sx` and class names.',
        "Infinite Table doesn't depend on a design system. It's themed with CSS variables and ships several themes, so it works with Tailwind, plain CSS or any component library.",
      ],
    },
    {
      title: 'Data and rendering',
      paragraphs: [
        'MUI X is a single component in three packages (`DataGrid`, `DataGridPro`, `DataGridPremium`) that takes `rows`, plus a `dataSource` for server data.',
        'Infinite Table splits data and rendering: `<DataSource>` loads, sorts, filters, groups and pivots the data, locally or on the server, and `<InfiniteTable>` renders it.',
      ],
    },
  ],
  migration: {
    intro:
      'Column definitions map almost one to one. The main changes: columns are an object keyed by column id, and sorting, grouping and server data move to `<DataSource>`.',
    from: {
      label: 'MUI X Data Grid',
      code: `
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

${CARS_TYPE}

${CARS_DATA}

const columns: GridColDef<Car>[] = [
  { field: 'make', headerName: 'Make' },
  { field: 'model', headerName: 'Model', width: 200 },
  {
    field: 'price',
    headerName: 'Price',
    renderCell: (params) => <b>{params.value}</b>,
  },
];

export function Cars() {
  return (
    <div style={{ height: 500 }}>
      <DataGrid
        rows={data}
        columns={columns}
        initialState={{
          sorting: { sortModel: [{ field: 'make', sort: 'asc' }] },
        }}
      />
    </div>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`columns` (an array of `GridColDef`)', '`columns` (an object keyed by column id)'],
      ['`field`, `headerName`', '`field`, `header`'],
      ['`width`, `flex`', '`defaultWidth`, `defaultFlex`, or the `columnSizing` prop'],
      ['`renderCell`', '`renderValue` or `render`'],
      ['`rows` with an `id`, or `getRowId`', '`data` and `primaryKey` on `<DataSource>`'],
      ['`initialState.sorting`, `sortModel`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`rowGroupingModel` (Premium)', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`pivotModel` (Premium)', '`pivotBy` and `aggregationReducers` on `<DataSource>`'],
      ['`treeData`, `getTreeDataPath` (Pro)', '`<TreeDataSource>` and `<TreeGrid>`'],
      ['`pinnedColumns` (Pro), `columnVisibilityModel`', '`columnPinning`, `columnVisibility`'],
      ['`dataSource` (server data)', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Which MUI X Data Grid features need a paid plan?',
      a: "In MUI's documentation, multi-column sorting, multiple filters, column reordering and pinning, tree data, master-detail, row reordering, lazy loading and row virtualization beyond 100 rows need Pro. Row grouping, aggregation, pivoting, cell selection, clipboard paste, Excel export and the charts integration need Premium.",
    },
    {
      q: 'Do I need Material UI to use MUI X Data Grid?',
      a: "Yes. The Data Grid packages have a peer dependency on `@mui/material`, and MUI's install guide also adds `@emotion/react` and `@emotion/styled`. Infinite Table has no dependencies and doesn't need a design system.",
    },
    {
      q: 'Does Infinite Table have everything MUI X Premium has?',
      a: "No. Infinite Table has no Excel or CSV export, clipboard, charts integration, AI assistant, row drag and drop, pager, right-to-left layouts or documented screen reader support. It does have grouping, aggregations, pivoting, tree data, master-detail, cell selection, column pinning and reordering, plus a built-in context menu, which MUI X doesn't have.",
    },
    {
      q: 'Is MUI X Data Grid Community limited to 100 rows?',
      a: "Its pages are. MUI's docs say the MIT Data Grid is limited to pages of up to 100 rows, and pagination can't be turned off in Community. Pro and Premium remove the limit. Infinite Table has no page limit.",
    },
    {
      q: 'Can Infinite Table match my Material UI theme?',
      a: "Not automatically: Infinite Table doesn't read MUI theme tokens. It's themed with [CSS variables](/docs/learn/theming/css-variables), which you can set from your theme's values. MUI X uses the MUI theme on its own.",
    },
  ],
  demo: {
    title: 'Grouping and aggregating the same rows in both grids',
    description:
      'Group by two columns with sum aggregations, in MUI X Data Grid Premium and in Infinite Table.',
  },
};
