import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type {
  InfiniteTableProps,
  InfiniteTablePropColumns,
  DataSourceProps,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

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
    renderGroupValue: ({ value }) => `Stack: ${value || ''}`,
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
    renderGroupValue: ({ value }) => `Lang: ${value || ''}`,
  },
  canDesign: {
    field: 'canDesign',
    renderGroupValue: ({ value }) => `Can design: ${value || ''}`,
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] = [
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

const groupColumn: InfiniteTableProps<Developer>['groupColumn'] = {
  field: 'firstName',
  renderSelectionCheckBox: ({ renderBag }) => {
    // render the default value and decorate it
    return <b>[{renderBag.selectionCheckBox}]</b>;
  },
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
      selectionMode="multi-row"
      primaryKey="id"
    >
      <InfiniteTable<Developer>
        columns={columns}
        domProps={domProps}
        groupColumn={groupColumn}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
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
