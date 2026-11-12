// Snippets shown on overview.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  city: string;
  country: string;
};

type City = {
  id: number;
  cityName: string;
  country: string;
};

declare const masterColumns: InfiniteTablePropColumns<City>;
declare function renderDetail(
  rowInfo: InfiniteTableRowInfo<City>,
): React.ReactElement;

export function DetailDataSource() {
  //#region loading-the-detail-datagrid-data
  const detailDataFn: DataSourceData<Developer> = ({
    masterRowInfo, // #highlight
    sortInfo,
    // ...
  }) => {

    return Promise.resolve([/* ... */])
  }

  <DataSource<Developer> data={detailDataFn} primaryKey="id">
    {/* ... */}
  </DataSource>
  //#endregion
  return null;
}

export function RowDetailHeight() {
  return (
    //#region configuring-the-row-detail-height
    <InfiniteTable<City>
      columns={masterColumns}
      rowDetailHeight={500} // #highlight
      rowDetailRenderer={renderDetail}
    />
    //#endregion
  );
}

export function ConditionalRowDetails() {
  return (
    //#region using-conditional-row-details
    <InfiniteTable<City>
      columns={masterColumns}
      rowDetailHeight={500}
      rowDetailRenderer={renderDetail}
      isRowDetailEnabled={(rowInfo) => rowInfo.data?.cityName?.includes('i') ?? false} // #highlight
    />
    //#endregion
  );
}
