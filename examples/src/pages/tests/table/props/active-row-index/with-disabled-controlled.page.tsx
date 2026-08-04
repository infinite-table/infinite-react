import {
  InfiniteTable,
  DataSource,
  DataSourceApi,
  RowDisabledStateObject,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
  type Developer,
} from './common';

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
        data={developers10DataSource}
        selectionMode="multi-row"
        rowDisabledState={rowDisabledState}
        onRowDisabledStateChange={(s) => setRowDisabledState(s.getState())}
      >
        <InfiniteTable<Developer>
          columns={disabledRowColumns}
          activeRowIndex={activeRowIndex}
          onActiveRowIndexChange={setActiveRowIndex}
          keyboardNavigation="row"
          domProps={activeRowDomProps}
        />
      </DataSource>
    </>
  );
}
