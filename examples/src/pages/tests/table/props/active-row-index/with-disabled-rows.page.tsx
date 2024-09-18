import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';

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

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },

  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function KeyboardNavigationForRows() {
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  (globalThis as any).activeRowIndex = activeRowIndex;
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      selectionMode="multi-row"
      rowDisabledState={{
        enabledRows: true,
        disabledRows: [3, 5, 6],
      }}
      defaultRowSelection={{
        selectedRows: [5, 6, 7, 8],
        defaultSelection: false,
      }}
    >
      <InfiniteTable<Developer>
        columns={columns}
        activeRowIndex={activeRowIndex}
        onActiveRowIndexChange={setActiveRowIndex}
        keyboardNavigation="row"
        domProps={{
          autoFocus: true,
          style: {
            height: 800,
          },
        }}
      />
    </DataSource>
  );
}
