type DataLoaderCurrentState = 'idle' | 'loading';

type DataLoaderOptions<
  T_DATA_TYPE,
  T_FILTER_VALUE,
  T_GROUP_BY_INFO,
  T_REFETCH_KEY,
  T_SORT_INFO,
> = {
  getLoaderParams: () => DataLoader.Params<
    T_DATA_TYPE,
    T_FILTER_VALUE,
    T_GROUP_BY_INFO,
    T_REFETCH_KEY,
    T_SORT_INFO
  >;
};

export class DataLoader<
  T_DATA_TYPE,
  T_FILTER_VALUE,
  T_GROUP_BY_INFO,
  T_REFETCH_KEY,
  T_SORT_INFO,
> {
  currentState: DataLoaderCurrentState = 'idle';
  options: DataLoaderOptions<
    T_DATA_TYPE,
    T_FILTER_VALUE,
    T_GROUP_BY_INFO,
    T_REFETCH_KEY,
    T_SORT_INFO
  >;

  constructor(
    options: DataLoaderOptions<
      T_DATA_TYPE,
      T_FILTER_VALUE,
      T_GROUP_BY_INFO,
      T_REFETCH_KEY,
      T_SORT_INFO
    >,
  ) {
    this.options = options;
  }

  load = (
    _params: DataLoader.Params<
      T_DATA_TYPE,
      T_FILTER_VALUE,
      T_GROUP_BY_INFO,
      T_REFETCH_KEY,
      T_SORT_INFO
    >,
  ) => {
    return Promise.resolve([] as T_DATA_TYPE[]);
  };
}
declare namespace DataLoader {
  type Params<
    T_DATA_TYPE,
    T_FILTER_VALUE,
    T_GROUP_BY_INFO,
    T_REFETCH_KEY,
    T_SORT_INFO,
  > = {
    sortInfo?: T_SORT_INFO;
    groupBy?: T_GROUP_BY_INFO;
    filterValue?: T_FILTER_VALUE;
    refetchKey?: T_REFETCH_KEY;
  };
}
