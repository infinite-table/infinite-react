import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const syncfusionCopy: CompareCopy = {
  id: 'syncfusion',
  metaDescription:
    'Infinite Table vs Syncfusion React Grid: features, Community License conditions, pricing, bundle size and migration, with sources for every claim.',
  tagline:
    "Syncfusion's Grid is part of a huge component suite with a free license for small companies. Infinite Table is one zero-dependency grid, free for everyone with a footer.",
  verdict: [
    'The Syncfusion React Grid is very complete: grouping and aggregates, master-detail, editing, clipboard, context and column menus, Excel, CSV and PDF export, all first-party. Tree data and pivoting are separate components (Tree Grid and Pivot Table) that come with the Grid SDK. Small companies (under $1M revenue, 5 developers or fewer, 10 employees or fewer) can use it for free under the Community License; everyone else pays from $959 per developer per year.',
    'Infinite Table is free for any company with a footer, or $395 per developer per year without it, and has **zero runtime dependencies**. It does grouping, pivoting and tree data in the grid itself. Syncfusion is ahead on export, clipboard, accessibility, RTL and platform coverage.',
  ],
  chooseThem: [
    "You're eligible for the Community License and want a large free suite.",
    'You need Excel, CSV or PDF export and clipboard paste built in.',
    'You build for several platforms: React, Angular, Vue, Blazor, ASP.NET, .NET MAUI or desktop.',
    'You want many other components (charts, scheduler, Gantt, diagram) from one vendor.',
  ],
  chooseInfinite: [
    "You're not eligible for the Community License and want a free grid you can use commercially.",
    'You want pivoting and tree data in the same grid.',
    'You want one package with no dependencies instead of a family of packages.',
    'You prefer a declarative API with controlled and uncontrolled props.',
  ],
  migration: {
    intro:
      'Syncfusion uses `<ColumnsDirective>` children and injected feature modules; Infinite Table uses a `columns` object, with every feature already in the package.',
    from: {
      label: 'Syncfusion React Grid',
      code: `
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Sort,
} from '@syncfusion/ej2-react-grids';
// plus a Syncfusion theme stylesheet

${CARS_TYPE}

${CARS_DATA}

export function Cars() {
  return (
    <GridComponent
      dataSource={data}
      height={500}
      allowSorting={true}
      sortSettings={{ columns: [{ field: 'make', direction: 'Ascending' }] }}
    >
      <ColumnsDirective>
        <ColumnDirective field="id" isPrimaryKey={true} visible={false} />
        <ColumnDirective field="make" headerText="Make" />
        <ColumnDirective field="model" headerText="Model" width={200} />
        <ColumnDirective
          field="price"
          headerText="Price"
          template={(props: Car) => <b>{props.price}</b>}
        />
      </ColumnsDirective>
      <Inject services={[Sort]} />
    </GridComponent>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`<ColumnDirective field>`', '`columns` (an object keyed by column id) with `field`'],
      ['`headerText`', '`header`'],
      ['`width`', '`defaultWidth`, or the `columnSizing` prop'],
      ['`template`', '`renderValue` or `render`'],
      ['`isPrimaryKey`', '`primaryKey` on `<DataSource>`'],
      ['`sortSettings`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`groupSettings`, `aggregates`', '`groupBy` and `aggregationReducers` on `<DataSource>`'],
      ['`<Inject services>`', 'nothing: every feature is in the package'],
      ['`DataManager` adaptors', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Who can use the Syncfusion Community License?',
      a: 'According to Syncfusion, companies and individuals with less than $1 million USD in annual gross revenue, 5 or fewer developers and 10 or fewer employees, that have never received more than $3 million in outside capital. Infinite Table has no such conditions: anyone can use it for free with the footer.',
    },
    {
      q: 'Does the Syncfusion Grid support pivoting and tree data?',
      a: 'Through separate components: the Pivot Table and the Tree Grid, both included in the Grid SDK. Infinite Table does grouping, pivoting and tree data in the grid itself.',
    },
  ],
  demo: {
    title: 'Grouping and aggregating in both grids',
    description: 'The same rows grouped with aggregates in the Syncfusion Grid and in Infinite Table.',
  },
};
