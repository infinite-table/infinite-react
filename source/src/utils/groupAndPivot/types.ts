import { InfiniteTableGroupColumnBase } from '../../components/InfiniteTable/types';
import {
  KeyOfNoSymbol,
  // XOR,
} from '../../components/InfiniteTable/types/Utility';

export type ValueGetterParams<T> = {
  data: T;
  field?: keyof T;
};
export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

export type GroupBy<DataType, KeyType> = {
  field: KeyOfNoSymbol<DataType>;
  valueGetter?: (params: ValueGetterParams<DataType>) => any;
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
  column?: Partial<InfiniteTableGroupColumnBase<DataType>>;
};
// & XOR<
//   {
//     field: KeyOfNoSymbol<DataType>;
//   },
//   {
//     field: KeyOfNoSymbol<DataType> | string;
//     valueGetter: (params: ValueGetterParams<DataType>) => any;
//   }
// >;
