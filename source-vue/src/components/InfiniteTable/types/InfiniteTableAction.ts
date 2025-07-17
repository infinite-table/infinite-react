import { InfiniteTableActionType } from './InfiniteTableActionType';

export type InfiniteTableAction = {
  type: InfiniteTableActionType;
  payload?: any;
};
