import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useMemo, useState } from 'react';

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

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export default () => {
  const [useCustomNameRender, setUseCustomNameRender] = useState(false);

  const columns = useMemo<InfiniteTablePropColumns<Developer>>(() => {
    return {
      firstName: {
        field: useCustomNameRender ? 'lastName' : 'firstName',
        defaultWidth: useCustomNameRender ? 500 : 200,
        render: useCustomNameRender
          ? ({ value }) => {
              return value + '!!!';
            }
          : undefined,
      },
      salary: {
        field: 'salary',
        type: 'number',
      },

      stack: { field: 'stack' },
    };
  }, [useCustomNameRender]);
  return (
    <>
      <button
        onClick={() => {
          setUseCustomNameRender((x) => !x);
        }}
      >
        toggle firstName with custom render
      </button>
      <React.StrictMode>
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: 500,
                width: 1000,
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
