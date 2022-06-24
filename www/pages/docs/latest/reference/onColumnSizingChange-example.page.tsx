import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropGroupColumn,
  InfiniteTableColumnGroup,
  InfiniteTableColumnSizingOptions,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import { useState } from 'react';

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

const columns: InfiniteTablePropColumns<Developer> = {
  currency: {
    field: 'currency',
    columnGroup: 'finance',
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
    maxWidth: 400,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    columnGroup: 'regionalInfo',
  },
  id: { field: 'id' },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
};

const columnGrous: Record<
  string,
  InfiniteTableColumnGroup
> = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
};

export default function ColumnValueGetterExample() {
  const [columnSizing, setColumnSizing] =
    useState<InfiniteTablePropColumnSizing>({
      salary: {
        maxWidth: 130,
        width: 80,
      },
      currency: {
        maxWidth: 130,
        width: 80,
      },
    });
  return (
    <>
      <p style={{ color: 'var(--infinite-cell-color)' }}>
        Current column sizing:{' '}
        <code>
          <pre>{JSON.stringify(columnSizing, null, 2)}</pre>
        </code>
      </p>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          columnGroups={columnGrous}
          columns={columns}
          columnDefaultWidth={100}
        />
      </DataSource>
    </>
  );
}
