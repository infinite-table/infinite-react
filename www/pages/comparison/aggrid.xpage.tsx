//@ts-nocheck
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useState } from 'react';
//@ts-ignore
//@ts-ignore

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import {
  columns,
  COLUMN_GROUP_WIDTH,
  COLUMN_WIDTH,
  ROW_HEIGHT,
} from './columns';

const columnDefs: ColDef[] = columns.map((column) => {
  const colDef: ColDef = {};

  if (column.field) {
    colDef.field = column.field;
  }

  if (column.getValue) {
    colDef.valueGetter = (params: any) => {
      return params.data ? column.getValue?.(params.data) : null;
    };
  }

  if (column.header) {
    colDef.headerName = column.header;
  }

  if (column.group) {
    colDef.rowGroup = true;
  }

  return colDef;
});

const defaultColDef = {
  initialWidth: COLUMN_WIDTH,
  sortable: true,
  resizable: true,
};

const autoGroupColumnDef = {
  initialWidth: COLUMN_GROUP_WIDTH,
};

const getData = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k').then((r) =>
    r.json(),
  );
};

const App = () => {
  const [rowData, setRowData] = React.useState(null);

  const onGridReady = React.useCallback(async (params: any) => {
    const data = await getData();
    setRowData(data);
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact
        groupDefaultExpanded={1}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        rowData={rowData}
        rowHeight={ROW_HEIGHT}
        onGridReady={onGridReady}
        columnDefs={columnDefs}
      ></AgGridReact>
    </div>
  );
};

export default App;
