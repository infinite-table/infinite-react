import {
  DataSourceApi,
  DataSourceCallback_BaseParam,
  DataSourcePropCellSelection_MultiCell,
  DataSourcePropCellSelection_SingleCell,
  DataSourcePropIsNodeExpanded,
  DataSourcePropIsNodeSelected,
  DataSourcePropOnCellSelectionChange_MultiCell,
  DataSourcePropOnCellSelectionChange_SingleCell,
  DataSourcePropOnTreeSelectionChange_MultiNode,
  DataSourcePropOnTreeSelectionChange_SingleNode,
  DataSourceProps,
  DataSourcePropTreeSelection,
  DataSourcePropTreeSelection_MultiNode,
  DataSourcePropTreeSelection_SingleNode,
  TreeExpandStateValue,
} from '../../DataSource';
import {
  NodePath,
  TreeExpandStateObject,
} from '../../DataSource/TreeExpandState';

type OnNodeStateChangeParam = DataSourceCallback_BaseParam<any> & {};
type TreeDataSourceOnlyProps<T> = {
  nodesKey?: string;

  treeSelection?: DataSourcePropTreeSelection;

  defaultTreeSelection?: DataSourcePropTreeSelection;

  treeExpandState?: TreeExpandStateValue;
  defaultTreeExpandState?: TreeExpandStateValue;
  onTreeExpandStateChange?: (
    treeExpandState: TreeExpandStateObject<any>,
    params: {
      dataSourceApi: DataSourceApi<T>;
      nodePath: NodePath | null;
      nodeState: 'collapsed' | 'expanded';
    },
  ) => void;

  isNodeSelected?: DataSourcePropIsNodeSelected<T>;

  /**
   * Called when a node is expanded. Not called when treeApi.expandAll is called.
   */
  onNodeExpand?: (node: NodePath, param: OnNodeStateChangeParam) => void;

  /**
   * Called when a node is collapsed. Not called when treeApi.collapseAll is called.
   */
  onNodeCollapse?: (node: NodePath, param: OnNodeStateChangeParam) => void;
} & (
  | {
      selectionMode?: 'multi-row';
      treeSelection?: DataSourcePropTreeSelection_MultiNode;
      defaultTreeSelection?: DataSourcePropTreeSelection_MultiNode;
      onTreeSelectionChange?: DataSourcePropOnTreeSelectionChange_MultiNode;
    }
  | {
      selectionMode?: 'single-row';
      treeSelection?: DataSourcePropTreeSelection_SingleNode;
      defaultTreeSelection?: DataSourcePropTreeSelection_SingleNode;
      onTreeSelectionChange?: DataSourcePropOnTreeSelectionChange_SingleNode;
    }
  | {
      selectionMode?: 'single-cell';
      cellSelection?: DataSourcePropCellSelection_SingleCell;
      defaultCellSelection?: DataSourcePropCellSelection_SingleCell;
      onCellSelectionChange?: DataSourcePropOnCellSelectionChange_SingleCell;
    }
  | {
      selectionMode?: 'multi-cell';
      cellSelection?: DataSourcePropCellSelection_MultiCell;
      defaultCellSelection?: DataSourcePropCellSelection_MultiCell;
      onCellSelectionChange?: DataSourcePropOnCellSelectionChange_MultiCell;
    }
  | {
      selectionMode?: false;
    }
) &
  (
    | {
        isNodeCollapsed?: DataSourcePropIsNodeExpanded<T>;
        isNodeExpanded?: never;
      }
    | {
        isNodeExpanded?: DataSourcePropIsNodeExpanded<T>;
        isNodeCollapsed?: never;
      }
  );

export type DataSourcePropsNotAvailableInTreeDataSource = keyof Pick<
  DataSourceProps<any>,
  | 'groupBy'
  | 'defaultGroupBy'
  | 'nodesKey'
  | 'defaultGroupRowsState'
  | 'groupRowsState'
  | 'onGroupRowsStateChange'
  | 'onGroupByChange'
  | 'collapseGroupRowsOnDataFunctionChange'
  | 'livePagination'
  | 'onLivePaginationCursorChange'
  | 'groupMode'
  | 'onPivotByChange'
  | 'pivotBy'
  | 'defaultPivotBy'
  | 'selectionMode'
  | 'rowSelection'
  | 'defaultRowSelection'
>;

export type TreeDataSourceProps<T> = Omit<
  DataSourceProps<T>,
  DataSourcePropsNotAvailableInTreeDataSource
> &
  TreeDataSourceOnlyProps<T>;
