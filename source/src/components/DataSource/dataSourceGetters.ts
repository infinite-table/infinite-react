import { DataSourceState } from '.';

export function getRowInfoAt<T>(
  rowIndex: number,
  getState: () => DataSourceState<T>,
) {
  return getState().dataArray[rowIndex];
}

export function getRowInfoArray<T>(getState: () => DataSourceState<T>) {
  return getState().dataArray;
}
