// Snippets shown on overview.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourceData,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region loading-the-detail-datagrid-data
  const detailDataFn: DataSourceData<Developer> = ({
    masterRowInfo, // #highlight
    sortInfo,
    ...
  }) => {

    return Promise.resolve([...])
  }

  <DataSource<Developer> data={detailDataFn}>
    {...}
  </DataSource>
  //#endregion
}

{
  //#region configuring-the-row-detail-height
  <InfiniteTable<City>
    columns={masterColumns}
    rowDetailHeight={500} // #highlight
    rowDetailRenderer={renderDetail}
  />
  //#endregion
}

{
  //#region using-conditional-row-details
  <InfiniteTable<City>
    columns={masterColumns}
    rowDetailHeight={500}
    rowDetailRenderer={renderDetail}
    isRowDetailEnabled={(rowInfo) => rowInfo.data.cityName.contains('i')} // #highlight
  />
  //#endregion
}

export {};
