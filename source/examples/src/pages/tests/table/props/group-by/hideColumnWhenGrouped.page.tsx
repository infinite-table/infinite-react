import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  InfiniteTablePropGroupColumn,
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
    defaultHiddenWhenGroupedBy: true,
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  field: 'firstName',
};

export default function GroupByExample() {
  const [currentGroupBy, setCurrentGroupBy] = useState(
    groupBy as DataSourcePropGroupBy<Developer>,
  );
  return (
    <>
      <button
        onClick={() => {
          setCurrentGroupBy([]);
        }}
      >
        ungroup
      </button>
      <button
        onClick={() => {
          setCurrentGroupBy(groupBy as DataSourcePropGroupBy<Developer>);
        }}
      >
        group by stack and preferred language
      </button>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={currentGroupBy}
        selectionMode="multi-row"
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          keyboardNavigation="row"
          groupRenderStrategy="single-column"
          hideColumnWhenGrouped
          groupColumn={groupColumn}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}
