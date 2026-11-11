import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const tanstackTableCopy: CompareCopy = {
  id: 'tanstack-table',
  metaDescription:
    'Infinite Table vs TanStack Table: a complete data grid vs a headless table library. Features, what you build yourself, bundle size, licensing and migration.',
  tagline:
    'TanStack Table gives you table logic and leaves the UI to you. Infinite Table is a finished grid: virtualized, keyboard-navigable and themed, configured with props.',
  verdict: [
    'TanStack Table is a headless library. It computes sorting, filtering, grouping, selection and pagination, and you write every element, style, event handler and ARIA attribute. That is ideal for a table in your own design system, or a small table that must match your markup exactly. It is MIT-licensed, tiny, and has adapters for most frameworks.',
    'Infinite Table ships the whole grid. Row and column virtualization, column resizing, reordering, pinning and menus, grouping, pivoting, editing, keyboard navigation and context menus work as soon as you render it. Building the same on top of TanStack Table and TanStack Virtual is a substantial project, and that code is then yours to maintain.',
    'The trade-off: TanStack Table is free with no footer and gives total control. Infinite Table is free with a footer, or $395 per developer per year without it, and gives you the finished grid.',
  ],
  chooseThem: [
    'You need full control over the markup, for example for a table component in your design system.',
    'Your tables are small and simple, and a few kilobytes of logic is all you want to add.',
    'You want an MIT license, with no footer and no license key.',
    "You use Svelte, Solid, Angular, Lit or another framework Infinite Table doesn't support.",
    "You've already built a mature grid UI on top of it.",
  ],
  chooseInfinite: [
    'You want to ship a data grid, not build one: virtualization, resizing, pinning, menus and keyboard navigation are built in.',
    "You need pivoting, which TanStack Table doesn't have, or lazy loading from a server.",
    'You need cell editing or a context menu without writing them yourself.',
    'You still want a declarative API, with columns, sorting, grouping and selection as controlled or uncontrolled props.',
  ],
  sections: [
    {
      title: 'Headless vs complete',
      paragraphs: [
        'With TanStack Table you render the `<table>` (or `div`s) yourself, call `FlexRender` for each header and cell, and style everything. Its v9 API makes every feature opt-in, so you only bundle the logic you use.',
        'With Infinite Table you pass columns and data, and get a virtualized, themed grid. You still customize cells, headers, editors and filters with your own components.',
      ],
    },
    {
      title: 'What you build yourself on TanStack Table',
      paragraphs: [
        'Virtualization (usually with TanStack Virtual), sort indicators, filter inputs, column resize handles, drag and drop for columns and rows, group expand and collapse, pinned-column layout, keyboard navigation, focus management, ARIA roles, editing and context menus.',
        'None of these are hard on their own. Together they are most of the work in a data grid, and Infinite Table includes them.',
      ],
    },
  ],
  migration: {
    intro:
      'A sortable table in TanStack Table v9 next to the same grid in Infinite Table. The TanStack version still has no virtualization, resizing or styling; the Infinite Table version has all three.',
    from: {
      label: 'TanStack Table v9',
      code: `
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

${CARS_TYPE}

${CARS_DATA}

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

const columns: ColumnDef<typeof features, Car>[] = [
  { accessorKey: 'make', header: 'Make' },
  { accessorKey: 'model', header: 'Model' },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: (info) => <b>{info.getValue<number>()}</b>,
  },
];

export function Cars() {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => String(row.id),
    initialState: { sorting: [{ id: 'make', desc: false }] },
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
              >
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`columns` with `accessorKey`', '`columns` (an object keyed by column id) with `field`'],
      ['`header`', '`header`'],
      ['`cell`', '`renderValue` or `render`'],
      ['`size` (column sizing feature)', '`defaultWidth`, `defaultFlex`, or the `columnSizing` prop'],
      ['`getRowId`', '`primaryKey` on `<DataSource>`'],
      ['`initialState.sorting`, `state.sorting`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`grouping` state, grouped row model', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`getSubRows`, expanded row model', '`<TreeDataSource>` and `<TreeGrid>`'],
      ['`manualSorting`, `manualFiltering`...', 'a `data` function on `<DataSource>` (server-side)'],
      ['TanStack Virtual', 'built in'],
    ],
  },
  faq: [
    {
      q: 'Is TanStack Table a data grid?',
      a: 'Not by itself. TanStack Table is a headless table library: it provides state and logic, not markup or styles. You build the grid UI on top of it, often with TanStack Virtual for virtualization.',
    },
    {
      q: 'Does TanStack Table support pivoting?',
      a: "No pivoting feature is documented for TanStack Table v9. It has grouping and aggregation logic. Infinite Table has [pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview) built in, on the client or the server.",
    },
    {
      q: 'Is TanStack Table smaller than Infinite Table?',
      a: 'Yes, much smaller, because it ships no UI. The comparison that matters for a data grid is TanStack Table plus TanStack Virtual plus everything you build on top, against a complete grid.',
    },
    {
      q: 'Can I use Infinite Table with Tailwind or shadcn/ui?',
      a: 'Yes. Infinite Table is themed with [CSS variables](/docs/learn/theming/css-variables) and ships several themes, including one styled after shadcn/ui.',
    },
    {
      q: 'Which TanStack Table version does this page compare?',
      a: 'TanStack Table v9, the current stable major when we last checked. v9 changed the API: `useTable` with opt-in `tableFeatures` replaces the `useReactTable` hook of v8.',
    },
  ],
  demo: {
    title: 'The same grouped, virtualized table built both ways',
    description:
      'A large table with grouping, resizing and pinning: built with TanStack Table, TanStack Virtual and hand-written UI, next to Infinite Table.',
  },
};
