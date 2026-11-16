// Snippets shown on typescript-types.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region importing-infinitetable-and-datasource
import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
//#endregion

//#region generic-components
type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
};

const App = () => {
  return (
    <DataSource<Developer> data={data} primaryKey="id">
      <InfiniteTable<Developer> columns={columns} />
    </DataSource>
  );
};
//#endregion

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region prop-types
import type {
  InfiniteTablePropColumns,
  // corresponding to the `columns` prop
  DataSourcePropGroupBy,
  // corresponding to the `groupBy` prop
} from '@infinite-table/infinite-react';
//#endregion

//#region aggregation-reducers-type
import type { DataSourcePropAggregationReducers } from '@infinite-table/infinite-react';
//#endregion

//#region row-style-type
import type { InfiniteTablePropRowStyle } from '@infinite-table/infinite-react';
//#endregion

//#region column-groups-type
import type { InfiniteTablePropColumnGroups } from '@infinite-table/infinite-react';
//#endregion

export { App };
