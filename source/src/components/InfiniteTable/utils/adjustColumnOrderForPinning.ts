import {
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnPinning,
} from '../types/InfiniteTableProps';

const order = ['start', undefined, 'end'];
export const adjustColumnOrderForPinning = (
  columnOrder: InfiniteTablePropColumnOrderNormalized,
  columnPinning: InfiniteTablePropColumnPinning,
) => {
  if (columnPinning && Object.keys(columnPinning).length > 0) {
    // make sure pinned columns are coming first
    columnOrder.sort((colId1: string, colId2: string) => {
      let p1 = columnPinning[colId1];
      let p2 = columnPinning[colId2];

      if (p1 === true) {
        p1 = 'start';
      }

      if (p2 === true) {
        p2 = 'start';
      }

      if (p1 == p2) {
        return 0;
      }

      return order.indexOf(p1) - order.indexOf(p2);
    });
  }
  return columnOrder;
};
