import {
  InfiniteTable,
  DataSource,
  components,
  useInfiniteHeaderCell,
  type InfiniteTableColumn,
  type InfiniteTableProps,
  type InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const { CheckBox } = components;

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const HeaderCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef } = useInfiniteHeaderCell<Developer>();
  return (
    <div
      ref={domRef}
      {...props}
      className={`${props.className} bg-orange-500/30 hover:bg-orange-500/70 text-white'`}
    >
      {props.children}
    </div>
  );
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  age: {
    field: 'age',
    header: 'Age',
    type: 'number',
    defaultWidth: 100,
    renderValue: ({ value }) => value,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 150,
  },
  currency: { field: 'currency', header: 'Currency', defaultWidth: 120 },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'Programming Language',
  },

  canDesign: {
    defaultWidth: 135,
    field: 'canDesign',
    header: 'Design Skills',
    renderValue: ({ value }) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CheckBox
            defaultChecked={value === null ? null : value === 'yes'}
            domProps={{
              style: {
                marginRight: 10,
              },
            }}
          />
          {value === null ? 'Some' : value === 'yes' ? 'Yes' : 'No'}
        </div>
      );
    },
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  firstName: { field: 'firstName', header: 'First Name' },
  stack: { field: 'stack', header: 'Stack' },

  city: {
    field: 'city',
    header: 'City',
  },
};

const columnDefaults: InfiniteTablePropColumnTypes<Developer>['default'] = {
  className: ({ rowInfo }) => {
    const cls =
      rowInfo.indexInAll % 2 === 0 ? 'bg-orange-800/10' : 'bg-gray-700/30';

    // use the hover to make this specific cell more proeminent
    return `${cls} hover:bg-orange-900/90!`;
  },

  components: {
    HeaderCell,
  },
};

const columnTypes: InfiniteTableProps<Developer>['columnTypes'] = {
  default: columnDefaults,
  number: columnDefaults,
};

export default function App() {
  return (
    <DataSource<Developer> data={dataSource} primaryKey="id">
      <InfiniteTable<Developer>
        columnTypes={columnTypes}
        rowHoverClassName="bg-orange-900/70!"
        columns={columns}
        columnDefaultWidth={150}
      ></InfiniteTable>
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
