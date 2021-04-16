import { useEffect, useMemo, useRef } from 'react';

import type { MutableRefObject, Ref } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useLatest } from '../../hooks/useLatest';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';

import { useUnpinnedRendering } from './useUnpinnedRendering';
import { TableActions } from '../state/getReducerActions';

import type {
  TableComputedValues,
  TableImperativeApi,
  TablePropColumnOrder,
  TablePropColumnVisibility,
  TableProps,
} from '../types';
import type { Size } from '../../types/Size';

import { useOnContainerScroll } from './useOnContainerScroll';
import {
  usePinnedEndRendering,
  usePinnedStartRendering,
} from './usePinnedRendering';
import { useYourBrain } from './useYourBrain';
import { useRerender } from '../../hooks/useRerender';

type ListRenderingParam<T> = {
  computed: TableComputedValues<T>;
  domRef: Ref<HTMLElement>;

  bodySize: Size;
  columnShifts: number[] | null;
  getProps: () => TableProps<T>;
  getActions: () => TableActions<T>;
};

export function useListRendering<T>(param: ListRenderingParam<T>) {
  const {
    computed,
    domRef,
    bodySize,
    columnShifts,
    getActions,
    getProps,
  } = param;

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumns,
    computedUnpinnedColumnsWidth,
  } = computed;

  const {
    computed: { dataArray },
    state: dataSourceState,
  } = useDataSourceContextValue<T>();

  const getData = useLatest(dataArray);
  const { rowHeight } = getProps();
  const repaintIdRef = useRef<number>(0);
  const repaintId = repaintIdRef.current++;

  const { horizontalVirtualBrain, verticalVirtualBrain } = useYourBrain({
    computedUnpinnedColumns: computed.computedUnpinnedColumns,
    computedPinnedStartColumnsWidth: computed.computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth: computed.computedPinnedEndColumnsWidth,
    rowHeight,
    dataArray,
    bodySize,
  });

  const hasHorizontalScrollbar =
    computedUnpinnedColumnsWidth >
    bodySize.width -
      computedPinnedStartColumnsWidth -
      computedPinnedEndColumnsWidth;

  const reservedContentHeight =
    verticalVirtualBrain.getTotalSize() +
    (hasHorizontalScrollbar ? getScrollbarWidth() : 0);

  const hasVerticalScrollbar = bodySize.height < reservedContentHeight;

  const scrollbars = useMemo(
    () => ({
      vertical: hasVerticalScrollbar,
      horizontal: hasHorizontalScrollbar,
    }),
    [hasVerticalScrollbar, hasHorizontalScrollbar],
  );

  useEffect(() => {
    if (!bodySize.height) {
      return;
    }

    const props = getProps();

    if (props.onReady) {
      const imperativeApi: TableImperativeApi<T> = {
        setColumnOrder: (columnOrder: TablePropColumnOrder) =>
          getActions().setColumnOrder(columnOrder),
        setColumnVisibility: (columnVisibility: TablePropColumnVisibility) =>
          getActions().setColumnVisibility(columnVisibility),
      };

      props.onReady(imperativeApi);
    }
  }, [!!bodySize.height]);

  const { applyScrollHorizontal, applyScrollVertical } = useOnContainerScroll({
    verticalVirtualBrain,
    horizontalVirtualBrain,
    domRef: domRef as MutableRefObject<HTMLDivElement | null>,
  });

  const pinnedRenderingParams = {
    bodySize,
    scrollbars,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    getData,
    getProps,
    repaintId,
    rowHeight,
    verticalVirtualBrain,
  };

  const centerRenderingParams = {
    ...pinnedRenderingParams,
    columnShifts,
    applyScrollHorizontal,
    horizontalVirtualBrain,
    computedUnpinnedColumnsWidth,
    computedUnpinnedColumns,
  };

  const [, rerender] = useRerender();
  useEffect(() => {
    rerender();
  }, [dataSourceState]);

  const {
    pinnedStartList,
    pinnedStartScrollbarPlaceholder,
  } = usePinnedStartRendering<T>(pinnedRenderingParams);

  const {
    pinnedEndList,
    pinnedEndScrollbarPlaceholder,
  } = usePinnedEndRendering<T>(pinnedRenderingParams);

  const centerList = useUnpinnedRendering(centerRenderingParams);

  return {
    scrollbars,

    horizontalVirtualBrain,
    verticalVirtualBrain,
    applyScrollHorizontal,
    applyScrollVertical,
    pinnedStartList,
    pinnedEndList,
    pinnedStartScrollbarPlaceholder,
    pinnedEndScrollbarPlaceholder,
    centerList,
    repaintId,
    reservedContentHeight,
  };
}
