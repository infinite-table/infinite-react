import {
  DataSourceSingleSortInfo,
  DataSourceSortInfo,
} from '@infinite-table/infinite-react';
import { useProperty } from '@src/components/hooks/useProperty';
import { useState } from 'react';

type Person = {
  age: number;
  name: string;
};
export type SortInfoCmpProps = {
  sortInfo?: DataSourceSortInfo<Person>;
  defaultSortInfo?: DataSourceSortInfo<Person>;
  onSortInfoChange?: (sortInfo: DataSourceSortInfo<Person>) => void;
};

function normalizeSortInfo(
  sortInfo: DataSourceSortInfo<Person>,
): DataSourceSingleSortInfo<Person>[] {
  sortInfo = sortInfo ?? [];
  return Array.isArray(sortInfo) ? sortInfo : [sortInfo];
}

export const SortInfoCmp = (props: SortInfoCmpProps) => {
  const [state, setState] = useState<DataSourceSingleSortInfo<Person>[]>([
    {
      dir: 1,
      field: 'name',
    },
  ]);

  const [sortInfo, setSortInfo] = useProperty('sortInfo', props, {
    normalize: normalizeSortInfo,
    fromState: () => state,
    setState: (sortInfo: DataSourceSingleSortInfo<Person>[]) =>
      setState(sortInfo),
  });
  return (
    <div>
      value={`${JSON.stringify(sortInfo)}`}
      <button
        id="inner"
        onClick={() => {
          setSortInfo({
            dir: -sortInfo[0].dir as 1 | -1,
            field: sortInfo[0].field,
          });
        }}
      >
        toggle
      </button>
    </div>
  );
};
