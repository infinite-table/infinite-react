import { TableActionType } from '../types/TableActionType';
import type { TableAction } from '../types/TableAction';
import type { Setter } from '../../types/Setter';
import type { ScrollPosition } from '../../types/ScrollPosition';
import type { Size } from '../../types/Size';
import type {
  TablePropColumnOrder,
  TablePropColumnPinning,
  TablePropColumnVisibility,
} from '../types/TableProps';

export interface TableActions<T> {
  // setViewportSize: Setter<Size>;
  setBodySize: Setter<Size>;
  setScrollPosition: Setter<ScrollPosition>;
  setColumnOrder: Setter<TablePropColumnOrder>;
  setColumnVisibility: Setter<TablePropColumnVisibility>;
  setColumnPinning: Setter<TablePropColumnPinning>;
  setColumnShifts: Setter<number[] | null>;
  setDraggingColumnId: Setter<string | null>;
  x?: T;
}

export const getReducerActions = <T>(
  dispatch: React.Dispatch<TableAction>,
): TableActions<T> => {
  // const setViewportSize: Setter<Size> = (size) => {
  //   dispatch({
  //     type: TableActionType.SET_VIEWPORT_SIZE,
  //     payload: size,
  //   });
  // };
  const setBodySize: Setter<Size> = (size) => {
    dispatch({
      type: TableActionType.SET_BODY_SIZE,
      payload: size,
    });
  };

  const setScrollPosition: Setter<ScrollPosition> = (scrollPosition) => {
    dispatch({
      type: TableActionType.SET_SCROLL_POSITION,
      payload: scrollPosition,
    });
  };

  const setColumnOrder: Setter<TablePropColumnOrder> = (columnOrder) => {
    dispatch({
      type: TableActionType.SET_COLUMN_ORDER,
      payload: columnOrder,
    });
  };
  const setColumnVisibility: Setter<TablePropColumnVisibility> = (
    columnVisibility,
  ) => {
    dispatch({
      type: TableActionType.SET_COLUMN_VISIBILITY,
      payload: columnVisibility,
    });
  };

  const setColumnShifts: Setter<number[] | null> = (columnShifts) => {
    dispatch({
      type: TableActionType.SET_COLUMN_SHIFTS,
      payload: columnShifts,
    });
  };
  const setDraggingColumnId: Setter<string | null> = (dragColumnId) => {
    dispatch({
      type: TableActionType.SET_DRAGGING_COLUMN_ID,
      payload: dragColumnId,
    });
  };

  const setColumnPinning: Setter<TablePropColumnPinning> = (columnPinning) => {
    dispatch({
      type: TableActionType.SET_COLUMN_PINNING,
      payload: columnPinning,
    });
  };

  return {
    // setViewportSize,
    setBodySize,
    setScrollPosition,
    setColumnOrder,
    setColumnVisibility,
    setColumnShifts,
    setColumnPinning,
    setDraggingColumnId,
  };
};
