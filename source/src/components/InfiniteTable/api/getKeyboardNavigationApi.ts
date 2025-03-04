import { DataSourceApi, DataSourceState } from '../../DataSource/types';
import { NonUndefined } from '../../types/NonUndefined';
import {
  computeNextActiveCellIndex,
  getNextEnabledRowIndex,
} from '../eventHandlers/keyboardNavigation';
import {
  InfiniteTableApi,
  InfiniteTableComputedValues,
  InfiniteTableProps,
  InfiniteTableState,
} from '../types';
import { InfiniteTableActions } from '../types/InfiniteTableState';

type CellNavigationConfig = {
  direction: 'top' | 'bottom' | 'left' | 'right';
};
export interface InfiniteTableKeyboardNavigationApi<T> {
  setKeyboardNavigation: (
    keyboardNavigation: NonUndefined<
      InfiniteTableProps<T>['keyboardNavigation']
    >,
  ) => void;

  setActiveCellIndex: (
    activeCellIndex: NonUndefined<InfiniteTableProps<T>['activeCellIndex']>,
  ) => void;
  setActiveRowIndex: (
    activeRowIndex: NonUndefined<InfiniteTableProps<T>['activeRowIndex']>,
  ) => void;

  gotoNextRow: () => number | false;
  gotoPreviousRow: () => number | false;
  gotoRow: (direction: 1 | -1) => number | false;

  gotoCell: (config: CellNavigationConfig) => false | [number, number];
}

export type GetKeyboardNavigationApiParam<T> = {
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
  actions: InfiniteTableActions<T>;
};

class KeyboardNavigationApi<T>
  implements InfiniteTableKeyboardNavigationApi<T>
{
  param: GetKeyboardNavigationApiParam<T>;
  constructor(param: GetKeyboardNavigationApiParam<T>) {
    this.param = param;
  }

  setKeyboardNavigation(
    keyboardNavigation: NonUndefined<
      InfiniteTableProps<T>['keyboardNavigation']
    >,
  ) {
    this.param.actions.keyboardNavigation = keyboardNavigation;
  }

  setActiveCellIndex(
    activeCellIndex: NonUndefined<InfiniteTableProps<T>['activeCellIndex']>,
  ) {
    this.param.actions.activeCellIndex = activeCellIndex;
  }

  setActiveRowIndex(
    activeRowIndex: NonUndefined<InfiniteTableProps<T>['activeRowIndex']>,
  ) {
    this.param.actions.activeRowIndex = activeRowIndex;
  }

  private gotoRowWithDirection(direction: 1 | -1) {
    const { getDataSourceState, getState } = this.param;
    const { activeRowIndex, keyboardNavigation } = getState();

    if (keyboardNavigation !== 'row') {
      console.error('Keyboard navigation is not enabled for rows');
      return false;
    }

    if (activeRowIndex == null) {
      return false;
    }
    const newActiveRowIndex = getNextEnabledRowIndex(
      getDataSourceState,
      activeRowIndex,
      direction,
    );

    if (newActiveRowIndex !== activeRowIndex) {
      this.param.actions.activeRowIndex = newActiveRowIndex;
      return newActiveRowIndex;
    }

    return false;
  }

  gotoRow(direction: 1 | -1) {
    return this.gotoRowWithDirection(direction);
  }
  gotoNextRow() {
    return this.gotoRow(1);
  }
  gotoPreviousRow() {
    return this.gotoRow(-1);
  }

  gotoCell(config: CellNavigationConfig) {
    const { direction } = config;
    const key =
      direction == 'top'
        ? 'ArrowUp'
        : direction == 'bottom'
        ? 'ArrowDown'
        : direction == 'left'
        ? 'ArrowLeft'
        : 'ArrowRight';

    const activeCellIndex = computeNextActiveCellIndex(this.param, {
      key,
      shiftKey: false,
    });

    if (activeCellIndex === false) {
      return false;
    }

    this.param.actions.activeCellIndex = activeCellIndex;

    return activeCellIndex;
  }
}

export function getKeyboardNavigationApi<T>(
  param: GetKeyboardNavigationApiParam<T>,
): InfiniteTableKeyboardNavigationApi<T> {
  return new KeyboardNavigationApi<T>(param);
}
