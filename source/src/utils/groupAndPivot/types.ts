import { InfiniteTableGroupColumnBase } from '../../components/InfiniteTable/types';

export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

export type GroupBy<DataType, KeyType> = {
  field: keyof DataType;
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
  column?: Partial<InfiniteTableGroupColumnBase<DataType>>;
};
