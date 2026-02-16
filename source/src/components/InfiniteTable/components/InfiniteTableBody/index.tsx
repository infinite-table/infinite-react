import * as React from 'react';
import { HeadlessTable } from '../../../HeadlessTable';
import { useCellRendering } from '../../hooks/useCellRendering';
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
import {
  useInfiniteTableStableContext,
  useInfiniteTableSelector,
} from '../../hooks/useInfiniteTableSelector';
import { useDataSourceSelector } from '../../../DataSource';
import { useMasterRowInfo } from '../../../DataSource/publicHooks/useDataSourceMasterDetailSelector';

const _HOVERED_CLASS_NAMES = [
  RowHoverCls,
  `${InfiniteTableColumnCellClassName}--hovered`,
];

function toClassNameArray(str: string | string[]) {
  if (Array.isArray(str)) {
    str = str.join(' ');
  }

  return str
    .split(' ')
    .map((s) => s.trim())
    .filter(Boolean);
}

function InfiniteTableBody<T>(props: InfiniteTableBodyProps<T>) {
  const context = useInfiniteTableStableContext<T>();

  const masterRowInfo = useMasterRowInfo();
  const { getComputed, api } = context;
  const {
    renderer,
    onRenderUpdater,
    debugId,
    keyboardNavigation,
    activeRowIndex,
    loadingText,
    columnReorderDragColumnId,
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
    forceBodyRerenderTimestamp,
    rowHoverClassName,
    ready,
  } = useInfiniteTableSelector((ctx) => {
    return {
      ready: ctx.state.ready,
      columnReorderDragColumnId: ctx.state.columnReorderDragColumnId,
      forceBodyRerenderTimestamp: ctx.state.forceBodyRerenderTimestamp,
      renderer: ctx.state.renderer,
      onRenderUpdater: ctx.state.onRenderUpdater,
      debugId: ctx.state.debugId,
      keyboardNavigation: ctx.state.keyboardNavigation,
      activeRowIndex: ctx.state.activeRowIndex,
      loadingText: ctx.state.loadingText,
      scrollStopDelay: ctx.state.scrollStopDelay,
      brain: ctx.state.brain,
      scrollerDOMRef: ctx.state.scrollerDOMRef,
      components: ctx.state.components,
      bodySize: ctx.state.bodySize,
      activeCellIndex: ctx.state.activeCellIndex,
      rowDetailRenderer: ctx.state.rowDetailRenderer,
      showHoverRows: ctx.state.showHoverRows,
      wrapRowsHorizontally: ctx.state.wrapRowsHorizontally,
      domProps: ctx.state.domProps,
      domRef: ctx.state.domRef,
      rowHoverClassName: ctx.state.rowHoverClassName,
    };
  });

  const LoadMaskCmp = components?.LoadMask ?? LoadMask;

  const computed = getComputed();
  const { computedRowHeight, computedRowSizeCacheForDetails } = computed;

  const activeCellRowHeight =
    computedRowSizeCacheForDetails?.getRowHeight || computedRowHeight;

  const { loading } = useDataSourceSelector((ctx) => {
    return {
      loading: ctx.dataSourceState.loading,
    };
  });

  const onContextMenu = React.useCallback((event: React.MouseEvent) => {
    const state = context.getState();
    const target = event.target as HTMLElement;

    if (!masterRowInfo && (event as any)._from_row_detail) {
      // originating from detail grid.
      return;
    }

    if (masterRowInfo) {
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

    let result: string[] = [];

    if (rowHoverClassName) {
      result = result.concat(rowHoverClassName);
    }

    if (props.rowHoverClassName) {
      result = result.concat(props.rowHoverClassName);
    }

    if (InfiniteTableBody.rowHoverClassName) {
      result = result.concat(InfiniteTableBody.rowHoverClassName);
    }

    return toClassNameArray(result);
  }, [
    showHoverRows,
    rowHoverClassName,
    props.rowHoverClassName,
    InfiniteTableBody.rowHoverClassName,
  ]);

  return (
    <InfiniteTableBodyContainer onContextMenu={onContextMenu}>
      <HeadlessTable
        forceRerenderTimestamp={forceBodyRerenderTimestamp}
        debugId={debugId}
        tabIndex={tabIndex ?? 0}
        autoFocus={autoFocus ?? undefined}
        activeRowIndex={
          ready && keyboardNavigation === 'row' ? activeRowIndex : null
        }
        activeCellIndex={
          ready &&
          keyboardNavigation === 'cell' &&
          // we want to hide the active cell indicator while column reodering is happening
          !columnReorderDragColumnId
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

InfiniteTableBody.rowHoverClassName = _HOVERED_CLASS_NAMES;

export { InfiniteTableBody };
