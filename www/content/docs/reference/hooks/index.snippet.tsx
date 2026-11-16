// Code shown on the "Hooks" reference page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

//#region usedatasourcestate
import { useDataSourceState } from '@infinite-table/infinite-react'
//#endregion

//#region useinfinitecolumncell
import { useInfiniteColumnCell } from '@infinite-table/infinite-react';
//#endregion

//#region useinfiniteheadercell
import { useInfiniteHeaderCell } from '@infinite-table/infinite-react';
//#endregion

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

function App(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}

export function DataLength() {
  //#region example-usage-selecting-the-length-of-the-data

  const length = useDataSourceState(state => state.dataArray.length)
  //#endregion
  return <>{length}</>;
}

export function NestedInfiniteTable() {
  return (
    //#region infinitetable-can-be-nested-anywhere-inside-the
    <DataSource primaryKey="id" data={data}>
      <h1>Your DataGrid</h1>
      <App>
        <InfiniteTable columns={columns} />
      </App>
    </DataSource>
    //#endregion
  );
}

//#region useinfinitecolumncell-custom-cell
const CustomCellComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, ...other } = useInfiniteColumnCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};
//#endregion

//#region useinfiniteheadercell-custom-header
const CustomHeaderComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, ...other } = useInfiniteHeaderCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};
//#endregion

// the two components above are what `column.components` expects
export const columnsWithCustomComponents: InfiniteTablePropColumns<Developer> = {
  salary: {
    field: 'salary',
    components: {
      ColumnCell: CustomCellComponent,
      HeaderCell: CustomHeaderComponent,
    },
  },
};
