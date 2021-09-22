import {
  DataSourceSingleSortInfo,
  DataSourceSortInfo,
} from '@infinite-table/infinite-react';
import {
  getComponentStateRoot,
  useComponentState,
} from '@src/components/hooks/useComponentState';

type Person = {
  age: number;
  name: string;
};
export type SortInfoCmpProps = {
  sortInfo?: DataSourceSortInfo<Person>;
  defaultSortInfo?: DataSourceSortInfo<Person>;
  onSortInfoChange?: (sortInfo: DataSourceSortInfo<Person>) => void;
};

type SortInfoState = {
  sortInfo: DataSourceSingleSortInfo<Person>[];
};

function normalizeSortInfo(
  sortInfo: DataSourceSortInfo<Person>,
): DataSourceSingleSortInfo<Person>[] {
  sortInfo = sortInfo ?? [];
  return Array.isArray(sortInfo) ? sortInfo : [sortInfo];
}

const SortInfoRoot = getComponentStateRoot({
  getInitialState: ({ props }: { props: SortInfoCmpProps }): SortInfoState => {
    const sortInfo = normalizeSortInfo(
      props.sortInfo ??
        props.defaultSortInfo ?? [
          {
            dir: 1,
            field: 'name',
          },
        ],
    );

    console.log('initial sortInfo', sortInfo);
    return {
      sortInfo,
    };
  },
});

export const SortInfoComponent = () => {
  const { componentState: state, componentActions: actions } =
    useComponentState<SortInfoState>();

  return (
    <div>
      value={`${JSON.stringify(state.sortInfo)}`}
      <button
        id="inner"
        onClick={() => {
          const currentSortInfo = state.sortInfo;
          actions.sortInfo = [
            {
              dir: -currentSortInfo[0].dir as 1 | -1,
              field: currentSortInfo[0].field,
            },
          ];
        }}
      >
        toggle
      </button>
    </div>
  );
};

export function SortInfoCmp(props: SortInfoCmpProps) {
  return (
    <SortInfoRoot {...props}>
      <SortInfoComponent />
    </SortInfoRoot>
  );
}
