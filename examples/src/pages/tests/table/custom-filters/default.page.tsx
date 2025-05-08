import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

// const dataSource: DataSourceData<Developer> = ({ filterValue }) => {
//   console.log(filterValue, '!!!');
//   return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`)
//     .then((r) => r.json())
//     .then((data: Developer[]) => data);
// };

import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';

import {
  DataTableFilter,
  useDataTableFilters,
} from '@/components/data-table-filter';

import { ClockIcon, PersonStanding } from 'lucide-react';
import developers100 from '../props/data/developers100';
import { FilterModel } from '@/components/data-table-filter/core/types';

const dataSource: DataSourceData<Developer> = () => {
  return developers100 as Developer[];
};

const gridColumns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age', type: 'number' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const dtf = createColumnConfigHelper<Developer>();

const columnsConfig = [
  dtf
    .text()
    .id('preferredLanguage')
    .accessor((row) => row.preferredLanguage)
    .displayName('Preferred Language')
    .icon(ClockIcon)
    .build(),
  dtf
    .number()
    .id('age')
    .accessor((row) => row.age)
    .displayName('Age')
    .icon(PersonStanding)
    .build(),
  dtf
    .option()
    .options([
      { label: 'frontend', value: 'frontend' },
      { label: 'backend', value: 'backend' },
      { label: 'full-stack', value: 'full-stack' },
    ])
    .accessor((row) => row.stack)
    .id('stack')
    .displayName('Stack')
    .icon(PersonStanding)
    .build(),
] as const;

const domProps: InfiniteTableProps<Developer>['domProps'] = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};
const operatorToInfiniteTable = {
  contains: (_filter: FilterModel) => {
    return {
      operator: 'includes',
    };
  },
  is: 'eq',
  // 'is between': 'between',
};
export default function App() {
  const [currentData, _setCurrentData] = React.useState<Developer[]>(
    developers100 as Developer[],
  );

  const { columns, filters, actions, strategy } = useDataTableFilters({
    strategy: 'client',
    data: currentData,
    columnsConfig,
  });

  console.log(filters);

  const dataSourceFilterValue = filters.map((filter) => {
    const mapper =
      operatorToInfiniteTable[
        filter.operator as keyof typeof operatorToInfiniteTable
      ];

    let f = {
      operator: 'eq',
      type: gridColumns[filter.columnId].type ?? 'string',
      //@ts-ignore
      value: filter.value,
    };
    if (typeof mapper === 'function') {
      f = { ...f, ...mapper(filter) };
    } else {
      f = { ...f, operator: mapper };
    }

    return {
      field: filter.columnId as keyof Developer,
      filter: f,
    };
  });
  return (
    <>
      <div className="flex gap-2">
        <DataTableFilter
          filters={filters}
          columns={columns}
          actions={actions}
          strategy={strategy}
        />
      </div>

      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          shouldReloadData={{
            filterValue: false,
          }}
          //@ts-ignore
          filterValue={dataSourceFilterValue}
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={150}
            columns={gridColumns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
