import type {
  InfiniteTableReducer,
  TableScopedReducer,
  InfiniteTableState,
  InfiniteTableAction,
} from '../types';

import type { ScrollPosition } from '../../types/ScrollPosition';

import { InfiniteTableActionType } from '../types/InfiniteTableActionType';
import type {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
} from '../types/InfiniteTableProps';
import { Size } from '../../types/Size';

function setColumnSize<T>(state: InfiniteTableState<T>): InfiniteTableState<T> {
  return state;
}

// function setViewportSize(_state: Size, action: TableAction): Size {
//   return action.payload;
// }
function setBodySize(_state: Size, action: InfiniteTableAction): Size {
  return action.payload;
}
function setScrollPosition(
  _state: ScrollPosition,
  action: InfiniteTableAction,
): ScrollPosition {
  return action.payload;
}
function setColumnOrder(
  _state: InfiniteTablePropColumnOrder,
  action: InfiniteTableAction,
): InfiniteTablePropColumnOrder {
  return action.payload;
}

function setColumnVisibility(
  _state: InfiniteTablePropColumnVisibility,
  action: InfiniteTableAction,
): InfiniteTablePropColumnVisibility {
  return action.payload;
}

function setColumnPinning(
  _state: InfiniteTablePropColumnPinning,
  action: InfiniteTableAction,
): InfiniteTablePropColumnPinning {
  return action.payload;
}
function setColumnAggregations<T>(
  _state: InfiniteTablePropColumnAggregations<T>,
  action: InfiniteTableAction,
): InfiniteTablePropColumnAggregations<T> {
  return action.payload;
}

function setColumnShifts(
  _state: number[] | null,
  action: InfiniteTableAction,
): number[] | null {
  return action.payload;
}
function setDraggingColumnId(
  _state: string | null,
  action: InfiniteTableAction,
): string | null {
  return action.payload;
}

// see comments below
function scope<T, S>(
  scoper: {
    get: (state: InfiniteTableState<T>) => S;
    set: (s: S) => Partial<InfiniteTableState<T>>;
  },
  scopedReducer: TableScopedReducer<S>,
) {
  return (
    state: InfiniteTableState<T>,
    action: InfiniteTableAction,
  ): InfiniteTableState<T> => {
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
  [InfiniteTableActionType.SET_COLUMN_SIZE]: setColumnSize,
  // [TableActionType.SET_SCROLL_POSITION]: setScrollPosition,

  // [TableActionType.SET_VIEWPORT_SIZE]: scope<any, Size>(
  //   {
  //     get: (state) => state.viewportSize,
  //     set: (viewportSize) => ({ viewportSize }),
  //   },
  //   setViewportSize,
  // ),
  [InfiniteTableActionType.SET_BODY_SIZE]: scope<any, Size>(
    {
      get: (state) => state.bodySize,
      set: (bodySize) => ({ bodySize }),
    },
    setBodySize,
  ),
  [InfiniteTableActionType.SET_SCROLL_POSITION]: scope<any, ScrollPosition>(
    {
      get: (state) => state.scrollPosition,
      set: (scrollPosition) => ({ scrollPosition }),
    },
    setScrollPosition,
  ),
  [InfiniteTableActionType.SET_COLUMN_ORDER]: scope<
    any,
    InfiniteTablePropColumnOrder
  >(
    {
      get: (state) => state.columnOrder,
      set: (columnOrder) => ({ columnOrder }),
    },
    setColumnOrder,
  ),
  [InfiniteTableActionType.SET_COLUMN_VISIBILITY]: scope<
    any,
    InfiniteTablePropColumnVisibility
  >(
    {
      get: (state) => state.columnVisibility,
      set: (columnVisibility) => ({ columnVisibility }),
    },
    setColumnVisibility,
  ),
  [InfiniteTableActionType.SET_COLUMN_PINNING]: scope<
    any,
    InfiniteTablePropColumnPinning
  >(
    {
      get: (state) => state.columnPinning,
      set: (columnPinning) => ({ columnPinning }),
    },
    setColumnPinning,
  ),

  [InfiniteTableActionType.SET_COLUMN_AGGREGATIONS]: scope<
    any,
    InfiniteTablePropColumnAggregations<any>
  >(
    {
      get: (state) => state.columnAggregations,
      set: (columnAggregations) => ({ columnAggregations }),
    },
    setColumnAggregations,
  ),
  [InfiniteTableActionType.SET_COLUMN_SHIFTS]: scope<any, number[] | null>(
    {
      get: (state) => state.columnShifts,
      set: (columnShifts) => ({ columnShifts }),
    },
    setColumnShifts,
  ),
  [InfiniteTableActionType.SET_DRAGGING_COLUMN_ID]: scope<any, string | null>(
    {
      get: (state) => state.draggingColumnId,
      set: (draggingColumnId) => ({ draggingColumnId }),
    },
    setDraggingColumnId,
  ),
} as Record<InfiniteTableActionType, InfiniteTableReducer<any>>;

export const reducer = <
  T,
  S extends InfiniteTableState<T>,
  A extends InfiniteTableAction,
>(
  state: S,
  action: A,
) => {
  const reducerFn = (
    reducersForActions as Record<
      InfiniteTableActionType,
      InfiniteTableReducer<T>
    >
  )[action.type];

  if (reducerFn) {
    return reducerFn(state, action);
  }

  return state;
};
