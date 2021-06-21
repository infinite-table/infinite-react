import {
  InfiniteTableProps,
  InfiniteTableState,
  InfiniteTableComputedValues,
} from '../types';

import { DataSourceContextValue } from '../../DataSource/types';
import { useComputedVisibleColumns } from './useComputedVisibleColumns';
// TODO continue here replace this with current impl - makes some tests crash
import useProperty from '../../hooks/usePropertyOld';
import { TableActions } from '../state/getReducerActions';
import { sortAscending } from '../../../utils/sortAscending';

// const sum = (a: number, b: number) => a + b;

export function useComputed<T>(
  props: InfiniteTableProps<T>,
  state: InfiniteTableState<T>,
  dataSourceContextValue: DataSourceContextValue<T>,
  actions: TableActions<T>,
): InfiniteTableComputedValues<T> {
  const { bodySize } = state;

  const [columnOrder, setColumnOrder] = useProperty('columnOrder', props, {
    fromState: () => state.columnOrder,
    setState: (columnOrder) => actions.setColumnOrder(columnOrder),
  });

  const [columnVisibility, setColumnVisibility] = useProperty(
    'columnVisibility',
    props,
    {
      fromState: () => state.columnVisibility,
      setState: (columnVisibility) =>
        actions.setColumnVisibility(columnVisibility),
    },
  );
  const [columnPinning, setColumnPinning] = useProperty(
    'columnPinning',
    props,
    {
      fromState: () => state.columnPinning,
      setState: (columnPinning) => actions.setColumnPinning(columnPinning),
    },
  );

  // const getProps = useLatest(props);

  // useEffect(() => {
  //   const props = getProps();

  //   if (
  //     !props.columnVisibilityAssumeVisible &&
  //     !isControlled('columnVisibility', props)
  //   ) {
  //     console.error(
  //       `"columnVisibilityAssumeVisible"=false should not be used with uncontrolled "columnVisibility" as it is not supported`,
  //     );
  //   }
  // }, [props.columnVisibilityAssumeVisible]);

  const {
    computedColumnOrder,
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
    computedRemainingSpace,
  } = useComputedVisibleColumns({
    columns: props.columns,
    columnMinWidth: props.columnMinWidth,
    columnMaxWidth: props.columnMaxWidth,
    columnDefaultWidth: props.columnDefaultWidth,
    bodySize,

    sortable: props.sortable,
    draggableColumns: props.draggableColumns,
    sortInfo: dataSourceContextValue.computed.sortInfo,
    setSortInfo: dataSourceContextValue.actions.setSortInfo,

    columnOrder,

    columnVisibility,
    columnVisibilityAssumeVisible: true, //props.columnVisibilityAssumeVisible,

    columnPinning,
  });

  const unpinnedColumnWidths = computedUnpinnedColumns.map(
    (c) => c.computedWidth,
  );

  // // const columnVirtualBrain = React.useMemo(() => {
  // const brain = new VirtualBrain({
  //   count: columnWidths.length,
  //   itemMainAxisSize: (itemIndex: number) => columnWidths[itemIndex],
  //   mainAxis: 'horizontal',
  // });
  // // }, columnSizes);

  let sortedUnpinnedColumnWidths: number[] = [...unpinnedColumnWidths].sort(
    sortAscending,
  );

  let unpinnedColumnRenderCount = 0;
  let colWidthSum = 0;

  const unpinnedViewportSize =
    bodySize.width -
    computedPinnedEndColumnsWidth -
    computedPinnedStartColumnsWidth;
  while (unpinnedViewportSize > 0 && colWidthSum <= unpinnedViewportSize) {
    colWidthSum += sortedUnpinnedColumnWidths[unpinnedColumnRenderCount];
    unpinnedColumnRenderCount++;
  }
  if (unpinnedViewportSize > 0) {
    unpinnedColumnRenderCount++;
  }
  unpinnedColumnRenderCount = Math.min(
    unpinnedColumnRenderCount,
    computedUnpinnedColumns.length,
  );

  let columnRenderStartIndex = 0;

  const scrollLeft = state.scrollPosition.scrollLeft;

  colWidthSum = 0;
  while (colWidthSum < scrollLeft) {
    colWidthSum += unpinnedColumnWidths[columnRenderStartIndex];
    columnRenderStartIndex++;
  }
  if (colWidthSum > scrollLeft) {
    columnRenderStartIndex--;
  }

  return {
    ...props,
    setColumnOrder,
    setColumnVisibility,
    setColumnPinning,
    showZebraRows: !!props.showZebraRows,
    computedVisibleColumns,
    computedColumnOrder,
    computedRemainingSpace,
    computedVisibleColumnsMap,
    computedColumnVisibility: columnVisibility,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
    unpinnedColumnRenderCount,
    columnRenderStartIndex,
  };
}
