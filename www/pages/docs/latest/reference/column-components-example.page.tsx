import * as React from 'react';

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
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers1k'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const DefaultHeaderComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { column, domRef, columnSortInfo } =
    useInfiniteHeaderCell<Developer>();

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
      {column.field} {sortTool}
    </div>
  );
};

const StackComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const params = useInfiniteColumnCell<Developer>();
  const { value, domRef } = params;

  const isFrontEnd = value === 'frontend';
  const emoji = isFrontEnd ? '⚛️' : '💽';
  const style = {
    ...props.style,
    padding: '5px 20px',
    border: `1px solid ${isFrontEnd ? 'red' : 'green'}`,
  };
  return (
    <div ref={domRef} {...props} style={style}>
      {value} <div style={{ flex: 1 }} /> {emoji}
    </div>
  );
};

const columnTypes: InfiniteTablePropColumnTypes<Developer> =
  {
    default: {
      components: {
        HeaderCell: DefaultHeaderComponent,
      },
    },
  };

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    components: {
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
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnTypes={columnTypes}
        />
      </DataSource>
    </>
  );
}
