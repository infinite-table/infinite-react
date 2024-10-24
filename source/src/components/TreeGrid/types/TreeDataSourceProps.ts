import {
  DataSourcePropCellSelection_MultiCell,
  DataSourcePropCellSelection_SingleCell,
  DataSourcePropIsNodeExpanded,
  DataSourcePropOnCellSelectionChange_MultiCell,
  DataSourcePropOnCellSelectionChange_SingleCell,
  DataSourcePropOnTreeSelectionChange_MultiNode,
  DataSourcePropOnTreeSelectionChange_SingleNode,
  DataSourceProps,
  DataSourcePropTreeSelection_MultiNode,
  DataSourcePropTreeSelection_SingleNode,
} from '../../DataSource';
import { NodePath } from '../../DataSource/TreeExpandState';

type TreeDataSourceOnlyProps<T> = {
  nodesKey?: string;
  isNodeExpanded?: DataSourcePropIsNodeExpanded<T>;
  onNodeExpand?: (node: NodePath) => void;
  onNodeCollapse?: (node: NodePath) => void;
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
  | 'treeSelection'
  | 'rowSelection'
  | 'defaultRowSelection'
>;

export type TreeDataSourceProps<T> = Omit<
  DataSourceProps<T>,
  DataSourcePropsNotAvailableInTreeDataSource
> &
  TreeDataSourceOnlyProps<T>;
