// Snippets shown on filtering-data-with-infinite-table-for-react.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region enabling-filters-on-the-datasource
  <DataSource<Developer> data={/* ... */} primaryKey="id" defaultFilterValue={[]}>
    <InfiniteTable<Developer> columns={columns} />
  </DataSource>
  //#endregion
}

{
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
}

{
  //#region local-and-remote-filtering
  <DataSource<Developer> filterMode="local" filterDelay={0} />
  //#endregion
}

//#region defining-filter-types-and-custom-filter-editors
import { useInfiniteColumnFilterEditor } from '@infinite-table/infinite-react';

export function BoolFilterEditor() {
  const { value, setValue } = useInfiniteColumnFilterEditor<Developer>();
  return <>{/* ... */}</>;
}
//#endregion

export {};
