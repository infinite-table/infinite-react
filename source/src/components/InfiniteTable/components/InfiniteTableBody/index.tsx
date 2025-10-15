import * as React from 'react';
import {
  useDataSourceContextValue,
  useMasterDetailContext,
} from '../../../DataSource/publicHooks/useDataSourceState';
import { HeadlessTable } from '../../../HeadlessTable';
import { useCellRendering } from '../../hooks/useCellRendering';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { useToggleWrapRowsHorizontally } from '../../hooks/useToggleWrapRowsHorizontally';
import {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../../types/InfiniteTableState';
import { InfiniteTableColumnCellClassName } from '../InfiniteTableRow/InfiniteTableColumnCellClassNames';
import { RowHoverCls } from '../InfiniteTableRow/row.css';
import { InfiniteTableBodyContainer } from './InfiniteTableBodyContainer';
import { InfiniteTableBodyProps } from './InfiniteTableBodyProps';
import { selectParentUntil } from '../../../../utils/selectParent';
import { getCellSelector } from '../../state/getInitialState';
import { LoadMask } from '../LoadMask';
import { useMemo } from 'react';

const _HOVERED_CLASS_NAMES = [
  RowHoverCls,
  `${InfiniteTableColumnCellClassName}--hovered`,
];

function InfiniteTableBody<T>(props: InfiniteTableBodyProps<T>) {
  const context = useInfiniteTable<T>();

  const masterContext = useMasterDetailContext();
  const { state: componentState, getComputed, api } = context;
  const {
    renderer,
    onRenderUpdater,
    debugId,
    keyboardNavigation,
    activeRowIndex,
    loadingText,
    scrollStopDelay,
    brain,
    scrollerDOMRef,
    components,
    bodySize,
    activeCellIndex,
    rowDetailRenderer,
    showHoverRows,
    wrapRowsHorizontally,
    domProps,
    domRef,
  } = componentState;

  const LoadMaskCmp = components?.LoadMask ?? LoadMask;

  const computed = getComputed();
  const { computedRowHeight, computedRowSizeCacheForDetails } = computed;

  const activeCellRowHeight =
    computedRowSizeCacheForDetails?.getRowHeight || computedRowHeight;

  const {
    componentState: { loading },
  } = useDataSourceContextValue<T>();

  const onContextMenu = React.useCallback((event: React.MouseEvent) => {
    const state = context.getState();
    const target = event.target as HTMLElement;

    if (!masterContext && (event as any)._from_row_detail) {
      // originating from detail grid.
      return;
    }

    if (masterContext) {
      (event as any)._from_row_detail = true;
    }

    const cell = selectParentUntil(
      target,
      getCellSelector(),
      state.domRef.current,
    );

    let columnId: string | undefined;
    let colIndex: number | undefined;
    let rowId: string | undefined;
    let rowIndex: number | undefined;

    if (cell) {
      colIndex = Number(cell.dataset.colIndex);
      rowIndex = Number(cell.dataset.rowIndex);

      columnId = context.getComputed().computedVisibleColumns[colIndex].id;
      rowId = context.dataSourceApi.getRowInfoArray()[rowIndex].id;
    }

    const param: ContextMenuLocationWithEvent = {
      columnId,
      colIndex,
      rowId,
      rowIndex,
      event,
      target: cell ?? (event.target as HTMLElement),
    };

    if (cell) {
      state.cellContextMenu(param as CellContextMenuLocationWithEvent);
    }
    state.contextMenu(param);
  }, []);

  const { renderCell, renderDetailRow } = useCellRendering({
    imperativeApi: api,
    getComputed,
    domRef,

    bodySize,
    computed,
  });

  const { autoFocus, tabIndex } = domProps ?? {};

  useToggleWrapRowsHorizontally();

  const hoverClassNames = useMemo(() => {
    if (!showHoverRows) {
      return undefined;
    }

    if (props.rowHoverClassName) {
      return Array.isArray(props.rowHoverClassName)
        ? [...InfiniteTableBody.rowHoverClassNames, ...props.rowHoverClassName]
        : [...InfiniteTableBody.rowHoverClassNames, props.rowHoverClassName];
    }

    return InfiniteTableBody.rowHoverClassNames;
  }, [
    showHoverRows,
    props.rowHoverClassName,
    InfiniteTableBody.rowHoverClassNames,
  ]);

  return (
    <InfiniteTableBodyContainer onContextMenu={onContextMenu}>
      <HeadlessTable
        forceRerenderTimestamp={componentState.forceBodyRerenderTimestamp}
        debugId={debugId}
        tabIndex={tabIndex ?? 0}
        autoFocus={autoFocus ?? undefined}
        activeRowIndex={
          componentState.ready && keyboardNavigation === 'row'
            ? activeRowIndex
            : null
        }
        activeCellIndex={
          componentState.ready &&
          keyboardNavigation === 'cell' &&
          // we want to hide the active cell indicator while column reodering is happening
          !componentState.columnReorderDragColumnId
            ? activeCellIndex
            : null
        }
        scrollStopDelay={scrollStopDelay}
        renderer={renderer}
        wrapRowsHorizontally={wrapRowsHorizontally}
        onRenderUpdater={onRenderUpdater}
        brain={brain}
        activeCellRowHeight={activeCellRowHeight}
        renderCell={renderCell}
        renderDetailRow={rowDetailRenderer ? renderDetailRow : undefined}
        cellHoverClassNames={hoverClassNames}
        scrollerDOMRef={scrollerDOMRef}
        scrollVarHostRef={domRef}
      ></HeadlessTable>

      <LoadMaskCmp visible={loading}>{loadingText}</LoadMaskCmp>
    </InfiniteTableBodyContainer>
  );
}

InfiniteTableBody.rowHoverClassNames = _HOVERED_CLASS_NAMES;

export { InfiniteTableBody };
