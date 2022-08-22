import * as React from 'react';
import {
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import type {
  DataSourceProps,
  InfiniteTableProps,
  InfiniteTableApi,
  InfiniteTablePropColumns,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  canDesign: {
    field: 'canDesign',
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] =
  [
    {
      field: 'canDesign',
    },
    {
      field: 'stack',
    },
    {
      field: 'preferredLanguage',
    },
  ];

const groupColumn: InfiniteTableProps<Developer>['groupColumn'] =
  {
    field: 'firstName',

    defaultWidth: 300,
  };

const domProps = {
  style: {
    flex: 1,
    minHeight: 500,
  },
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      groupBy={defaultGroupBy}
      primaryKey="id">
      <InfiniteTable<Developer>
        columns={columns}
        domProps={domProps}
        keyboardNavigation="cell"
        hideColumnWhenGrouped
        groupColumn={groupColumn}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers100'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
