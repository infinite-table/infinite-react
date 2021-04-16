import { TablePropColumnPinning } from '../types';
import { TablePropColumnOrderNormalized } from '../types/TableProps';

const order = ['start', undefined, 'end'];
export const adjustColumnOrderForPinning = (
  columnOrder: TablePropColumnOrderNormalized,
  columnPinning: TablePropColumnPinning,
) => {
  if (columnPinning.size > 0) {
    // console.log('before', [...columnOrder]);
    // make sure pinned columns are coming first
    columnOrder.sort((colId1: string, colId2: string) => {
      let p1 = columnPinning.get(colId1);
      let p2 = columnPinning.get(colId2);

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
