import { useCallback, useEffect, useRef } from 'react';

import type { Ref } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useLatest } from '../../hooks/useLatest';

import type {
  InfiniteTableComputedValues,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
} from '../types';
import type { Size } from '../../types/Size';

import { useYourBrain } from './useYourBrain';
import { useRerender } from '../../hooks/useRerender';
import { usePrevious } from '../../hooks/usePrevious';

type CellRenderingParam<T> = {
  computed: InfiniteTableComputedValues<T>;
  domRef: Ref<HTMLElement>;

  bodySize: Size;
  columnShifts: number[] | null;
  getComputed: () => InfiniteTableComputedValues<T> | undefined;
};

import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { useInfiniteTable } from './useInfiniteTable';
import {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../HeadlessTable/ReactHeadlessTableRenderer';
import { InfiniteTableColumnCellProps } from '../components/InfiniteTableRow/InfiniteTableCellTypes';
import React from 'react';
import { InfiniteTableColumnCell } from '../components/InfiniteTableRow/InfiniteTableColumnCell';

type CellRenderingResult = {
  // pinnedStartList: JSX.Element | null;
  // pinnedEndList: JSX.Element | null;
  // pinnedStartScrollbarPlaceholder: JSX.Element | null;
  // pinnedEndScrollbarPlaceholder: JSX.Element | null;
  // centerList: JSX.Element | null;
  repaintId: number;
  renderCell: TableRenderCellFn;
};

export function useCellRendering<T>(
  param: CellRenderingParam<T>,
): CellRenderingResult {
  const { computed, bodySize } = param;

  const { componentActions, componentState, getState } = useInfiniteTable<T>();

  const prevComputed = usePrevious(computed, null);

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    rowspan,
    toggleGroupRow,
    columnSize,
  } = computed;

  const { componentState: dataSourceState, getState: getDataSourceState } =
    useDataSourceContextValue<T>();

  const { dataArray } = dataSourceState;

  const getData = useLatest(dataArray);
  const { rowHeight, groupRenderStrategy, brain, showZebraRows } =
    componentState;
  const prevDataSourceTimestamp = usePrevious(dataSourceState.updatedAt);
  const repaintIdRef = useRef<number>(0);

  if (
    prevDataSourceTimestamp !== dataSourceState.updatedAt ||
    !shallowEqualObjects(prevComputed, computed)
  ) {
    repaintIdRef.current++;
  }
  const repaintId = repaintIdRef.current;

  useYourBrain({
    columnSize,
    brain,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    rowHeight,
    dataArray,
    bodySize,
    rowspan,
  });

  useEffect(() => {
    if (!bodySize.height) {
      return;
    }

    const { onReady } = getState();

    componentActions.ready = true;

    if (onReady) {
      const imperativeApi: InfiniteTableImperativeApi<T> = {
        setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => {
          componentActions.columnOrder = columnOrder;
        },
        setColumnVisibility: (
          columnVisibility: InfiniteTablePropColumnVisibility,
        ) => {
          componentActions.columnVisibility = columnVisibility;
        },
        getState,
        getDataSourceState,
      };

      onReady(imperativeApi);
    }
  }, [!!bodySize.height]);

  const [, rerender] = useRerender();

  useEffect(() => {
    rerender(); // TODO check this is still needed
  }, [dataSourceState]);

  const renderCell: TableRenderCellFn = useCallback(
    (params: TableRenderCellFnParam) => {
      const {
        rowIndex,
        colIndex,
        heightWithRowspan,
        domRef,
        hidden,
        width,
        onMouseLeave,
        onMouseEnter,
      } = params;

      const dataArray = getData();
      const rowInfo = dataArray[rowIndex];
      const column = computedVisibleColumns[colIndex];

      const cellProps: InfiniteTableColumnCellProps<T> = {
        getData,
        virtualized: true,
        showZebraRows,
        groupRenderStrategy,
        rowIndex,
        rowInfo,
        hidden,
        toggleGroupRow,
        rowHeight: heightWithRowspan,
        onMouseEnter,
        onMouseLeave,
        domRef,
        width,
        column,
      };

      return <InfiniteTableColumnCell<T> {...cellProps} />;
    },
    [
      rowHeight,
      getData,
      computedVisibleColumns,
      groupRenderStrategy,
      toggleGroupRow,
      showZebraRows,
      repaintId,
    ],
  );

  return {
    renderCell,
    repaintId,
  };
}
