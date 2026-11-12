// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSourcePivotBy,
  GroupRowsState,
  InfiniteTable,
  RowDetailState,
} from '@infinite-table/infinite-react';

//#region importing-the-type-for-rowinfo
import type { InfiniteTableRowInfo } from '@infinite-table/infinite-react';
//#endregion

//#region treeselectionvalue
import type { TreeSelectionValue } from '@infinite-table/infinite-react';
//#endregion

{
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
}

//#region treeexpandstatevalue
import type { TreeExpandStateValue } from '@infinite-table/infinite-react';
//#endregion

{
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
}

{
  //#region example-of-treeexpandstate-with-node-ids
  const treeExpandState = {
    defaultExpanded: true,
    collapsedIds: ['1', '2', '5'],
    expandedIds: ['10', '20', 'nested node in 5'],
  };
  //#endregion
}

{
  //#region passing-an-instance-of-rowdetailstate-to-the
  const rowDetailState = new RowDetailState({
    collapsedRows: true,
    expandedRows: [2, 3, 4],
  });

  <InfiniteTable<DATA_TYPE> rowDetailState={rowDetailState} />;
  //#endregion
}

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
  //#region rowdetailstate
  const rowDetailState = new RowDetailState({
    collapsedRows: true,
    expandedRows: [2, 3, 4],
  });
  const clone = new RowDetailState(rowDetailState);

  const state = rowDetailState.getState();
  //#endregion
}

{
  //#region rowdetailstate-2
  const rowDetailState = new RowDetailState({
    collapsedRows: true,
    expandedRows: [2, 3, 4],
  });
  rowDetailState.expandRowDetails(5);
  rowDetailState.collapseRowDetails(2);

  // now you can pass this instance back to the InfiniteTable component
  //#endregion
}

{
  //#region grouprowsstate
  const state = new GroupRowsState({
    expandedRows: true,
    collapsedRows: [
      ['Europe']
      ['Europe','France'],
      ['Italy']
    ]
  })

  console.log(state.getState())
  // will log the above object that was used 
  // as the sole argument for the constructor
  //#endregion
}

{
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
}

{
  //#region example-column-renderheader-function
  const renderHeader = ({ renderBag }) => {
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
}

export {};
