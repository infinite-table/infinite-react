import { InfiniteTableGroupColumnBase } from '../../components/InfiniteTable/types';
import { KeyOfNoSymbol } from '../../components/InfiniteTable/types/Utility';

export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

export type GroupBy<DataType, KeyType> = {
  field: KeyOfNoSymbol<DataType>; // TODO XOR valueGetter - // take valueGetter  groupBy.column.valueGetter if defined
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
  column?: Partial<InfiniteTableGroupColumnBase<DataType>>;
};
