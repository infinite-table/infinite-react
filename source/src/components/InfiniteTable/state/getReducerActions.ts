import { InfiniteTableActionType } from '../types/InfiniteTableActionType';
import type { InfiniteTableAction } from '../types/InfiniteTableAction';
import type { Setter } from '../../types/Setter';
import type { ScrollPosition } from '../../types/ScrollPosition';
import type { Size } from '../../types/Size';
import type {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
} from '../types/InfiniteTableProps';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';

export interface InfiniteTableInternalActions<T> {
  onRowHeightChange: SubscriptionCallback<number>;
  x?: T;
}
export interface InfiniteTableActions<T> {
  // setViewportSize: Setter<Size>;
  // setBodySize: Setter<Size>;
  // setScrollPosition: Setter<ScrollPosition>;
  // setColumnOrder: Setter<InfiniteTablePropColumnOrder>;
  // setColumnVisibility: Setter<InfiniteTablePropColumnVisibility>;
  // setColumnPinning: Setter<InfiniteTablePropColumnPinning>;
  // setColumnAggregations: Setter<InfiniteTablePropColumnAggregations<T>>;
  // setColumnShifts: Setter<number[] | null>;
  setDraggingColumnId: Setter<string | null>;
  x?: T;
}

export const getReducerActions = <T>(
  dispatch: React.Dispatch<InfiniteTableAction>,
): InfiniteTableActions<T> => {
  // const setBodySize: Setter<Size> = (size) => {
  //   dispatch({
  //     type: InfiniteTableActionType.SET_BODY_SIZE,
  //     payload: size,
  //   });
  // };

  // const setScrollPosition: Setter<ScrollPosition> = (scrollPosition) => {
  //   dispatch({
  //     type: InfiniteTableActionType.SET_SCROLL_POSITION,
  //     payload: scrollPosition,
  //   });
  // };

  // const setColumnOrder: Setter<InfiniteTablePropColumnOrder> = (
  //   columnOrder,
  // ) => {
  //   dispatch({
  //     type: InfiniteTableActionType.SET_COLUMN_ORDER,
  //     payload: columnOrder,
  //   });
  // };
  // const setColumnVisibility: Setter<InfiniteTablePropColumnVisibility> = (
  //   columnVisibility,
  // ) => {
  //   dispatch({
  //     type: InfiniteTableActionType.SET_COLUMN_VISIBILITY,
  //     payload: columnVisibility,
  //   });
  // };

  // const setColumnShifts: Setter<number[] | null> = (columnShifts) => {
  //   dispatch({
  //     type: InfiniteTableActionType.SET_COLUMN_SHIFTS,
  //     payload: columnShifts,
  //   });
  // };
  const setDraggingColumnId: Setter<string | null> = (dragColumnId) => {
    dispatch({
      type: InfiniteTableActionType.SET_DRAGGING_COLUMN_ID,
      payload: dragColumnId,
    });
  };

  // const setColumnPinning: Setter<InfiniteTablePropColumnPinning> = (
  //   columnPinning,
  // ) => {
  //   dispatch({
  //     type: InfiniteTableActionType.SET_COLUMN_PINNING,
  //     payload: columnPinning,
  //   });
  // };

  // const setColumnAggregations: Setter<InfiniteTablePropColumnAggregations<T>> =
  //   (columnAggregations) => {
  //     dispatch({
  //       type: InfiniteTableActionType.SET_COLUMN_AGGREGATIONS,
  //       payload: columnAggregations,
  //     });
  //   };

  return {
    // // setViewportSize,
    // setBodySize,
    // setScrollPosition,
    // setColumnOrder,
    // setColumnVisibility,
    // setColumnShifts,
    // setColumnPinning,
    // setColumnAggregations,
    setDraggingColumnId,
  };
};
