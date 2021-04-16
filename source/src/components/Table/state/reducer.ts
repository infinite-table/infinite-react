import type {
  TableReducer,
  TableScopedReducer,
  TableState,
  TableAction,
} from '../types';

import type { ScrollPosition } from '../../types/ScrollPosition';

import { TableActionType } from '../types/TableActionType';
import type {
  TablePropColumnOrder,
  TablePropColumnPinning,
  TablePropColumnVisibility,
} from '../types/TableProps';
import { Size } from '../../types/Size';

function setColumnSize<T>(state: TableState<T>): TableState<T> {
  return state;
}

// function setViewportSize(_state: Size, action: TableAction): Size {
//   return action.payload;
// }
function setBodySize(_state: Size, action: TableAction): Size {
  return action.payload;
}
function setScrollPosition(
  _state: ScrollPosition,
  action: TableAction,
): ScrollPosition {
  return action.payload;
}
function setColumnOrder(
  _state: TablePropColumnOrder,
  action: TableAction,
): TablePropColumnOrder {
  return action.payload;
}

function setColumnVisibility(
  _state: TablePropColumnVisibility,
  action: TableAction,
): TablePropColumnVisibility {
  return action.payload;
}

function setColumnPinning(
  _state: TablePropColumnPinning,
  action: TableAction,
): TablePropColumnPinning {
  return action.payload;
}

function setColumnShifts(
  _state: number[] | null,
  action: TableAction,
): number[] | null {
  return action.payload;
}
function setDraggingColumnId(
  _state: string | null,
  action: TableAction,
): string | null {
  return action.payload;
}

// see comments below
function scope<T, S>(
  scoper: {
    get: (state: TableState<T>) => S;
    set: (s: S) => Partial<TableState<T>>;
  },
  scopedReducer: TableScopedReducer<S>,
) {
  return (state: TableState<T>, action: TableAction): TableState<T> => {
    let scopedState: S = scoper.get(state);

    if (action.payload instanceof Function) {
      action.payload = action.payload(scopedState);
    }

    const newScopedState = scopedReducer(scopedState, action);

    return {
      ...state,
      ...scoper.set(newScopedState),
    };
  };
}

/**
 * This is a map with all the reducers
 *
 * Action types are the keys while reducer functions are the values
 *
 * NOTE: you can use the `scope` fn to reduce the "scope" of the reducer fn
 * - kind of similar to what combineReducers does in Redux - meaning the scoped reducer
 * will only be called with part of the state. We need getter/setter to get the correct "slice" from state
 * and to put the new value back.
 * scoped reducers are also good because the action payload can be a function - in which
 * case, they call the function with the prev state for that scoped and set the result on action.payload
 * before actually calling the scoped reducer fn - so the scoped reducer fn only needs to handle the non-function action.payload case
 */
const reducersForActions = {
  [TableActionType.SET_COLUMN_SIZE]: setColumnSize,
  // [TableActionType.SET_SCROLL_POSITION]: setScrollPosition,

  // [TableActionType.SET_VIEWPORT_SIZE]: scope<any, Size>(
  //   {
  //     get: (state) => state.viewportSize,
  //     set: (viewportSize) => ({ viewportSize }),
  //   },
  //   setViewportSize,
  // ),
  [TableActionType.SET_BODY_SIZE]: scope<any, Size>(
    {
      get: (state) => state.bodySize,
      set: (bodySize) => ({ bodySize }),
    },
    setBodySize,
  ),
  [TableActionType.SET_SCROLL_POSITION]: scope<any, ScrollPosition>(
    {
      get: (state) => state.scrollPosition,
      set: (scrollPosition) => ({ scrollPosition }),
    },
    setScrollPosition,
  ),
  [TableActionType.SET_COLUMN_ORDER]: scope<any, TablePropColumnOrder>(
    {
      get: (state) => state.columnOrder,
      set: (columnOrder) => ({ columnOrder }),
    },
    setColumnOrder,
  ),
  [TableActionType.SET_COLUMN_VISIBILITY]: scope<
    any,
    TablePropColumnVisibility
  >(
    {
      get: (state) => state.columnVisibility,
      set: (columnVisibility) => ({ columnVisibility }),
    },
    setColumnVisibility,
  ),
  [TableActionType.SET_COLUMN_PINNING]: scope<any, TablePropColumnPinning>(
    {
      get: (state) => state.columnPinning,
      set: (columnPinning) => ({ columnPinning }),
    },
    setColumnPinning,
  ),
  [TableActionType.SET_COLUMN_SHIFTS]: scope<any, number[] | null>(
    {
      get: (state) => state.columnShifts,
      set: (columnShifts) => ({ columnShifts }),
    },
    setColumnShifts,
  ),
  [TableActionType.SET_DRAGGING_COLUMN_ID]: scope<any, string | null>(
    {
      get: (state) => state.draggingColumnId,
      set: (draggingColumnId) => ({ draggingColumnId }),
    },
    setDraggingColumnId,
  ),
} as Record<TableActionType, TableReducer<any>>;

export const reducer = <T, S extends TableState<T>, A extends TableAction>(
  state: S,
  action: A,
) => {
  const reducerFn = (reducersForActions as Record<
    TableActionType,
    TableReducer<T>
  >)[action.type];

  if (reducerFn) {
    return reducerFn(state, action);
  }

  return state;
};
