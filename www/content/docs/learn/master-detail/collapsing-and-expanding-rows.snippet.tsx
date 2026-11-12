// Snippets shown on collapsing-and-expanding-rows.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  RowDetailStateObject,
} from '@infinite-table/infinite-react';

{
  //#region specyfing-the-default-row-detail-state
  const defaultRowDetailState = {
    collapsedRows: true,
    expandedRows: [39, 54],
  };

  <InfiniteTable
    columns={...}
    defaultRowDetailState={defaultRowDetailState} // #highlight
    rowDetailRenderer={...}
  />
  //#endregion
}

{
  //#region understanding-and-defining-the-collapse-expand
  const defaultRowDetailState = {
    collapsedRows: true,
    expandedRows: ['id-1', 'id-2', 'id-56'],
  };
  //#endregion
}

{
  //#region understanding-and-defining-the-collapse-expand-2
  const rowDetailState = {
    expandedRows: true,
    collapsedRows: ['id-1', 'id-2', 'id-56'],
  };
  //#endregion
}

//#region passing-an-instance-of-rowdetailstate-to-the
import { RowDetailState } from '@infinite-table/infinite-react';

const rowDetailState = new RowDetailState({
  collapsedRows: true,
  expandedRows: [2, 3, 4],
});

<InfiniteTable<DATA_TYPE> rowDetailState={rowDetailState} />;
//#endregion

{
  //#region passing-an-object-literal-to-the-infinitetable
  <InfiniteTable<DATA_TYPE>
    rowDetailState={{
      collapsedRows: true,
      expandedRows: [2, 3, 4],
    }}
  />
  //#endregion
}

{
  //#region using-the-onrowdetailstatechange-listener
  function App() {
    const [rowDetailState, setRowDetailState] = React.useState<RowDetailStateObject>({
      collapsedRows: true as const,
      expandedRows: [39, 54],
    });

    return <DataSource<DATA_TYPE> {...}>
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
}

{
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
      <InfiniteTable<DATA_TYPE> rowDetailState={rowDetailState} />
    </>
  );
  //#endregion
}

export {};
