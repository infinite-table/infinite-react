import * as React from 'react';

import {
  DataSourceData,
  DataSourceDataParams,
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',

    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Rob',
    lastName: 'Boston',
    country: 'USA',

    city: 'LA',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    canDesign: 'no',
    salary: 10000,
    hobby: 'sports',
  },
];

// todo support column type as array or as null - if undefined, `default` will be used
// column.type = null or  [] will discard the default
// column.type = 'custom' // will not have default applied
// column.type = ['custom'] // will not have default applied
// column.type = ['custom','xxx'] // will  have xxx applied last
// column.type = ['custom','default'] // will have default applied last
export const columns: Record<string, InfiniteTableColumn<Developer>> = {
  id: { field: 'id', type: 'custom-number' },
  country: {
    field: 'country',
  },
  city: { field: 'city' },

  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
};

const dataSource = () => developers;

const sinon = require('sinon');

const onDataParamsChange = sinon.spy(
  (dataParams: DataSourceDataParams<Developer>) => {
    console.log('onDataParamsChange!!!', dataParams);
  },
);

(globalThis as any).onDataParamsChange = onDataParamsChange;

const App = () => {
  const [currentData, setData] =
    React.useState<DataSourceData<Developer>>(dataSource);

  const [renderCount, setRenderCount] = React.useState(0);
  const [filterFn, setFilterFn] = React.useState(() => () => true);

  (globalThis as any).filterFn = filterFn;

  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setData(dataSource.bind({}));
          setRenderCount((c) => c + 1);
        }}
      >
        UPDATE data function
      </button>

      <button
        onClick={() => {
          setFilterFn(() => () => true);
          setRenderCount((c) => c + 1);
        }}
      >
        UPDATE filter function
      </button>
      <p style={{ background: 'black', color: 'white' }}>
        render count {renderCount} - fn calls{' '}
        {onDataParamsChange.getCalls?.().length}
      </p>
      <DataSource<Developer>
        primaryKey="id"
        data={currentData}
        defaultSortInfo={[]}
        onDataParamsChange={onDataParamsChange}
        filterFunction={filterFn}
      >
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              height: '90vh',
              width: '95vw',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          onReady={({ api }: { api: InfiniteTableApi<Developer> }) => {
            (globalThis as any).api = api;
          }}
          columnMinWidth={150}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
