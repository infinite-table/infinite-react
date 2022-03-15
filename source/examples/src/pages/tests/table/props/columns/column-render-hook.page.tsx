import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

function Cmp({ value }: { value: string }) {
  const [ticker, setTicker] = React.useState(0);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTicker((ticker) => ticker + 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ticker]);

  const onClick = React.useCallback((event) => {
    console.log('clicked', event.target);
    setTicker(0);
  }, []);

  return (
    <div>
      {value} {ticker} <button onClick={onClick}>click test</button>
    </div>
  );
}

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
  ['id', { field: 'id' }],
  [
    'firstName',
    {
      field: 'firstName',
      renderValue: ({ value }) => {
        return <Cmp value={value as string} />;
      },
    },
  ],
  ['preferredLanguage', { field: 'preferredLanguage' }],
  ['stack', { field: 'stack' }],
  ['country', { field: 'country' }],
  ['canDesign', { field: 'canDesign' }],
  ['hobby', { field: 'hobby' }],
  ['city', { field: 'city' }],
  ['age', { field: 'age' }],
  ['salary', { field: 'salary', type: 'number' }],
  ['currency', { field: 'currency' }],
]);

const domProps = {
  style: {
    height: '80vh',
  },
};

export default function GroupByExample() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      defaultGroupBy={[
        {
          field: 'stack',
        },
      ]}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        columnPinning={{
          id: 'start',
          'group-by-stack': 'start',
        }}
        columnDefaultWidth={200}
        pivotTotalColumnPosition="end"
      />
    </DataSource>
  );
}
