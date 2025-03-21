import {
  DataSourceSingleSortInfo,
  DataSourceSortInfo,
} from '@infinite-table/infinite-react';
import {
  buildManagedComponent,
  useManagedComponentState,
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

const { ManagedComponentContextProvider: SortInfoRoot } = buildManagedComponent(
  {
    forwardProps: () => {
      return {
        sortInfo: (sortInfo: DataSourceSortInfo<Person>) =>
          normalizeSortInfo(
            sortInfo ?? [
              {
                dir: 1,
                field: 'name',
              },
            ],
          ),
      };
    },
  },
);

export const SortInfoComponent = () => {
  const { componentState: state, componentActions: actions } =
    useManagedComponentState<SortInfoState>();

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
