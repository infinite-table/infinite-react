// Code shown on the "Type Definitions" page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  GroupRowsState,
  InfiniteTable,
  RowDetailState,
  type DataSourcePivotBy,
  type DataSourcePropGroupRowsStateObject,
  type InfiniteTableColumn,
  type InfiniteTablePropColumns,
  type RowDetailStateObject,
} from '@infinite-table/infinite-react';

//#region importing-the-type-for-rowinfo
import type { InfiniteTableRowInfo } from '@infinite-table/infinite-react';
//#endregion

//#region treeselectionvalue
import type { TreeSelectionValue } from '@infinite-table/infinite-react';
//#endregion

//#region treeexpandstatevalue
import type { TreeExpandStateValue } from '@infinite-table/infinite-react';
//#endregion

type Developer = {
  id: number;
  firstName: string;
  country: string;
  canDesign: 'yes' | 'no';
  salary: number;
};

type DATA_TYPE = Developer;

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

export type RowInfoOfDeveloper = InfiniteTableRowInfo<Developer>;

export function treeSelectionValue() {
  //#region example-of-tree-selection-value
  const treeSelection: TreeSelectionValue = {
    defaultSelection: false,
    selectedPaths: [['1'], ['2', '20']],
    deselectedPaths: [['1','10']],
  };
  // node ['1'] will be selected but indeterminate
  // since ['1','10'] is in the deselectedPaths
  // node ['2','20'] will be fully selected
  //#endregion
  return treeSelection;
}

export function treeExpandStateWithNodePaths() {
  //#region example-of-treeexpandstate-with-node-paths
  const treeExpandState = {
    defaultExpanded: true,
    collapsedPaths: [
      ['1', '10'],
      ['2', '20'],
      ['5']
    ],
    expandedPaths: [
      ['1', '4'],
      ['5','nested node in 5'],
    ],
  };
  //#endregion
  const value: TreeExpandStateValue = treeExpandState;
  return value;
}

export function treeExpandStateWithNodeIds() {
  //#region example-of-treeexpandstate-with-node-ids
  const treeExpandState = {
    defaultExpanded: true,
    collapsedIds: ['1', '2', '5'],
    expandedIds: ['10', '20', 'nested node in 5'],
  };
  //#endregion
  const value: TreeExpandStateValue = treeExpandState;
  return value;
}

export function RowDetailStateInstance() {
  //#region passing-an-instance-of-rowdetailstate-to-the
  const rowDetailState = new RowDetailState({
    collapsedRows: true,
    expandedRows: [2, 3, 4],
  });

  <InfiniteTable<DATA_TYPE> columns={columns} rowDetailState={rowDetailState} />;
  //#endregion
  return null;
}

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

export function rowDetailStateCloneAndGetState() {
  //#region rowdetailstate
  const rowDetailState = new RowDetailState({
    collapsedRows: true,
    expandedRows: [2, 3, 4],
  });
  const clone = new RowDetailState(rowDetailState);

  const state = rowDetailState.getState();
  //#endregion
  const stateObject: RowDetailStateObject = state;
  return [clone, stateObject];
}

export function rowDetailStateExpandCollapse() {
  //#region rowdetailstate-expand-collapse
  const rowDetailState = new RowDetailState({
    collapsedRows: true,
    expandedRows: [2, 3, 4],
  });
  rowDetailState.expandRowDetails(5);
  rowDetailState.collapseRowDetails(2);

  // now you can pass this instance back to the InfiniteTable component
  //#endregion
  return rowDetailState;
}

export function groupRowsState() {
  //#region grouprowsstate
  const state = new GroupRowsState({
    expandedRows: true,
    collapsedRows: [
      ['Europe'],
      ['Europe','France'],
      ['Italy']
    ]
  })

  console.log(state.getState())
  // will log the above object that was used
  // as the sole argument for the constructor
  //#endregion
  const stateObject: DataSourcePropGroupRowsStateObject = state.getState();
  return stateObject;
}

export function pivotByWithColumnFunction() {
  //#region datasourcepivotby
  const pivotBy: DataSourcePivotBy<Developer>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column: pivotCol }) => {
        const lastKey =
          pivotCol.pivotGroupKeys[pivotCol.pivotGroupKeys.length - 1];

        return {
          header: lastKey === 'yes' ? '💅 Designer' : '💻 Non-designer',
        };
      },
    },
  ];
  //#endregion
  return pivotBy;
}

export function columnRenderHeader() {
  //#region example-column-renderheader-function
  const renderHeader: InfiniteTableColumn<Developer>['renderHeader'] = ({ renderBag }) => {
    return (
      <b style={{ display: 'flex', color: 'tomato', alignItems: 'center' }}>
        ({renderBag.header}) {renderBag.sortIcon}
      </b>
    );
  };
  const columns = {
    salary: {
      field: 'salary',
      type: 'number',
      renderHeader,
    },
  };
  //#endregion

  // the function above is a valid `renderHeader` for a column
  const salary: InfiniteTableColumn<Developer> = {
    field: 'salary',
    type: 'number',
    renderHeader,
  };
  return [columns, salary];
}
