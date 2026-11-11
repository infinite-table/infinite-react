// Code shown on the "Single Sorting" page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropSortFn,
  type DataSourcePropSortInfo,
  type DataSourcePropSortTypes,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  color: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function sortInfoShapes() {
  let sortInfo: DataSourcePropSortInfo<Developer>;
  //#region default-sort-info
  // sort by `firstName`, in ascending order
  const defaultSortInfo = { field: 'firstName', dir: 1 };
  //#endregion

  //#region sort-info
  // sort by `firstName`, in ascending order
  sortInfo = { field: 'firstName', dir: 1 };
  //#endregion

  //#region no-sort
  // no sorting
  sortInfo = null;
  //#endregion

  //#region multiple
  // sort by age in descending order, then by `firstName` in ascending order
  sortInfo = [
    { field: 'age', type: 'number', dir: -1 },
    { field: 'firstName', dir: 1 },
  ];

  // no sorting
  sortInfo = [];
  //#endregion

  return [defaultSortInfo, sortInfo];
}

export function UncontrolledSorting() {
  //#region uncontrolled
  // initially render the component with ascending sorting on `firstName` field
  // also, note this is an array, so multiple sorting will be enabled
  const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
    { field: 'firstName', dir: 1 },
  ];

  <DataSource<Developer>
    primaryKey="id"
    data={data}
    defaultSortInfo={defaultSortInfo} // #highlight uncontrolled
  >
    <InfiniteTable<Developer> columns={columns} />
  </DataSource>;
  //#endregion
  return null;
}

//#region default-sort-types
const sortTypes: DataSourcePropSortTypes = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
};
//#endregion

export function CustomSortType() {
  const colorOrder = ['magenta', 'blue', 'green'];
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      //#region default-sort-info-with-type
      defaultSortInfo={{
        field: 'color',
        dir: 1,
        // note this custom sort type
        type: 'color', // #highlight
      }}
      //#endregion
      //#region color-sort-type
      sortTypes={{
        ...sortTypes,
        color: (a: string, b: string) => colorOrder.indexOf(a) - colorOrder.indexOf(b),
      }}
      //#endregion
    />
  );
}

export function CustomSortFunction() {
  //#region sort-function
  const sortFunction: DataSourcePropSortFn<Developer> = (sortInfo, dataArray) => {
    // sort the dataArray according to the sortInfo
    // and return the sorted array
    return [...dataArray].sort((a, b) => {
      for (const { field, dir } of sortInfo) {
        const key = field as keyof Developer;
        if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * dir;
      }
      return 0;
    });
  };
  <DataSource<Developer> primaryKey="id" data={data} sortFunction={sortFunction} />;
  //#endregion
  return null;
}
