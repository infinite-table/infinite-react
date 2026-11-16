// Snippets shown on filtering-data-with-infinite-table-for-react.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceProps,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function EnablingFilters() {
  return (
    //#region enabling-filters-on-the-datasource
    <DataSource<Developer> data={data} primaryKey="id" defaultFilterValue={[]}>
      <InfiniteTable<Developer> columns={columns} />
    </DataSource>
    //#endregion
  );
}

export function InitialFilters() {
  return (
    <DataSource<Developer>
      data={data}
      primaryKey="id"
      //#region initial-filters-filter-by-age-greater-than-40
      defaultFilterValue={[
        {
          field: 'age',
          filter: {
            type: 'number',
            operator: 'gt',
            value: 40
          }
        }
      ]}
      //#endregion
    />
  );
}

// The snippet below shows only the two filtering props (it used the `filterMode` prop,
// since replaced by `shouldReloadData`): the library component with
// every prop optional, so the code stays as it was published.
const AbbreviatedDataSource = DataSource as <T>(
  props: Partial<DataSourceProps<T>>,
) => React.JSX.Element;

export function LocalAndRemoteFiltering() {
  const DataSource = AbbreviatedDataSource;
  return (
    //#region local-and-remote-filtering
    <DataSource<Developer> shouldReloadData={{ filterValue: false }} filterDelay={0} />
    //#endregion
  );
}

//#region defining-filter-types-and-custom-filter-editors
import { useInfiniteColumnFilterEditor } from '@infinite-table/infinite-react';

export function BoolFilterEditor() {
  const { value, setValue } = useInfiniteColumnFilterEditor<Developer>();
  return <>{/* ... */}</>;
}
//#endregion
