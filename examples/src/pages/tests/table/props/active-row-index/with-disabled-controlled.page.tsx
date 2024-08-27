import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  type InfiniteTablePropColumns,
  DataSourceApi,
  RowDisabledStateObject,
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

  const [rowDisabledState, setRowDisabledState] =
    useState<RowDisabledStateObject>({
      enabledRows: true,
      disabledRows: [3, 5, 6],
    });

  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<Developer>>();

  (globalThis as any).activeRowIndex = activeRowIndex;
  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => dataSourceApi?.disableAllRows()}>
          Disable All Rows
        </button>
        <button
          onClick={() => dataSourceApi?.enableAllRows()}
          style={{ marginLeft: '10px' }}
        >
          Enable All Rows
        </button>
        <button
          onClick={() => {
            if (dataSourceApi) {
              const isRowDisabled = dataSourceApi.isRowDisabled(1);
              dataSourceApi.setRowEnabledAt(1, isRowDisabled);
            }
          }}
          style={{ marginLeft: '10px' }}
        >
          Toggle Row 1
        </button>
      </div>
      <DataSource<Developer>
        onReady={setDataSourceApi}
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-row"
        rowDisabledState={rowDisabledState}
        onRowDisabledStateChange={(s) => setRowDisabledState(s.getState())}
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
    </>
  );
}
