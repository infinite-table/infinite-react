import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
  InfiniteTablePropColumnTypes,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 3,
      firstName: 'Nat',
      lastName: 'Natson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
  ];
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
      sortTool = '👆';
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

const CountryComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { value, domRef, renderBag } = useInfiniteColumnCell<Developer>();

  const isUSA = value === 'USA';
  const emoji = isUSA ? '- UNITED STATES' : '- CANADA';
  const style = {
    padding: '5px 20px',
    border: `1px solid ${isUSA ? 'red' : 'green'}`,
    ...props.style,
  };
  return (
    <div ref={domRef} {...props} style={style}>
      {/* we want to make sure the value in the renderBag is correctly used  */}
      {props.children}!{renderBag.value}!{emoji} <div style={{ flex: 1 }} />
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
  country: {
    field: 'country',
    renderValue: ({ data }) => 'Country: ' + data?.country,
    components: {
      HeaderCell: DefaultHeaderComponent,
      ColumnCell: CountryComponent,
    },
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'currency',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={500}
          columnTypes={columnTypes}
          domProps={{
            style: {
              height: 500,
            },
          }}
        />
      </DataSource>
    </>
  );
}
