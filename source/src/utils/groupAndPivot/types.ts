import { InfiniteTableGroupColumnBase } from '../../components/InfiniteTable/types';
import {
  AllXOR,
  KeyOfNoSymbol,
} from '../../components/InfiniteTable/types/Utility';

export type ValueGetterParams<T> = {
  data: T;
  field?: keyof T;
};
export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

export type GroupByValueGetter<T> = (params: ValueGetterParams<T>) => any;

export type GroupBy<DataType, KeyType = any> = {
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
  column?: Partial<InfiniteTableGroupColumnBase<DataType>>;
} & AllXOR<
  [
    {
      field: KeyOfNoSymbol<DataType>;
    },
    {
      valueGetter: GroupByValueGetter<DataType>;
      field: KeyOfNoSymbol<DataType>;
    },
    {
      valueGetter: GroupByValueGetter<DataType>;
      field?: KeyOfNoSymbol<DataType>;
      groupField: string;
    },
  ]
>;
