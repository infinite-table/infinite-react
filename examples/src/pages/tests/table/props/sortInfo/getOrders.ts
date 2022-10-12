import { multisort } from '@src/utils/multisort';
import { Order, orders } from './orders-dataset';

export type { Order };
export const getOrders = (): Order[] => JSON.parse(JSON.stringify(orders));

export { multisort };

export const mapToString = (orders: Order[], field: keyof Order): string[] =>
  orders.map((x) => `${x[field]}`);
