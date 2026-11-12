// Snippets shown on collapsing-and-expanding-rows.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceProps,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
  type RowDetailStateObject,
} from '@infinite-table/infinite-react';

type DATA_TYPE = {
  id: number;
  name: string;
  country: string;
};

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;
declare const masterColumns: InfiniteTablePropColumns<DATA_TYPE>;
declare const dataSourceProps: DataSourceProps<DATA_TYPE>;
declare function renderDetail(
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>,
): React.ReactElement;

export function DefaultRowDetailState() {
  //#region specyfing-the-default-row-detail-state
  const defaultRowDetailState: RowDetailStateObject = {
    collapsedRows: true,
    expandedRows: [39, 54],
  };

  <InfiniteTable
    columns={columns}
    defaultRowDetailState={defaultRowDetailState} // #highlight
    rowDetailRenderer={renderDetail}
  />
  //#endregion
  return null;
}

export function collapsedByDefault() {
  //#region understanding-and-defining-the-collapse-expand
  const defaultRowDetailState = {
    collapsedRows: true,
    expandedRows: ['id-1', 'id-2', 'id-56'],
  };
  //#endregion
  return defaultRowDetailState;
}

export function expandedByDefault() {
  //#region expanded-rows-true
  const rowDetailState = {
    expandedRows: true,
    collapsedRows: ['id-1', 'id-2', 'id-56'],
  };
  //#endregion
  return rowDetailState;
}

//#region passing-an-instance-of-rowdetailstate-to-the
import { RowDetailState } from '@infinite-table/infinite-react';

const rowDetailState = new RowDetailState({
  collapsedRows: true,
  expandedRows: [2, 3, 4],
});

<InfiniteTable<DATA_TYPE> columns={columns} rowDetailState={rowDetailState} />;
//#endregion

export function RowDetailStateObjectLiteral() {
  return (
    //#region passing-an-object-literal-to-the-infinitetable
    <InfiniteTable<DATA_TYPE>
      columns={columns}
      rowDetailState={{
        collapsedRows: true,
        expandedRows: [2, 3, 4],
      }}
    />
    //#endregion
  );
}

export function onRowDetailStateChangeListener() {
  //#region using-the-onrowdetailstatechange-listener
  function App() {
    const [rowDetailState, setRowDetailState] = React.useState<RowDetailStateObject>({
      collapsedRows: true as const,
      expandedRows: [39, 54],
    });

    return <DataSource<DATA_TYPE> {...dataSourceProps}>
      <InfiniteTable<DATA_TYPE>
        rowDetailState={rowDetailState}
        onRowDetailStateChange={(rowDetailStateInstance) => {
          setRowDetailState(rowDetailStateInstance.getState()); // #highlight
        }}
        columnMinWidth={50}
        columns={masterColumns}
        rowDetailHeight={200}
        rowDetailRenderer={renderDetail}
      />
    </DataSource>
  }
  //#endregion
  return App;
}

export function ExpandAndCollapseAll() {
  //#region listening-to-row-detail-state-changes
  const [rowDetailState, setRowDetailState] =
    React.useState<RowDetailStateObject>({
      collapsedRows: true,
      expandedRows: [39, 54],
    });

  const expandAll = () => {
    setRowDetailState({
      collapsedRows: [],
      expandedRows: true,
    });
  };
  const collapseAll = () => {
    setRowDetailState({
      collapsedRows: true,
      expandedRows: [],
    });
  };

  return (
    <>
      <button onClick={expandAll}>Expand All</button>
      <button onClick={collapseAll}>Collapse All</button>
      <InfiniteTable<DATA_TYPE> columns={columns} rowDetailState={rowDetailState} />
    </>
  );
  //#endregion
}
