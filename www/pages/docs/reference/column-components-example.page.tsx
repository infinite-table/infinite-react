import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropGroupColumn,
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const DefaultHeaderComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { column, domRef, columnSortInfo } = useInfiniteHeaderCell<Developer>();

  const style = {
    ...props.style,
    border: '1px solid #fefefe',
  };

  let sortTool = '';
  switch (columnSortInfo?.dir) {
    case undefined:
      sortTool = '👉';
      break;
    case 1:
      sortTool = '👇';
      break;
    case -1:
      sortTool = '☝🏽';
      break;
  }

  return (
    <div ref={domRef} {...props} style={style}>
      {/* here you would usually have: */}
      {/* {props.children} {sortTool} */}
      {/* but in this case we want to override the default sort tool as well (which is part of props.children) */}
      {column.field} {sortTool}
    </div>
  );
};

const StackComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { value, domRef } = useInfiniteColumnCell<Developer>();

  const isFrontEnd = value === 'frontend';
  const emoji = isFrontEnd ? '⚛️' : '💽';
  const style = {
    padding: '5px 20px',
    border: `1px solid ${isFrontEnd ? 'red' : 'green'}`,
    ...props.style,
  };
  return (
    <div ref={domRef} {...props} style={style}>
      {props.children} <div style={{ flex: 1 }} /> {emoji}
    </div>
  );
};

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    // override all columns to use these components
    components: {
      HeaderCell: DefaultHeaderComponent,
    },
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    renderValue: ({ data }) => 'Stack: ' + data?.stack,
    components: {
      HeaderCell: DefaultHeaderComponent,
      ColumnCell: StackComponent,
    },
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnTypes={columnTypes} />
      </DataSource>
    </>
  );
}
